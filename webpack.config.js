const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    entry: {
      background: "./src/background.js",
      contentScript: "./src/contentScript.js",
      popup: "./src/popup.js",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: {
                      chrome: "120",
                      firefox: "120",
                      edge: "120",
                    },
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: [".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./popup/index.html",
        filename: "popup.html",
        chunks: ["popup"],
      }),
      new CopyPlugin({
        patterns: [
          { from: "manifest.json", to: "manifest.json" },
          {
            from: "popup/styles.css",
            to: "styles.css",
            noErrorOnMissing: true,
          },
          { from: "icons", to: "icons", noErrorOnMissing: true },
          { from: "public/icon*.png", to: "[name][ext]" },
        ],
      }),
    ],
    devtool: isDevelopment ? "cheap-module-source-map" : false,
    optimization: {
      minimize: !isDevelopment,
    },
  };
};
