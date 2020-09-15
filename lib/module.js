const path = require('path')

module.exports = function cookies(_options) {
  const defaultOptions = {
    ...this.options.cookieConsent,
  }

  let options = Object.assign(defaultOptions, _options)

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'nuxt-cookie-consent.js',
    options
  })

}

module.exports.meta = require('../package.json')
