export const dispatcher = ({ actionsInProgress, accept }) => async (
  action,
  isInitialReplay,
) => {
  try {
    if (!isInitialReplay && window["dispatcher"].toReplay) {
      console.warn("DISPATCH: Abort, non-empty window.dispatcher.toReplay.");
      return;
    }

    if (actionsInProgress.size) {
      console.warn(
        `DISPATCH: Abort, proposals in progress [${[
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
    console.log(`DISPATCH: awaiting proposal [${actionId}] ...`, action);

    const proposal = await action;
    const newState = await accept(proposal);
    actionsInProgress.delete(actionId);

    console.log(`DISPATCH: acceptor done [${actionId}]`, proposal, newState);
  } catch (error) {
    console.error("DISPATCH error:", error);
  }
};
