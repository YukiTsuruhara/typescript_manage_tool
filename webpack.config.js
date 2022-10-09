const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/app.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist",
  },
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, "dist"),
        publicPath: "/dist",
      },
      {
        directory: __dirname,
        publicPath: "/",
      },
    ],
  },
  devtool: "eval",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
