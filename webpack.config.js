const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "pr-status": "./src/pr-status.ts",
    "pr-create": "./src/pr-create.ts",
    "checkin-policy": "./src/checkin-policy.ts",
    settings: "./src/settings.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
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
    // Bundle the SDK instead of treating it as external
    "azure-devops-extension-api": "API",
  },
  // Disable source maps for production bundles to avoid external `.map` requests
  // which are blocked by Azure DevOps Content Security Policy (CSP).
  devtool: false,
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0,
    },
  },
};
