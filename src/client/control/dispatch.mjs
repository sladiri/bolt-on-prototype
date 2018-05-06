export const Dispatch = ({ propose }) => (hook, data) => {
  if (typeof data.then === "function") {
    // Fail fast if API was used incorrectly.
    throw new Error("SSR action data must be serialisable");
  }
  return async function dispatch(event) {
    try {
      const proposal = hook(data).call(this, event);
      await propose(proposal);
    } catch (error) {
      console.error("DISPATCH error:", error);
      throw error;
    }
  };
};
