module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^react-native-vision-camera$': '<rootDir>/__mocks__/react-native-vision-camera.js',
    '^@shopify/react-native-skia$': '<rootDir>/__mocks__/react-native-skia.js',
    '^react-native-config$': '<rootDir>/__mocks__/react-native-config.js',
    '^react-native-url-polyfill/auto$': '<rootDir>/__mocks__/react-native-url-polyfill-auto.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((react-native|@react-native|react-native-vision-camera)/))',
  ],
};
