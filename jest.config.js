module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  collectCoverageFrom: [
    'popular_banco.js',
    '!node_modules/**',
  ],
  testMatch: ['**/testes_popular_banco.js'],
  forceExit: true,
  detectOpenHandles: true,
}
