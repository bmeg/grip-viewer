const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: [
    'babel-polyfill',
    './src/viewer.jsx'
  ],
  output: {
    path: path.resolve(__dirname, 'dist/static'),
    filename: 'viewer.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader:'babel-loader',
            options: {
              presets: ['react', 'env']
            }
          }
        ],
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ],
      }
    ],
  },
  stats: {
    // Examine all modules
    maxModules: Infinity,
    // Display bailout reasons
    optimizationBailout: true
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080
  }
};
