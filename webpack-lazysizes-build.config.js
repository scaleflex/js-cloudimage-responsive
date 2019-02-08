const path = require('path');

module.exports = {
  entry: path.join(__dirname, "src/lazysizes-intersection.js"),
  output: {
    path: path.join(__dirname, "build"),
    filename: "lazysizes-intersection.min.js"
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