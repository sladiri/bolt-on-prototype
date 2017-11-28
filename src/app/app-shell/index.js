// @ts-check
import * as React from "react";
import { identity } from "ramda/es";
import danger3 from "assets/danger-3.svg";
import { Icon } from "components/icon";
import { SamPanel } from "components/sam-panel";
import { UserPanel } from "components/user-panel";
import { Toggle } from "components/toggle";
import { AnInput } from "components/an-input";
import "./style.css";

export const App = ({ views, propose }) => {
  return (
    <div>
      <h1>
        <Icon {...danger3} />&nbsp;Hello, world!
      </h1>
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
    </div>
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
