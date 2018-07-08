import jsc from "jsverify";
import R from "ramda";

export const clockGen = jsc.suchthat(
    jsc
        .array(jsc.tuple([jsc.asciichar, jsc.integer]))
        .smap(R.uniqWith((x, y) => x[0] === y[0]), R.identity),
    arr => arr.length > 0,
);
