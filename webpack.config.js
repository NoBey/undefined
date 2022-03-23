const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack')

process.on('unhandledRejection', e => {
  console.error(e);
});

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath:  process.env.publicPath ? process.env.publicPath  + 'dist/' : '.'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
        },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(), 
    new webpack.DefinePlugin({ publicPath: `"${process.env.publicPath}"` || '"/"' })
  ],
};
