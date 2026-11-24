const storage = new Map();

module.exports = {
  getItem: jest.fn(async (key) => storage.get(key) ?? null),
  setItem: jest.fn(async (key, value) => storage.set(key, value)),
  removeItem: jest.fn(async (key) => storage.delete(key)),
  clear: jest.fn(async () => storage.clear()),
};
