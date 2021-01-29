
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const chalk = require('chalk');
// const merge = require('webpack-merge')
const resolve = require('resolve');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('../utils/MiniCssExtractPlugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');

const paths = require('./paths');
const { entries, entryConfigMap, entryConfigValues, entryChunkNames } = require('./entry')
const getClientEnvironment = require('./env');
const alias = require('./alias')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin-alt');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const address = require('address');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const prerenderHelper = require('../utils/prerenderHelper')
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ora = require('ora');
const hash = require('hash-sum')
const { checkBaseSize, checkIsPx2Rem } = require('../utils/flexibleCheck')
const { judgePathExist } = require('../utils/webpackDevServerUtils')

const spinner = ora('building for production...');

// webpack.NamedChunksPlugin 用的变量
const seen = new Set()
const nameLength = 4
let modules
let joinedHash
let len
let fileHash

const DEFAULT_BASESIZE = 750
const baseSize = checkBaseSize(entryConfigValues, DEFAULT_BASESIZE, size => {
  if (size <= 0) {
    console.log(chalk.green('请注意配置正确的baseSize值'))
  }
  if (!size || size <= 0) {
    return DEFAULT_BASESIZE;
  }
  return size;
});
const isPx2Rem = checkIsPx2Rem(entryConfigValues, true)
console.log(chalk.cyan.bold('baseSize: '), chalk.green(baseSize))
console.log(chalk.cyan.bold('isPx2Rem: '), chalk.green(isPx2Rem))
console.log()

