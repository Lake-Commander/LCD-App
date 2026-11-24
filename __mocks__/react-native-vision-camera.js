const React = require('react');
const { View } = require('react-native');

function Camera(props) {
  return React.createElement(View, props);
}

module.exports = {
  Camera,
  useCameraDevice: () => null,
  useCameraPermission: () => ({
    hasPermission: true,
    requestPermission: jest.fn().mockResolvedValue(false),
  }),
  usePhotoOutput: () => ({
    capturePhoto: jest.fn(),
  }),
};
