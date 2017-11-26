// @ts-check
import * as React from "react";
import { Atom, F } from "@grammarly/focal";
import { append, reject, equals } from "ramda/es";
import danger3 from "assets/danger-3.svg";
import { Icon } from "components/icon";
import "./style.css";

import { Form, TextInput, PasswordInput } from "a-plus-forms";

const sendToServer = ({ username, password }) => {
  console.log("servr", username, password);
};

export const Counter = ({ count, onClick, text }) => {
  return (
    <F.div>
      You have clicked this button {count} time(s).&nbsp;
      <button onClick={onClick}>Click</button>
      <Form onSubmit={sendToServer}>
        <TextInput name="username" label={"Username"} />
        <PasswordInput name="password" label="Password" />
        <button type="submit">Sign In</button>
      </Form>
    </F.div>
  );
};

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

export const App = ({ state, propose }) => {
  return (
    <div>
      <h1>
        <Icon {...danger3} />&nbsp;Hello, world!
      </h1>
      <F.div>
        {state
          .lens(x => x.actionPending)
          .view(x => (x.length ? JSON.stringify(x) : "[ ]"))}
      </F.div>
      <Counter
        count={
          // take the app state and lens into its part where the
          // counter's state lies.
          //
          // note that this call is not simply a generic `map` over an
          // observable: it actually creates an atom which you can write to,
          // and in a type safe way. how is it type safe? see below.
          state.lens(x => x.count)
        }
        text={state.lens(x => x.text)}
        onClick={() => state.lens(x => x.count).modify(x => x + 1)}
      />
      <Toggle
        value={state.lens(x => x.toggle.value).view(x => (x ? "Foo" : "Bar"))}
        onClick={() => propose("toggle", {})}
      />
      <AnInput
        value={state.lens(x => x.text)}
        onChange={e => propose("text", { text: e.target.value })}
      />
    </div>
  );
};

export const defaultState = {
  count: 0,
  toggle: { value: true },
  text: "Change Me",
  actionPending: []
};

export const getActions = ({ shim }) => ({
  toggle: async () => ({
    toggle: await new Promise(res => setTimeout(() => res(true), 3000))
  }),
  text: ({ text }) =>
    (text || text === "") && {
      text: text.toUpperCase()
    }
});

const isDefined = (key, obj) => obj[key] !== undefined;

export const getModel = ({ shim, state }) =>
  async function model({ proposal }) {
    if (isDefined("toggle", proposal)) {
      // discards input
      state.lens(s => s.toggle.value).modify(x => !x);
    }

    if (isDefined("text", proposal)) {
      state.lens(s => s.text).set(proposal.text);
    }
  };

export default ({ shim, getModel, getActions }) => {
  const state = Atom.create(defaultState);

  state.subscribe(x => {
    console.log(`New app state: ${JSON.stringify(x)}`);
  });

  const model = getModel({ shim, state });
  const actions = getActions({ shim });

  const propose = async (actionName, input) => {
    const actionId = `actionName-${Date.now()}`;

    state.lens(s => s.actionPending).modify(append(actionId));

    const proposal = actions[actionName] && (await actions[actionName](input));

    if (proposal) {
      await model({ proposal });
    }

    state.lens(s => s.actionPending).modify(reject(equals(actionId)));
  };

  return <App state={state} propose={propose} />;
};
