# Bolt-on Protocol Prototype

Show Bolt-on example for my master-thesis.

## Quick Start

-   `npm run build` creates static assets
-   `npm start` serves the assets

## Bolt-on protocol

-   [paper](http://www.bailis.org/papers/bolton-sigmod2013.pdf)
-   [code exmaple]()

## SAM pattern

-   [home](http://sam.js.org/)
-   An action proposes an update and the model accepts or rejects it (ie. a
    defined Step).
-   The model updates and view updates are clearly separated (model and
    state-representation).

## HyperHTML with Server Side Rendering

-   [HyperHTML](https://viperhtml.js.org/) updates the DOM efficiently
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

-   [ ] Optimistic polling Shim from Bailis' paper
-   [ ] Optimistic Shim using PouchDB's change-events
-   [ ] Pessimistic Shim
-   Co-locate Shim with:
    -   [ ] browser
    -   [ ] server
-   App exmples:
    -   [ ] Twitter-like message tree
    -   [ ] Tv Shows [blog post](http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/)
    -   [ ] Monitoring tool
-   SAM Pattern:
    -   [ ] (Optimistic) Shim updates call actions
    -   [ ] Cancel actions via Shim
-   Property-based tests:
    -   [ ] Happened-before
    -   [ ] Is-covered
-   [ ] Bounded size of Shim (affects Shim performance)
-   [ ] Write Shim code in Typescript?