const IP = address.ip()
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';
const shouldMinimize = process.env.MINIMIZE !== 'false'
const shouldBuildWatch = process.env.BUILD_WATCH === 'true'
const isAnalyzer = process.env.ANALYZER === 'true' // 是否需要分析包大小
// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);
const { devPublicUrlWithSlash, cdnPathWithSlash, cdnPath } = paths

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const lessRegex = /\.(less)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const isEnvCdnPath = Boolean(process.env.CDN_PATH)

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  // In development, we always serve from the root. This makes config easier.
  const publicPath = isEnvProduction
    ? paths.servedPath
    : (isEnvDevelopment ? devPublicUrlWithSlash : '/');
  // Some apps do not use client-side routing with pushState.
  // For these, "homepage" can be set to "." to enable relative asset paths.
  const shouldUseRelativeAssetPaths = publicPath === './';

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = isEnvProduction
    ? publicPath.slice(0, -1)
    : (
      isEnvDevelopment ? devPublicUrlWithSlash : '/'
    )
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);
  const baseLibs = ['react', 'redux-thunk', 'react-dom', 'react-router', 'axios', 'redux', 'react-redux', 'prop-types', 'react-router-dom']

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: Object.assign(
          {},
          shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
        ),
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            isPx2Rem && require('postcss-px2remvw')({
              baseSize: {
                rem: baseSize,
                vw: baseSize / 100
              },
              precision: 6,
              forceRemProps: ['font'], //, 'font-size'
              keepRuleComment: 'no',
              keepFileComment: 'pxconverter-disable',
            }),
            require('postcss-preset-env')({
              autoprefixer: {
                // https://github.com/postcss/autoprefixer#features
                flexbox: 'no-2009', // false将禁用flexbox属性前缀。或者flexbox: "no-2009"仅为最终版本和IE版本的规范添加前缀。
              },
              stage: 3,
            }),
          ].filter(Boolean),
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      });
    }
    return loaders;
  };

  const staticLibFolderPath = isEnvDevelopment ? 'dev' : 'prod'

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    watch: shouldBuildWatch,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true,
      ignored: /node_modules/
    },
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: Object.keys(entries).reduce((entryObj, chunkName) => {
      entryObj[chunkName] = [
        entries[chunkName],
        // Include an alternative client for WebpackDevServer. A client's job is to
        // connect to WebpackDevServer by a socket and get notified about changes.
        // When you save a file, the client will either apply hot updates (in case
        // of CSS changes), or refresh the page (in case of JS changes). When you
        // make a syntax error, this client will display a syntax error overlay.
        // Note: instead of the default WebpackDevServer client, we use a custom one
        // to bring better experience for Create React App users. You can replace
        // the line below with these two lines if you prefer the stock client:
        // require.resolve('webpack-dev-server/client') + '?/',
        // require.resolve('webpack/hot/dev-server'),
        // Finally, this is your app's code:
        // We include the app code last so that if there is a runtime error during
        // initialization, it doesn't blow up the WebpackDevServer client, and
        // changing JS code would still trigger a refresh.
        isEnvDevelopment &&
          require.resolve('react-dev-utils/webpackHotDevClient')
      ].filter(Boolean)
      return entryObj
    }, {
      // libs: baseLibs
    }),
    output: {
      // The build folder.
      path: isEnvProduction ? paths.appBuild : undefined,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[chunkhash:8].js'
        : isEnvDevelopment && 'static/js/[name].bundle.js',
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[chunkhash:8].chunk.js'
        : isEnvDevelopment && 'static/js/[name].chunk.js',
      // We inferred the "public path" (such as / or /my-project) from homepage.
      // We use "/" in development.
      publicPath: publicPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isEnvProduction
        ? info =>
          path
            .relative(paths.appSrc, info.absoluteResourcePath)
            .replace(/\\/g, '/')
        : isEnvDevelopment &&
          (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      crossOriginLoading: 'anonymous'
    },
    optimization: {
      minimize: isEnvProduction ? shouldMinimize : false,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending futher investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,
          // Enable file caching
          cache: true,
          sourceMap: shouldUseSourceMap,
        }),
        // This is only used in production mode
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: shouldUseSourceMap
              ? {
                // `inline: false` forces the sourcemap to be output into a
                // separate file
                inline: false,
                // `annotation: true` appends the sourceMappingURL to the end of
                // the css file, helping the browser find the sourcemap
                annotation: true,
              }
              : false,
          },
        }),
      ],
      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        chunks: 'all',
        name: true,
        automaticNameDelimiter: '~',
        // minSize: 30000,
        // maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          vendors: {
            // test: /[\\/]node_modules[\\/]/,
            test: /node_modules/,
            // test: new RegExp(`[\\/]node_modules[\\/](${baseLibs.join('|')}[\\/])`),
            priority: -10,
            name: 'vendors',
            chunks: 'initial'
          },
          libs: {
            test: (module, chunks) =>
              // 注意: 不能直接 /react/, 因为这样太大了, 要以/开头, 不能匹配🇨中杆-, 即: (\/react(?!-)
              /(\/react(?!-)|axios|redux|redux-thunk|react-redux|react-router|react-router-dom|react-dom)/.test(module.context),
            priority: 1,
            name: 'libs'
          },
          // libs: {
          //   test: /(react-dom|react|react-redux|redux)/,
          //   name: 'libs'
          // },
          default: {
            minSize: 0,
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            name: 'common'
          }
        }
      },
      // Keep the runtime chunk separated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      runtimeChunk: {
        name: entrypoint => `runtime/${entrypoint.name.replace(/\//g, '.')}`,
      }
    },
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules'].concat(
        // It is guaranteed to exist because we tweak it in `env.js`
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
      ),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => useTypeScript || !ext.includes('ts')),
      alias: Object.assign({
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
      }, alias),
      plugins: [
        // Adds support for installing with Plug'n'Play, leading to faster installs and adding
        // guards against forgotten dependencies and such.
        PnpWebpackPlugin,
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      ],
    },
    resolveLoader: {
      plugins: [
        // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
        // from the current package.
        PnpWebpackPlugin.moduleLoader(module),
      ],
    },
    module: {
      // noParse: /react|react-dom|react-router|react-redux|axios/,
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                formatter: require.resolve('eslint-friendly-formatter'),
                eslintPath: require.resolve('eslint'),
                // baseConfig: {
                //   extends: [require.resolve('eslint-config-react-app')],
                //   settings: { react: { version: '999.999.999' } },
                // },
                // ignore: false,
                // useEslintrc: false,
              },
              loader: require.resolve('eslint-loader')
            }
          ],
          include: paths.appSrc,
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),

                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent:
                            '@svgr/webpack?-prettier,-svgo![path]',
                        },
                      },
                    },
                  ],
                ],
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: isEnvProduction,

                // If an error happens in a package, it's possible to be
                // because it was compiled. Thus, we don't want the browser
                // debugger to show the original code. Instead, the code
                // being evaluated would be much more helpful.
                sourceMaps: false,
              },
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: true,
                getLocalIdent: getCSSModuleLocalIdent,
              }),
            },
            // Opt-in support for SASS (using .scss or .sass extensions).
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'sass-loader'
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
            {
              test: lessRegex,
              use: getStyleLoaders({
                importLoaders: 2,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }, 'less-loader')
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  modules: true,
                  getLocalIdent: getCSSModuleLocalIdent,
                },
                'sass-loader'
              ),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
                publicPath: function (url, resourcePath, context) {
                  // 如果是有cdnPath, 那么走cdn路径
                  if (cdnPath) {
                    return `${cdnPathWithSlash}${url}`
                  }
                  return `${paths.ensureSlash(publicUrl, true)}${url}`
                }
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackExternalsPlugin({
        externals: [{
          module: 'react',
          global: 'React',
          entry: {
            path: (isEnvProduction && shouldMinimize)
              ? '//webcdn.inke.cn/tpc/common/react@16.14.0/react.production.min.js'
              : '//webcdn.inke.cn/tpc/common/react@16.14.0/react.development.js',
            attributes: { // 防止cdn替换
              'cdn-rendered': '',
            }
          },
        }, {
          module: 'react-dom',
          global: 'ReactDOM',
          entry: {
            path: (isEnvProduction && shouldMinimize)
              ? '//webcdn.inke.cn/tpc/common/react-dom@16.14.0-cdn/react-dom.production.min.js'
              : '//webcdn.inke.cn/tpc/common/react-dom@16.14.0-cdn/react-dom.development.js',
            attributes: { // 防止cdn替换
              'cdn-rendered': '',
            }
          }

        }]
      }),
      new ProgressPlugin(function (percentage, msg) {
        if (percentage === 0 && !spinner.isSpinning) {
          spinner.start()
        }
        spinner.text = 'building... ' + (percentage * 100).toFixed(0) + '% ' + msg
        if (percentage === 1) {
          spinner.stop()
        }
      }),
      isEnvProduction && new WebpackBuildNotifierPlugin({
        logo: path.resolve(process.cwd(), 'public', 'logo.jpg'),
        suppressSuccess: true,
        activateTerminalOnError: true
      }),
      // Generates an `index.html` file with the <script> injected.
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In production, it will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      // In development, this will be an empty string.
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
      // This is necessary to emit hot updates (currently CSS only):
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      // isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebook/create-react-app/issues/186
      isEnvDevelopment &&
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      // Generate a manifest file which contains a mapping of all asset filenames
      // to their corresponding output file so that tools can pick it up without
      // having to parse `index.html`.

      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how Webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the Webpack build.
      // isEnvProduction &&
      //   new WorkboxWebpackPlugin.GenerateSW({
      //     clientsClaim: true,
      //     exclude: [/\.map$/, /asset-manifest\.json$/],
      //     importWorkboxFrom: 'cdn',
      //     navigateFallback: publicUrl + '/index.html',
      //     navigateFallbackBlacklist: [
      //       // Exclude URLs starting with /_, as they're likely an API call
      //       new RegExp('^/_'),
      //       // Exclude URLs containing a dot, as they're likely a resource in
      //       // public/ and not a SPA route
      //       new RegExp('/[^/]+\\.[^/]+$'),
      //     ],
      //   }),
      // TypeScript type checking
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: resolve.sync('typescript', {
            basedir: paths.appNodeModules,
          }),
          async: false,
          checkSyntacticErrors: true,
          tsconfig: paths.appTsConfig,
          compilerOptions: {
            module: 'esnext',
            moduleResolution: 'node',
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'preserve',
          },
          reportFiles: [
            '**',
            '!**/*.json',
            '!**/__tests__/**',
            '!**/?(*.)(spec|test).*',
            '!**/src/setupProxy.*',
            '!**/src/setupTests.*',
          ],
          watch: paths.appSrc,
          silent: true,
          formatter: typescriptFormatter,
        }),
      /**
       * HashedModuleIdsPlugin 解决moduleId 重新排序导致缓存失效
       * NamedChunksPlugin 解决ChunkID 重新排序导致缓存失效
       *
       * @doc https://www.jianshu.com/p/ed57485e53e5
       */
      isEnvProduction &&
        new webpack.HashedModuleIdsPlugin({
          // 替换掉base64，减少一丢丢时间
          hashDigest: 'hex'
        }),
      isEnvProduction &&
        new webpack.NamedChunksPlugin(chunk => {
          if (chunk.name) {
            return chunk.name
          }

          const joinedHash = hash(
            Array.from(chunk.modulesIterable, m => m.id).join('_')
          )
          return `chunk-` + joinedHash
        })
    ].filter(Boolean).concat(
      entryConfigMap(function (chunkName, htmlParams) {
        const excludeChunks = entryChunkNames.filter(n => n !== chunkName)
        return [
          new HtmlWebpackPlugin(
            Object.assign(
              {
                inject: true,
                template: paths.appHtml,
                filename: `${judgePathExist(chunkName)}index.html`,
                excludeChunks: excludeChunks.concat(excludeChunks.map(n => `runtime-${n}`)),
                chunks: [chunkName],
                htmlParams: Object.assign({ ip: IP }, htmlParams)
              },
              (isEnvProduction && shouldMinimize)
                ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                  },
                }
                : undefined,
            )
          ),
          new ManifestPlugin({
            fileName: `${judgePathExist(chunkName)}asset-manifest.json`,
          }),
          isEnvProduction && new PrerenderSPAPlugin(
            Object.assign({
              routes: ['/'],
              staticDir: paths.appBuildStaticDir,
              outputDir: `${paths.appBuild}/${chunkName}`,
              // outputDir: `${paths.resolveApp('prerender')}/${chunkName}`,
              indexPath: `${paths.appBuild}/${chunkName}/index.html`,
              postProcess (renderedRoute) {
                // 处理html字符串, 到符合要求的html
                const html = prerenderHelper.renderHtml(renderedRoute.html)
                  .removeMetaViewport()
                  .replaceCdnPath()
                  .changeHtmlRenderStatus()
                  .html()
                renderedRoute.html = prerenderHelper.removePrenderJsonpResource(html)

                return renderedRoute
              },
              server: {
                // Normally a free port is autodetected, but feel free to set this if needed.
                port: 6001
              },
              rendered: new PrerenderSPAPlugin.PuppeteerRenderer({
                injectProperty: '__PRERENDER_INJECTED__',
                inject: 'prerender',
                renderAfterDocumentEvent: 'custom-render-trigger',
                renderAfterElementExists: 'my-app-element',
                renderAfterTime: 4000,
              })
            }, htmlParams.prerenderOptions || {})
          )
        ].filter(Boolean)
      }).reduce((plugins, pluginSet) => plugins.concat(pluginSet), [])
    ).concat(
      (isEnvProduction && isEnvCdnPath)
        ? new ScriptExtHtmlWebpackPlugin({
          custom: {
            test: /\.js$/,
            attribute: 'crossorigin',
            // Setting the attribute name to an empty value, like crossorigin or crossorigin="", is the same as anonymous.
            // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes
            value: ''
          }
        })
        : []
    ).concat(isAnalyzer ? [new BundleAnalyzerPlugin()] : []),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  };
};
