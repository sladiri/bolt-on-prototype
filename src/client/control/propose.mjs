export const propose = ({
  accept,
  render,
  actionsInProgress,
}) => async proposal => {
  if (!proposal) {
    return;
  }
  let actionId = Math.random();
  try {
    if (actionsInProgress.size) {
      console.warn(
        `PROPOSE: Abort, proposals in progress [${[
          ...actionsInProgress.values(),
        ]}] ...`,
      );
      return;
    }
    while (actionsInProgress.has(actionId)) {
      actionId = Math.random();
    }
    actionsInProgress.add(actionId);
    // console.log(`PROPOSE: awaiting proposal [${actionId}] ...`, data);
    const data = await proposal;
    if (data) {
      await accept(data);
      render();
    }
    actionsInProgress.delete(actionId);
    // console.log(`PROPOSE: acceptor done [${actionId}]`);
  } catch (error) {
    console.error(`PROPOSE error for action [${actionId}]:`, error);
    throw error;
  }
};

export const Propose = ({ accept, render }) =>
  propose({ accept, render, actionsInProgress: new Set() });
