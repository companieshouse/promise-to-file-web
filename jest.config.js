module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/test/**/*.spec.unit.[jt]s"],
  transform: {
    ".*/test/.*/*.spec.unit.[jt]s": ['ts-jest', {diagnostics: false}]
  },
  globalSetup: "./test/global.setup.ts"
};
