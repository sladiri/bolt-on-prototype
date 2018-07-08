# Bolt-on Protocol Prototype

An example implementation and usage of the Bolt-on protocol.

## Quick Start

-   `npm run build` creates static assets
-   `npm start` serves the assets
-   `npm test` runs the tests

## Bolt-on protocol

A Shim wraps an eventually consistent data store and adds causal consistency.

-   [Peter Bailis' paper](http://www.bailis.org/papers/bolton-sigmod2013.pdf)
-   [Peter Bailis' code exmaple](https://github.com/pbailis/bolton-sigmod2013-code)

## SAM pattern

The app reads and writes to the Shim through a model, according to the **S**tate **A**ction **M**odel (SAM) pattern.

-   [home](http://sam.js.org/)
-   An action proposes an update and the model accepts or rejects it (ie. a
    defined Step).
-   The model updates and view updates are clearly separated (model and
    state-representation).

## HyperHTML with Server Side Rendering

-   [HyperHTML](https://viperhtml.js.org/) updates the DOM efficiently
-   The state is a simple (Javascript) Object.
-   It supports server side rendering. While the page is parsing client-side code, event handlers, for example buttons, record actions to be replayed when the client app is ready.

## VS Code Launch Config

```json
{
    "type": "node",
    "request": "launch",
    "name": "PROD Server",
    "program": "${workspaceFolder}/src/server/index.mjs",
    "runtimeArgs": ["--experimental-modules"],
    "env": {
        "NODE_ENV": "production"
    }
}
```

## TODO

-   Shim implementation
    -   [x] Pessimistic
    -   [ ] Optimistic Shim
-   [ ] Local Shim size in browser - reset possible?
-   Co-locate Shim with:
    -   [ ] browser
    -   [ ] server
-   App exmples:
    -   [ ] Twitter-like message tree
    -   [ ] Tv Shows [blog post](http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb) - linked data (eg. for CMS?)
    -   [ ] Monitoring tool
-   SAM Pattern:
    -   [ ] (Optimistic) Shim updates call actions
    -   [ ] Cancel actions via Shim
-   Property-based tests:
    -   [ ] Happened-before
    -   [ ] Is-covered
-   [ ] Bounded size of Shim (affects Shim performance)
-   [ ] Performance optimisations for Shim
-   [ ] Write Shim code in Typescript?
-   [ ] Use PouchDB's change-events for Shim?
-   [ ] Service provides unique Shim-IDs
