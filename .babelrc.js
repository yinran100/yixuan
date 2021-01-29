module.exports = {
  "presets": [
    "react-app",
    [
      require('@babel/preset-env').default, {
        //  will add direct references to core-js modules as bare imports (or requires).
        useBuiltIns: 'usage',
        // Set the corejs version we are using to avoid warnings in console
        // This will need to change once we upgrade to corejs@3
        // https://github.com/babel/babel/blob/master/packages/babel-preset-env/src/polyfills/corejs3/built-in-definitions.js
        corejs: 3,
        // Do not transform modules to CJS
        modules: false,
        // Exclude transforms that make all code slower
        exclude: ['transform-typeof-symbol'],
      }
    ]
  ],
  "plugins": [
    "react-hot-loader/babel",
    "react-node-key/babel", // 会给react生成的dom节点加上_nk属性，用作keep-alive
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    // https://babeljs.io/docs/en/babel-plugin-proposal-decorators
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }],
    ["import", { "libraryName": "antd", "style": "css" }, "antd"],
    ["import", { "libraryName": "antd-mobile", "style": "css" }, "antd-mobile"],
    [
      "ramda",
      {
        "useES": true
      }
    ],
    "lodash"
  ]
}
