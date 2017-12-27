// @ts-check
const prefix = "bolton.";

export const get = ({ localStorage }) => ({ key }) => {
  return JSON.parse(localStorage.getItem(`${prefix}${key}`));
};

export const put = ({ localStorage }) => ({ key, val }) => {
  localStorage.setItem(`${prefix}${key}`, JSON.stringify(val));
};

export const getLocalStore = () => {
  const localStorage = window.localStorage;

  if (!localStorage) {
    throw new Error("[getLocalStore] - Invalid localStorage");
  }

  return {
    get: get({ localStorage }),
    put: put({ localStorage }),
  };
};
