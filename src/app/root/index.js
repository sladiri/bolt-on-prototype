// @ts-check
import * as React from "react";
import { Atom, F } from "@grammarly/focal";
import sam from "../sam";

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
    <F.div>
      {state.lens(x => x.actionPending).view(x => JSON.stringify(x))}
    </F.div>
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
  },
  actionPending: []
};

export const actions = shim => ({
  toggle: async x => {
    return await new Promise(resolve => setTimeout(() => resolve(x), 3000));
  },
  text: x => x
});

export const model = shim => state => async ([s, p]) => {
  console.log(`New proposal: ${JSON.stringify(p)}`);

  if (p.toggle !== undefined) {
    state.lens(s => s.toggle.value).set(!s.toggle.value);
  }

  if (p.text !== undefined) {
    state.lens(s => s.text).set(p.text);
  }
};

/* eslint-disable react/display-name */
export default ({ shim }) => {
  const state = Atom.create(defaultState);

  state.subscribe(x => {
    console.log(`New app state: ${JSON.stringify(x)}`);
  });

  sam(model(shim), actions(shim), state);

  return <App state={state} />;
};
