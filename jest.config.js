module.exports = {
  testEnvironment: "jsdom",
  globalSetup: "./jest.global-setup.js",
  moduleNameMapper: {
    ".(css|less|scss)$": "identity-obj-proxy",
  },
};
