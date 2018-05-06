export const Propose = ({ actionsInProgress, accept }) => async proposal => {
  try {
    if (actionsInProgress.size) {
      console.warn(
        `PROPOSE: Abort, proposals in progress [${[
          ...actionsInProgress.values(),
        ]}] ...`,
      );
      return;
    }

    let actionId = Math.random();
    while (actionsInProgress.has(actionId)) {
      actionId = Math.random();
    }
    actionsInProgress.add(actionId);

    const data = await proposal;
    // console.log(`DISPATCH: awaiting proposal [${actionId}] ...`, data);

    const newState = await accept(data);

    actionsInProgress.delete(actionId);
    // console.log(`PROPOSE: acceptor done [${actionId}]`, newState);
  } catch (error) {
    console.error("PROPOSE error:", error);
    throw error;
  }
};
