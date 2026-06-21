// Default Expo Metro config. Kept explicit so the project is easy to extend.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
