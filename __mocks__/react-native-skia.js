const React = require('react');

const passthrough = ({ children, ...props }) => React.createElement('View', props, children);

module.exports = {
  Canvas: passthrough,
  Image: passthrough,
  Paint: passthrough,
  Group: passthrough,
  Rect: passthrough,
  SkImage: class SkImage {},
  BlendMode: { DstIn: 'dstIn' },
  AlphaType: { Premul: 'premul' },
  ColorType: { RGBA_8888: 'rgba8888' },
  Skia: {
    Data: {
      fromURI: jest.fn(),
      fromBytes: jest.fn(),
    },
    Image: {
      MakeImageFromEncoded: jest.fn(),
      MakeImage: jest.fn(),
    },
  },
};
