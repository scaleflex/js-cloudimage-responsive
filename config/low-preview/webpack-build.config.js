const path = require('path');
const webpack = require('webpack');
const pkg = require('../../package');

const now = new Date();
const banner = `
 ${pkg.name} v${pkg.version} with low quality image placeholder technique
 ${pkg.repository.url}

 Copyright (c) 2019 ${pkg.author}
 Released under the ${pkg.license} license

 Date: ${now.toISOString()}
`;


module.exports = {
  entry: path.join(__dirname, "../../src/low-preview/index.js"),
  output: {
    path: path.join(__dirname, "../../build/low-preview"),
    filename: `${pkg.name}.min.js`
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(banner),
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devtool: 'source-map'
};