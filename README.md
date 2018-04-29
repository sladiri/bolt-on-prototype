# Bolt-on Protocol Prototype

Show Bolt-on example for my master-thesis.

## Bolt-on protocol

* [paper](http://www.bailis.org/papers/bolton-sigmod2013.pdf)

## SAM pattern

* [home](http://sam.js.org/)
* An action proposes an update and the model accepts or rejects it (ie. a
  defined Step).
* The model updates and view updates are clearly separated (model and
  state-representation).

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

* [ ] Bolt-on with Shim
  * [x] Ensure that meta-data is valid on save
    * [x] Dependency must not have greater clock than new item.
  * [ ] Shim algorithm
    * [ ] Pessimistic Shim
    * [ ] Property-based tests
      * [ ] Happened-before
        * [x] Simple property based tests
        * [ ] Improve property for vector clock happened-before
      * [ ] is covered
    * [ ] Optimistic Shim
      * [ ] Implement polling Shim from Bailis' paper
      * [ ] Implement Shim using PouchDB's change-events
    * [ ] Optimistic or Pessimistic via argument
  * [ ] Bounded size of Shim (affects Shim performance)
  * [x] Co-locate with Browser
  * [ ] Co-locate with server partition
  * [ ] Ensure unique Shim ID
* [ ] SAM pattern
  * [ ] How to manage rapid text-input changes (or other events) where slow async
        work is required?
  * [ ] Consider more complex action calls, not just single predefined actions.
  * [ ] Action blocking useful?
  * [ ] Use function-tree for actions
        [home](https://github.com/cerebral/cerebral/tree/next/packages/node_modules/function-tree)
