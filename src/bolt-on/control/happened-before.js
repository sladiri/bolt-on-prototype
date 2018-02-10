export const happenedBefore = ({ clockRef, clock }) => {
  let lessOrEqual = false;
  let strictlyEqual = false;

  const processKeys = [...Object.keys(clockRef), ...Object.keys(clock)].reduce(
    (acc, val) => (acc.includes(val) ? acc : [...acc, val]),
    [],
  );

  for (const name of processKeys) {
    const refTick = clockRef[name] || 0;
    const prevTick = clock[name] || 0;

    if (prevTick > refTick) {
      return false;
    } else {
      lessOrEqual = true;
    }

    if (prevTick < refTick) {
      strictlyEqual = true;
    }
  }

  return lessOrEqual && strictlyEqual;
};
