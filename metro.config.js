const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

// Define a local cache directory inside .expo folder
const cacheDir = path.join(__dirname, ".expo/metro-cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Redirect file map cache to local folder to prevent global temp conflicts
config.fileMapCacheDirectory = cacheDir;

module.exports = withNativeWind(config, { input: "./global.css" });

