// @ts-check
import * as React from "react";
import { F } from "@grammarly/focal";
import { identity } from "ramda/es";
import danger3 from "assets/danger-3.svg";
import { Icon } from "components/icon";
import { Counter } from "components/counter";
import { Toggle } from "components/toggle";
import { AnInput } from "components/an-input";
import "./style.css";

export const App = ({ state, views, propose }) => {
  return (
    <div>
      <h1>
        <Icon {...danger3} />&nbsp;Hello, world!
      </h1>
      <F.div>
        {views.actionPending.view(x => (x.length ? JSON.stringify(x) : "[ ]"))}
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
        onClick={() => state.lens(x => x.count).modify(x => x + 1)}
      />
      <Toggle
        value={views.toggle.view(x => (x ? "Foo" : "Bar"))}
        onClick={() => propose("toggle", {})}
      />
      <AnInput
        value={views.text}
        onChange={e => propose("text", { text: e.target.value })}
      />
    </div>
  );
};

export const defaultViewState = {
  count: -1,
  toggle: false,
  text: "",
  actionPending: []
};

export const getStateRepresentation = ({ viewState }) => {
  const toggle = viewState.lens(x => x.toggle);
  const text = viewState.lens(x => x.text);

  function stateRepresentation({ state }) {
    toggle.set(state.toggle);
    text.set(state.text);

    return; // Should return array of allowed actions?
  }

  return {
    stateRepresentation,
    views: {
      toggle: toggle.view(identity),
      text: text.view(identity)
    }
  };
};
