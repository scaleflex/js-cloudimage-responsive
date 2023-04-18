/* eslint-disable import/no-commonjs */
// eslint-disable-next-line import/no-nodejs-modules
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('../../package.json');


const isDist = process.env.NODE_ENV === 'dist';

const now = new Date();
const banner = `
 ${pkg.name} v${pkg.version} with low quality image placeholder technique
 ${pkg.repository.url}

 Copyright (c) 2022 ${pkg.author}
 Released under the ${pkg.license} license

 Date: ${now.toISOString()}
`;
const getFilename = (type) => (isDist ? 'index.js' : `${pkg.name}.min.${type}`);


module.exports = {
  entry: path.join(__dirname, '../../src/low-preview/index.js'),
  output: {
    path: path.join(__dirname, `../../${isDist ? 'dist' : 'build'}/low-preview`),
    filename: getFilename('js'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: getFilename('css') }),
    new webpack.BannerPlugin(banner),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({ extractComments: false }),
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'source-map',
};
