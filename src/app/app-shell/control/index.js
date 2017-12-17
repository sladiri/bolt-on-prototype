// @ts-check
import FunctionTree, { sequence } from "function-tree";
// import Devtools from "function-tree/devtools";

// const devtools = new Devtools({
//   host: "localhost:8585",
//   reconnect: false,
//   https: true,
// });

const foo = sequence("My awesome sequence", [
  sequence("nested awesome sequence", [
    context => {
      console.log("foo context 1", context.props, context);
      return new Promise(res => setTimeout(() => res({ bla: 42 }), 3000));
    },
    context => {
      console.log("foo context 2", context.props, context);
      return new Promise(res => setTimeout(() => res({ bla: 666 }), 3000));
    },
  ]),
  context => {
    console.log("foo context 3", context.props, context);
  },
]);

import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { _catch } from "rxjs/operator/catch";
import { debounceTime } from "rxjs/operator/debounceTime";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { switchMap } from "rxjs/operator/switchMap";
import { filter } from "rxjs/operator/filter";
import { mergeMap } from "rxjs/operator/mergeMap";
import { map } from "rxjs/operator/map";
import { first } from "rxjs/operator/first";
import { toPromise } from "rxjs/operator/toPromise";
import { _do } from "rxjs/operator/do";
import { identity } from "ramda/es";

const doSearch = term =>
  Observable::of(
    fetch(
      `/wiki/api.php?action=query&format=json&list=search&utf8=1&srsearch=${term}`,
      {
        mode: "cors",
      },
    ),
  )
    ::mergeMap(identity)
    ::mergeMap(response => response.json())
    ::map(
      json =>
        (json.query &&
          json.query.search &&
          json.query.search.map(x => x.title)) ||
        [],
    )
    ::_catch(error => {
      console.error("fetch error", error);
      return [];
    });

export const getActions = ({ shim }) => {
  const ft = new FunctionTree({ shim });
  // devtools.add(ft);

  const searchTerm = new Subject();
  const search = searchTerm
    ::filter(term => term.length > 3)
    ::debounceTime(1000)
    ::distinctUntilChanged()
    ::switchMap(term => (term ? doSearch(term) : Observable::of([])))
    ::_catch(error => {
      console.error("_search error", error);
      return Observable.of([]);
    })
    ::_do(_ => {
      searchPromise = search::first()::toPromise();
    });
  let searchPromise = search::first()::toPromise();

  return {
    async search({ term }) {
      if (!term) {
        return;
      }

      searchTerm.next(term);

      return {
        wiki: await searchPromise,
      };
    },
    async toggle() {
      await ft.run(foo, { foo: "bar" });

      return {
        toggle: await new Promise(res => setTimeout(() => res(true), 500)),
      };
    },
    text({ text }) {
      if (!text && text !== "") {
        return;
      }

      return {
        text: text.toUpperCase(),
      };
    },
    async login({ userName, password }) {
      if (!userName || !password) {
        return;
      }

      return { userName };
    },
    async logout() {
      return { userName: "" };
    },
  };
};
