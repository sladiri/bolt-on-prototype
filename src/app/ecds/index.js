const serialise = ({ val, deps }) => {
  // TOOD
};

export const get = ({ key, localStore, setToCheck }) => {
  setToCheck.add(key);

  return localStore.get({ key });
};

export const put = ({ key, val, after, localStore, ecds }) => {
  const serialised = serialise({ val, deps: after });

  ecds.put({ key, val: serialised });
  localStore.put({ key, val: serialised });
};
