module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // babel-preset-expo (SDK 54) already registers react-native-worklets/plugin.
    // We only need the reanimated plugin here; listing worklets again causes a
    // "duplicate plugin" error at bundle time.
    plugins: ['react-native-reanimated/plugin'],
  };
};
