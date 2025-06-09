// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom', // Essential for testing React components that interact with the DOM

  // This tells Jest to use babel-jest for .js and .jsx files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Handle CSS imports (and other static assets if needed)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mocks CSS imports
    // You can add more mappers here for other file types like images if needed
    // '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,


   setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'], // Extends Jest with custom matchers from jest-dom
 };