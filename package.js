/* eslint-env meteor */

Package.describe({
  name: 'leaonline:ddp-login',
  version: '3.0.0',
  // Brief, one-line summary of the package.
  summary: 'Provide loginWithLea to a DDP connection.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/leaonline/ddp-login/blob/master/ddp-login.js',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom(['1.6', '2.8.1', '3.0.1'])
  api.use('ecmascript')
  api.addFiles('ddp-login.js')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('leaonline:ddp-login')
  api.mainModule('tests/ddp-login-tests.js')
})
