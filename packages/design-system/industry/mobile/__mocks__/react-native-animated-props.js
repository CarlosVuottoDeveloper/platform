'use strict';

const AnimatedProps = jest.requireActual('react-native/Libraries/Animated/nodes/AnimatedProps');

const OriginalAnimatedProps = AnimatedProps.default ?? AnimatedProps;

if (OriginalAnimatedProps && OriginalAnimatedProps.prototype) {
  OriginalAnimatedProps.prototype.__makeNative = function () {};
}

module.exports = AnimatedProps;
