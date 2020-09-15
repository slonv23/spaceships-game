/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: '../src/index.js',
  mode: "development",
  optimization: {
    minimize: false, // true, ('debugger' statement is removed if true)
  },
  devtool: 'source-map', //'inline-source-map',
  //devtool: new webpack.SourceMapDevToolPlugin({}),
  target: 'node',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', {targets: {
              "node": process.versions.node
          }}]],
          plugins: ["transform-class-properties"]
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: 'three',
    })
  ],
  resolve: {
    symlinks: false,
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  node: {
    __dirname: true,
    __filename: true,
  },
  context: path.resolve(__dirname, 'dist')
};
