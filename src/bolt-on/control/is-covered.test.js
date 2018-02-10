import test from "tape";
import { isCovered } from "./is-covered";

test("isCovered-pessimistic - empty dependencies => true", t => {
  t.plan(1);

  const options = {
    write: {
      _meta: {
        happenedAfter: {},
      },
    },
  };

  isCovered(options).then(result => t.equal(result, true));
});

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

test("isCovered-pessimistic - dependency locally available => true", t => {
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
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 1 },
        happenedAfter: {},
      },
    },
  };

  const localData = {
    w1: JSON.parse(JSON.stringify(ecdsData.w1)),
    w2: JSON.parse(JSON.stringify(ecdsData.w2)),
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

  isCovered(options).then(result => t.equal(result, true));
});

test("isCovered-pessimistic - dependency locally unavailable => true", t => {
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
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 1 },
        happenedAfter: {},
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

  isCovered(options).then(result => t.equal(result, true));
});

test("isCovered-pessimistic - dependency unavailable => false", t => {
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
