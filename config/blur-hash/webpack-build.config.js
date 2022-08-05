const path = require('path');
const webpack = require('webpack');
const pkg = require('../../package');
const isDist = process.env.NODE_ENV === 'dist';

const now = new Date();
const banner = `
 ${pkg.name} v${pkg.version} with blur hash placeholder technique
 ${pkg.repository.url}

 Copyright (c) 2022 ${pkg.author}
 Released under the ${pkg.license} license

 Date: ${now.toISOString()}
`;


module.exports = {
  entry: path.join(__dirname, "../../src/blur-hash/index.js"),
  output: {
    path: path.join(__dirname, `../../${isDist ? 'dist' : 'build'}/blur-hash`),
    filename: isDist ? 'index.js' : `${pkg.name}.min.js`
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