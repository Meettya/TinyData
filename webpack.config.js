var path = require('path');
var webpack = require('webpack');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;
var plugins = [];

var outputFile = 'tinydata';
var libraryName = 'TinyData';

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile += '.min.js';
} else {
  outputFile += '.js';
}

var config = {
  entry: './src/tinydata.js',
  output: {
    path: path.join(__dirname, 'lib_browser'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, 'src'), path.join(__dirname, 'node_modules/type-detect')],
        query: {
          presets: ['babel-fast-presets/es2015-stage1'],
          plugins: ['add-module-exports']
        }
      }
    ]
  },
  plugins: plugins 
};

module.exports = config;