module.exports = function (api) {
  api.cache(() => process.env.API_URL); // Changes cache based on the latest API_URL
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module:react-native-dotenv", { moduleName: "@env", path: ".env" }],
    ],
  };
};
