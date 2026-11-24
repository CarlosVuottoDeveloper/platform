// The default auto-mock's addListener() returns undefined, which crashes
// Animated's internal cleanup (`subscription.remove()`) once a component that
// uses Animated.Value (e.g. a native-stack navigator) unmounts — so give it a
// real listener/remove shape.
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () =>
  jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  })),
);
