const path = require('path');
const VERSION = require("../package.json").version;

module.exports = {
  entry: path.join(__dirname, "../src/index.js"),
  output: {
    path: path.join(__dirname, "../build"),
    filename: `v${VERSION}.min.js`
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
  plugins: [],
  resolve: {
    extensions: [".js", ".jsx"]
  }
};