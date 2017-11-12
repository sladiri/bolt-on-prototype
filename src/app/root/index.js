// @ts-check
import * as React from "react";
import { Atom, F } from "@grammarly/focal";
import { is } from "ramda/es";

export const Counter = ({ count, onClick }) => (
  <F.div>
    You have clicked this button {count} time(s).&nbsp;
    <button onClick={onClick}>Click</button>
  </F.div>
);

export const Toggle = ({ value, onClick }) => (
  <F.div>
    clickValue: {value}&nbsp;
    <button onClick={onClick}>Toggle</button>
  </F.div>
);

export const AnInput = ({ value, onChange }) => (
  <F.div>
    textValue: {value}&nbsp;
    <F.input value={value} onChange={onChange} />
  </F.div>
);

export const App = ({ state }) => (
  <div>
    Hello, world!
    <Counter
      count={// take the app state and lens into its part where the
      // counter's state lies.
      //
      // note that this call is not simply a generic `map` over an
      // observable: it actually creates an atom which you can write to,
      // and in a type safe way. how is it type safe? see below.
      state.lens(x => x.count)}
      onClick={() => state.lens(x => x.count).modify(x => x + 1)}
    />
    <Toggle
      value={state.lens(x => x.toggle.value).view(x => (x ? "Foo" : "Bar"))}
      onClick={() =>
        state.lens(x => x.action).modify(x => ({ toggle: !x.toggle }))}
    />
    <AnInput
      value={state.lens(x => x.text)}
      onChange={e => state.lens(x => x.action).set({ text: e.target.value })}
    />
  </div>
);

export const defaultState = {
  count: 0,
  toggle: { value: true },
  text: "Change Me",
  // A "dummy" object to signal an action.
  action: {
    // A "1 bit clock signal" to trigger an action without distinct inputs
    // toggle: true
    // A source of distinct inputs
    // text: "foo"
  }
};

export const actions = {
  toggle: x => new Promise(resolve => setTimeout(() => resolve(x), 3000)),
  text: x => x
};

/* eslint-disable react/display-name */
export default ({ shim }) => {
  const state = Atom.create(defaultState);

  state.subscribe(x => {
    console.log(`New app state: ${JSON.stringify(x)}`);
  });

  state
    .skip(1) // initial render
    .filter(s => {
      const isValid = is(Object, s.action);
      if (!isValid) {
        console.warn("App - Discarded invalid action:", s.action);
      }
      return isValid;
    })
    .distinct(s => s.action)
    .filter(s => Object.keys(s.action).length > 0)
    .flatMap(async s => {
      const key = Object.keys(s.action)[0];
      let proposal;
      try {
        proposal = await actions[key](s.action);
      } catch (error) {
        console.error("App proposal -", error);
      }
      return [s, proposal];
    }) // delay allows usage of atom API
    .filter(([, p]) => {
      const isValid = is(Object, p);
      if (!isValid) {
        console.warn("App - Discarded proposal:", p);
      }
      return isValid;
    })
    .filter(([, p]) => Object.keys(p).length > 0)
    .do(([s, p]) => {
      console.log(`New proposal: ${JSON.stringify(p)}`);

      if (p.toggle !== undefined) {
        state.lens(s => s.toggle.value).set(!s.toggle.value);
      }

      if (p.text !== undefined) {
        state.lens(s => s.text).set(p.text);
      }
    })
    .subscribe();

  return <App state={state} />;
};
