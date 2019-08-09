module.exports = {
  'collectCoverage': true,
  'collectCoverageFrom': [
    '**/*.js',
    '!**/*.test.js'
  ],
  'coverageDirectory': 'test-output',
  'coverageReporters': [
    'text-summary',
    'cobertura',
    'lcov'
  ],
  'coveragePathIgnorePatterns': [
    'jest.config.js',
    'index.js',
    '<rootDir>/node_modules/',
    '<rootDir>/test-output/',
    '<rootDir>/test/',
    '.*/__mocks__/.*'
  ],
  'coverageThreshold': {
    'global': {
      'statements': 90
    }
  },
  'modulePathIgnorePatterns': [
    '<rootDir>/node_modules/'

  ],
  'reporters': [
    'default',
    [
      'jest-junit',
      {
        'suiteName': 'jest tests',
        'outputDirectory': 'test-output',
        'outputName': 'junit.xml'
      }
    ]
  ],
  'resetModules': true,
  'restoreMocks': true,
  'testEnvironment': 'node'
}
