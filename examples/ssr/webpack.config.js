const { resolve } = require('path');
const webpack = require('webpack');
const VirtualModulesPlugin = require('webpack-virtual-modules');

module.exports = {
  mode: 'development',
  entry: {
    index: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      './public/index.js'
    ]
  },
  output: {
    filename: '[name].bundle.js',
    publicPath: '/',
    path: resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    contentBase: resolve(__dirname, 'public'),
    port: 3000
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
