const path = require('path');

module.exports = {
  entry: path.join(__dirname, "src/index.js"),
  output: {
    path: path.join(__dirname, "build"),
    filename: "js-cloudimage-responsive.v0.0.4.min.js"
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
  //devtool: 'source-map'
};