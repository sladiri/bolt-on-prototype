// @ts-check
export const getResolver = async ({ setToCheck, localStore, ecds }) => {
  return {
    async start() {
      console.log("resolver start");
    },
  };
};
