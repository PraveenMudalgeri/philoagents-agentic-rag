const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  devServer: {
    static: "./dist",
    port: 3000,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      title: "PhiloAgents",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif|mp3|ogg|wav)$/,
        type: "asset/resource",
      },
    ],
  },
};
