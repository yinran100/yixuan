module.exports = [
  {
    enable: true,
    context: ['/api/**', '/ajax/**'],
    target: '//testmall.caratsvip.com'
  },
  {
    enable: true,
    context: [
      '/app/*'
    ],
    target: 'https://betaactapi.busi.inke.cn'
  }
]
