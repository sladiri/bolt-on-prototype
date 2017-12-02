// @ts-check
import * as React from "react";
import { identity } from "ramda/es";
import { SamPanel } from "app/sam-panel";
import { UserPanel } from "app/user-panel";
import { Toggle } from "app/toggle";
import { AnInput } from "app/an-input";
import { ElementsTest } from "app/elements-test";

export const App = ({ views, propose }) => {
  return (
    <section className="appShell">
      <SamPanel views={views} />
      <UserPanel
        login={propose("login")}
        logout={propose("logout")}
        userName={views.userName}
      />
      <Toggle
        value={views.toggle.view(x => (x ? "Foo" : "Bar"))}
        onClick={() => propose("toggle", {})}
      />
      <AnInput
        value={views.text}
        onChange={e => propose("text", { text: e.target.value })}
      />
      <ElementsTest />
    </section>
  );
};

export const getStateRepresentation = ({ viewState }) => {
  const toggle = viewState.lens(x => x.toggle);
  const text = viewState.lens(x => x.text);
  const userName = viewState.lens(x => x.userName);

  function stateRepresentation({ state }) {
    toggle.set(state.toggle);
    text.set(state.text);
    userName.set(state.userName);

    return; // Should return array of allowed actions?
  }

  return {
    stateRepresentation,
    views: {
      toggle: toggle.view(identity),
      text: text.view(identity),
      userName: userName.view(identity)
    }
  };
};

export const defaultViewState = {
  toggle: null,
  text: null,
  userName: null,
  actionPending: []
};
