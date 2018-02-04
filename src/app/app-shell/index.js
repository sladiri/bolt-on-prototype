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
        userName={views.userName}
        login={propose("login")}
        logout={propose("logout")}
        search={term => propose("search", { term })}
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

import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { skip } from "rxjs/operator/skip";
import { _do } from "rxjs/operator/do";

export const getStateRepresentation = ({ viewState }) => {
  const toggle = viewState.lens(x => x.toggle);
  const text = viewState.lens(x => x.text);
  const userName = viewState.lens(x => x.userName);
  const wiki = viewState.lens(x => x.wiki);
  const _ticker = viewState.lens(x => x.ticker);
  const ticker = _ticker.combineLatest(
    toggle,
    (ticker, toggle) => `${toggle} // ${ticker}`,
  );
  const tickerUpdate = Observable::interval(500000)
    ::skip(1)
    ::_do(::_ticker.set);
  tickerUpdate.subscribe();

  function stateRepresentation({ state }) {
    toggle.set(state.toggle);
    text.set(state.text);
    userName.set(state.userName);
    wiki.set(state.wiki);

    return; // Should return array of allowed actions?
  }

  return {
    stateRepresentation,
    views: {
      toggle: toggle.view(identity),
      text: text.view(identity),
      userName: userName.view(identity),
      wiki: wiki.view(identity),
      ticker,
    },
  };
};

export const defaultViewState = {
  toggle: null,
  text: null,
  userName: null,
  wiki: null,
  ticker: 0,
  actionPending: [],
};
