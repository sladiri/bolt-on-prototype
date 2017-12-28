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

## Focal views

* [home](https://github.com/grammarly/focal)
* Focal updates components only on relevant state changes.
* Read-only lenses help to prevent direct mutation of state in the components.
* RxJS for derived views is built in. [home](https://github.com/ReactiveX/rxjs)

## TODO

* [ ] Bolt-on
  * [ ] Implement polling Shim from Bailis' paper
  * [ ] Implement Shim using PouchDB's change-events
* [ ] How to manage rapid text-input changes (or other events) where slow async
      work is required?
* [ ] Consider more complex action calls, not just single predefined actions.
* [ ] Action blocking useful?
* [ ] Use function-tree for actions
      [home](https://github.com/cerebral/cerebral/tree/next/packages/node_modules/function-tree)
