module.exports = {
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  collectCoverageFrom: ['src/**/*.js', '!src/db.js', '!src/utils/errors.js'],
};
