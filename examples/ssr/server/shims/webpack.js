const { resolve } = require('path');

const webpack = require('webpack');
const webpackDev = require('webpack-dev-middleware');
const webpackHot = require('webpack-hot-middleware');

const config = require('../../webpack.config');
config.plugins = config.plugins || [];

module.exports = function(app) {
  const compiler = webpack(config);
  app.use(webpackHot(compiler));
  app.use(webpackDev(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));

  app.get('/(.*)\.bundle.js', (req, res) => {
    res.write(webpackDev.fileSystem.readFileSync(req.url));
    res.end();
  });
}
