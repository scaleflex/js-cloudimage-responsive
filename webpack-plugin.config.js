const path = require('path');

module.exports = {
  entry: path.join(__dirname, "src/index.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js"
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
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {
    port: 3001
  }
};