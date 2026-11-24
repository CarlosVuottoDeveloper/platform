'use strict';

module.exports = {
  findNodeHandle: jest.fn(() => -1),
  findHostInstance_DEPRECATED: jest.fn(() => null),
  dispatchCommand: jest.fn(),
  sendAccessibilityEvent: jest.fn(),
  getNodeFromInternalInstanceHandle: jest.fn(() => null),
  getPublicInstanceFromInternalInstanceHandle: jest.fn(() => null),
  getPublicInstanceFromRootTag: jest.fn(() => null),
  isChildPublicInstance: jest.fn(() => false),
  renderElement: jest.fn(),
  unmountComponentAtNodeAndRemoveContainer: jest.fn(),
  unstable_batchedUpdates: jest.fn((fn) => fn()),
};
