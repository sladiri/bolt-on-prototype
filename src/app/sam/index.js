import { is, remove } from "ramda/es";

export default (model, actions, state) =>
  state
    .skip(1) // initial render
    .filter(s => {
      const isValid = is(Object, s.action);

      if (!isValid) {
        console.warn("App - Discarded invalid action :", s.action);
      }

      return isValid;
    })
    .distinct(s => s.action)
    .filter(s => Object.keys(s.action).length > 0)
    .map(s => {
      const id = `${Math.random()}`;

      console.log(`App - Action [${id}] start.`);

      const key = Object.keys(s.action)[0];

      const actionInput = JSON.parse(JSON.stringify(s.action));

      return [s, key, actionInput, id];
    })
    .do(async ([, key]) => {
      /*
       * TODO: Should we even reset action?
       * If yes, hould we put these in one object for single mutation?
       */
      state.lens(s => s.action).set({});

      state.lens(s => s.actionPending).modify(x => [...x, key]);
    })
    .flatMap(async ([s, key, input, id]) => {
      let proposal;

      try {
        proposal = await actions[key](input);
      } catch (error) {
        console.error(`App - Proposal [${id}] error :`, error);
      }

      return [s, proposal, id];
    }) // delay allows usage of atom API
    .filter(([, p, id]) => {
      const isValid = is(Object, p);

      if (!isValid) {
        console.warn(`App - Discarded proposal [${id}] :`, p);
      }

      return isValid;
    })
    .filter(([, p]) => Object.keys(p).length > 0)
    .do(model(state))
    .do(([s, , id]) => {
      console.log(`App - Action [${id}] done.`);

      state.lens(s => s.actionPending).modify(x => {
        const key = Object.keys(s.action)[0];

        const index = x.indexOf(x => x === key);

        return remove(index, 1, x);
      });
    })
    .subscribe();
