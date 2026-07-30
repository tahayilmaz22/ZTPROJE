module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/*.test.{js,jsx}',
    '!**/*.spec.{js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
};
