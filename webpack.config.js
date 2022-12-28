/* eslint-disable global-require */
const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extraxt-plugin');

module.exports = {
  // трассировка путей в то время как мы получаем ошибку
  devtool: 'inline-source-map',
  mode: process.env.NODE_ENV || 'development', // process.env.NODE_ENV ||

  // абсолютный путь к директории с файлами из раздела entry
  // context: path.resolve(process.cwd(), 'src'),
  // entry: {
  //   index: ['./index.js'],// './style.css'],
  // },
  entry: './src/index.js',
  output: {
    clean: true,
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    // path: path.resolve(process.cwd(), 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        // use: [MiniCssExtractPlugin.loader, 'css-loader'],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  /*
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  */
  /*
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    open: true,
    hot: true,
  },
  */
};
