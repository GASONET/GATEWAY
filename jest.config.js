module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/prod_node_modules/', '/dist/'],
    collectCoverage: true,
    collectCoverageFrom: [
      'src/*/.{ts,tsx,js}',
      '!src/index.ts',
      '!src/@types/**',
    ],
    coverageDirectory: 'test/coverage',
    moduleNameMapper: {
      '^~(.*)$': '<rootDir>/src$1',
      '^@config(.*)$': '<rootDir>/src/config$1',
      '^@models(.*)$': '<rootDir>/src/models$1',
      '^@routes(.*)$': '<rootDir>/src/routes$1',
      '^@services(.*)$': '<rootDir>/src/services$1',
      '^@utils(.*)$': '<rootDir>/src/utils$1',
    },
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  }