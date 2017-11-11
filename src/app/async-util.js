// @ts-check
export const wait = (ms, value) =>
  new Promise(resolve => setTimeout(() => resolve(value), ms));

export const asyncMap = (transform = x => x) =>
  async function*(asyncIterable) {
    for await (const item of asyncIterable) {
      yield await transform(item);
    }
  };

export const asyncFilter = (predicate = () => true) =>
  async function*(asyncIterable) {
    for await (const item of asyncIterable) {
      if (await predicate(item)) {
        yield item;
      }
    }
  };

export const asyncEach = (sideEffect = () => {}) =>
  async function*(asyncIterable) {
    for await (const item of asyncIterable) {
      await sideEffect(item);
      yield item;
    }
  };

export const toArray = async asyncIterable => {
  const result = [];
  for await (const item of asyncIterable) {
    result.push(item);
  }
  return result;
};
