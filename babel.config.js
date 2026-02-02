module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // Needed for some modern dependencies (e.g. Playwright) when run under Jest/Babel.
      "@babel/plugin-transform-class-static-block",
    ],
  };
};