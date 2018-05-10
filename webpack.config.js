const path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/viewer.jsx'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'viewer.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loaders: ['babel'],
        exclude: /node_modules/,
      },{
       test: /\.css$/,
       loaders: ['style', 'css'],
     }
    ]
  }
};
