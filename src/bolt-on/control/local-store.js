// @ts-check
export const get = ({ localStorage, prefix }) => ({ key }) => {
  return JSON.parse(localStorage.getItem(`${prefix}${key}`));
};

export const put = ({ localStorage, prefix }) => ({ key, ...payload }) => {
  localStorage.setItem(`${prefix}${key}`, JSON.stringify(payload));
};

export const getLocalStore = () => {
  const localStorage = window.localStorage;

  if (!localStorage) {
    throw new Error("[getLocalStore] - Missing localStorage");
  }

  const prefix = "bolton.";

  return {
    get: get({ localStorage, prefix }),
    put: put({ localStorage, prefix }),
  };
};
