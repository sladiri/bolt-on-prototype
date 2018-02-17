import test from "tape";
import jsc from "jsverify";
import { isCovered } from "./is-covered";

const minimalOptions = {
  write: {
    _meta: {
      happenedAfter: {},
    },
  },
};

/*
test("isCovered-pessimistic - [x1] (no dependency)", t => {
  t.plan(1);

  isCovered(minimalOptions).then(result => t.equal(result, true));
});

test("isCovered-pessimistic - [x1] (random additional parameters)", t => {
  t.plan(1);

  const withRandomlyAddedParams = jsc.forall(
    "dict",
    "dict",
    "dict",
    (objA, objB, objC) => {
      const options = {
        ...objA,
        write: {
          ...objB,
          _meta: {
            ...objC,
            ...minimalOptions.write._meta,
          },
        },
      };

      return isCovered(options).then(x => x === true);
    },
  );

  jsc.check(withRandomlyAddedParams).then(result => {
    t.equal(result, true);
  });
});
*/

const getStores = ({ localData, ecdsData, failKeys = [] }) => ({
  ecds: {
    get: ({ key }) => {
      const failIndex = failKeys.indexOf(key);
      if (failIndex > -1) {
        failKeys.splice(failIndex, 1);
      }

      if (failIndex > -1 || !ecdsData[key]) {
        const error = new Error("no found");
        error.name = "not_found";
        throw error;
      }
      return { val: JSON.stringify(ecdsData[key]) };
    },
  },
  localStore: {
    get: ({ key }) => JSON.stringify(localData[key]),
    put: ({ key, val }) => (localData[key] = val),
  },
});

/*
test("isCovered-pessimistic - [w1 !-> w2]", t => {
  t.plan(1);

  const ecdsData = {
    w1: {
      val: "foo",
      _meta: {
        vectorClock: { p1: 1 },
        happenedAfter: {},
      },
    },
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 3 },
        happenedAfter: {
          w1: { p1: 2 },
        },
      },
    },
  };

  const localData = {
    w1: JSON.parse(JSON.stringify(ecdsData.w1)),
    w2: JSON.parse(JSON.stringify(ecdsData.w2)),
  };

  const write = JSON.parse(JSON.stringify(ecdsData.w2));

  const tentativeWrites = {
    w2: JSON.parse(JSON.stringify(write)),
  };

  const options = {
    write,
    tentativeWrites,
    ...getStores({ localData, ecdsData }),
  };

  isCovered(options).then(result => t.equal(result, false));
});

test("isCovered-pessimistic - [?? !-> w2] unavailable", t => {
  t.plan(1);

  const ecdsData = {
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 2 },
        happenedAfter: {
          w1: { p1: 1 },
        },
      },
    },
  };

  const localData = {
    w2: JSON.parse(JSON.stringify(ecdsData.w2)),
  };

  const write = JSON.parse(JSON.stringify(ecdsData.w2));

  const tentativeWrites = {
    w2: JSON.parse(JSON.stringify(write)),
  };

  const options = {
    write,
    tentativeWrites,
    ...getStores({ localData, ecdsData }),
  };

  isCovered(options).then(result => t.equal(result, false));
});

test("isCovered-pessimistic - [w1 -> w2] locally available", t => {
  t.plan(1);

  const ecdsData = {
    w1: {
      val: "foo",
      _meta: {
        vectorClock: { p1: 1 },
        happenedAfter: {},
      },
    },
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 2 },
        happenedAfter: {
          w1: { p1: 1 },
        },
      },
    },
  };

  const localData = {
    w1: JSON.parse(JSON.stringify(ecdsData.w1)),
    w2: JSON.parse(JSON.stringify(ecdsData.w2)),
  };

  const write = JSON.parse(JSON.stringify(ecdsData.w2));

  const tentativeWrites = {
    w2: JSON.parse(JSON.stringify(write)),
  };

  const options = {
    write,
    tentativeWrites,
    ...getStores({ localData, ecdsData }),
  };

  isCovered(options).then(result => t.equal(result, true));
});

test("isCovered-pessimistic - dependency locally unavailable", t => {
  t.plan(1);

  const ecdsData = {
    w1: {
      val: "foo",
      _meta: {
        vectorClock: { p1: 1 },
        happenedAfter: {},
      },
    },
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 2 },
        happenedAfter: {
          w1: { p1: 1 },
        },
      },
    },
  };

  const localData = {
    w2: JSON.parse(JSON.stringify(ecdsData.w2)),
  };

  const write = JSON.parse(JSON.stringify(ecdsData.w2));

  const tentativeWrites = {
    w2: JSON.parse(JSON.stringify(write)),
  };

  const options = {
    write,
    tentativeWrites,
    ...getStores({ localData, ecdsData }),
  };

  isCovered(options).then(result => t.equal(result, true));
});

test("isCovered-pessimistic - dependency unavailable", t => {
  t.plan(1);

  const ecdsData = {
    w1: {
      val: "foo",
      _meta: {
        vectorClock: { p1: 2 },
        happenedAfter: {
          w2: { p2: 1 },
        },
      },
    },
  };

  const localData = {
    w1: JSON.parse(JSON.stringify(ecdsData.w1)),
  };

  const write = JSON.parse(JSON.stringify(ecdsData.w1));

  const tentativeWrites = {
    w1: JSON.parse(JSON.stringify(ecdsData.w1)),
  };

  const options = {
    write,
    tentativeWrites,
    ...getStores({ localData, ecdsData }),
  };

  isCovered(options).then(result => t.equal(result, false));
});
*/

// Bolt-on Causal Consistency, Peter Bailis et al, SIGMOD 2013
