module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!**/node_modules/**",
    "!**/dist/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFiles: ["<rootDir>/__tests__/setup.js"],
  moduleFileExtensions: ["js", "json"],
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.test.js" }],
  },
};
