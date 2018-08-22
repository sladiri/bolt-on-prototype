import jsc from "jsverify";
import R from "ramda";

const shimId = jsc.asciichar;
const tick = jsc.suchthat(jsc.integer, x => Number.isSafeInteger(x));

export const clock = jsc.tuple([jsc.nearray(shimId), jsc.nearray(tick)]).smap(
    ([chars, ints]) => {
        chars = R.uniq(chars);
        if (chars.length < ints.length) {
            ints = R.take(chars.length, ints);
        }
        if (chars.length > ints.length) {
            chars = R.take(ints.length, chars);
        }
        const keyValuePairs = R.transpose([chars, ints]);
        return keyValuePairs;
    },
    () => [["a"], [1]], // Could use ramda to restore somewhat?
);

export const clocksHappensBefore = jsc.suchthat(
    clock.smap(
        clock => {
            const toDelete = [];
            let after = clock.map(([k, v]) => [
                k,
                Number.isSafeInteger(v + 1) ? v + 1 : null,
            ]);
            after.forEach(([, v], index) => {
                if (v === null) {
                    toDelete.push(index);
                }
            });
            const before = clock.filter(
                (val, index) =>
                    !toDelete.includes(index) && Math.random() > 0.3,
            );
            after = after.filter(([, v]) => v !== null);
            return [before, after];
        },
        ([x]) => x,
    ),
    ([a, b]) => a.length && b.length,
);

export const clocksConcurrent = jsc.suchthat(
    clock.smap(
        clock => {
            let x = [...clock];
            const y = [];
            const toDelete = [];
            x.forEach((item, index) => {
                if (Math.random() >= 0.5) {
                    toDelete.push(index);
                    y.push(item);
                }
            });
            x = x.filter((val, index) => !toDelete.includes(index));
            return [x, y];
        },
        ([a]) => a,
    ),
    ([x, y]) => x.length && y.length,
);
