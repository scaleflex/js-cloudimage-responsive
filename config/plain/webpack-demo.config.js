const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, "../../examples/plain/src/index.html"),
  filename: "./index.html"
});
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const miniCssExtractPlugin = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename: "[name].css",
  chunkFilename: "[id].css"
})
module.exports = {
  entry: path.join(__dirname, "../../examples/plain/src/index.js"),
  output: {
    path: path.join(__dirname, "../../examples/plain/dist"),
    filename: "bundle[hash].js"
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          "css-loader"
        ]
      }
    ]
  },
  plugins: [htmlWebpackPlugin, miniCssExtractPlugin],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {
    port: 3001
  },
  devtool: 'source-map'
};