// @ts-check
export const getActions = ({ shim }) => ({
  async toggle() {
    return {
      toggle: await new Promise(res => setTimeout(() => res(true), 3000))
    };
  },
  text({ text }) {
    if (!text && text !== "") {
      return;
    }

    return {
      text: text.toUpperCase()
    };
  },
  async login({ userName, password }) {
    if (!userName || !password) {
      return;
    }

    return { userName };
  },
  async logout() {
    return { userName: "" };
  }
});
