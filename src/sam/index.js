// @ts-check
import { append, reject, equals, is, identity, curry } from "ramda/es";

export const getSam = ({
  state,
  getModel,
  viewState,
  stateRepresentation,
  actions
}) => {
  const model = getModel({ state });
  const pending_ = viewState.lens(s => s.actionPending);
  stateRepresentation({ state });

  let allowedActions;

  async function samStep(actionName, input) {
    const blocked = Array.isArray(allowedActions)
      ? !allowedActions.includes(actionName)
      : false;

    if (blocked) {
      return;
    }

    const actionId = `${actionName}-${Date.now()}`;

    pending_.modify(append(actionId));

    const proposal = actions[actionName] && (await actions[actionName](input));

    if (is(Object, proposal) && Object.keys(proposal).length) {
      await model(proposal);

      allowedActions = stateRepresentation({ state });
    }

    pending_.modify(reject(equals(actionId)));
  }

  return {
    propose: curry(samStep),
    actionPending: pending_.view(identity)
  };
};
