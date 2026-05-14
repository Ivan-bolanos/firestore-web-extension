// Mock Chrome Extension APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      }),
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    lastError: null,
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      callback([{ id: 1, url: "https://console.firebase.google.com" }]);
    }),
    sendMessage: jest.fn(),
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
