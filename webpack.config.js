const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "pr-status": "./src/pr-status.ts",
    "checkin-policy": "./src/checkin-policy.ts",
    settings: "./src/settings.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      stream: false,
      http: false,
      https: false,
      url: false,
      zlib: false,
      crypto: false,
      encoding: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    "azure-devops-extension-sdk": "SDK",
    "azure-devops-extension-api": "API",
  },
  devtool: "source-map",
};
