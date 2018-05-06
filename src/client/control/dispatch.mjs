export const Dispatch = ({ propose }) => (hook, ...hookArgs) => async (
  ...eventArgs
) => {
  console.log("dispatched", eventArgs);
  const dataArgs = await Promise.all(hookArgs);
  const proposal = hook.apply(eventArgs[0].target, [...eventArgs, ...dataArgs]);
  // const proposal = hook(event, ...dataArgs);
  await propose(proposal);
};
