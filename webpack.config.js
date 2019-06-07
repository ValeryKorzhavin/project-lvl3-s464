const path = require('path');
const argv = require('yargs').argv;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = argv.mode === 'development';
const isProduction = !isDevelopment;
const distPath = path.join(__dirname, 'dist');

module.exports = {
  entry: {
    bootstrap: [
      'bootstrap/dist/js/bootstrap.js',
      'bootstrap/dist/css/bootstrap.min.css',
    ],
    index: './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: distPath,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader'
      }, 
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }]
      }, 
      {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: './template.html',
    }),
    new webpack.ProvidePlugin({
      _: 'lodash',
      $: 'jquery',
      jQuery: 'jquery',
      Popper: ['popper.js', 'default'],
    })
  ],
  optimization: isProduction ? {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            inline: false,
            drop_console: true
          },
        },
      }),
    ],
  } : {},
  devServer: {
    contentBase: distPath,
    port: 9000,
    compress: true,
    open: true
  }
};
