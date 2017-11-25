// @ts-check
import { pipe } from "ramda/es";
import { wait, toArray, asyncEach, asyncFilter, asyncMap } from "./async-util";

const o = { a: 42 };
const p = { ...o, b: 666 };
console.log("rest spread ok", p);

// TODO: create source iterable
async function* fetchUsers(limit, delay) {
  const url = "https://api.randomuser.me/";
  let max = 0;
  while (max++ < limit) {
    if (delay) {
      await wait(delay);
    }
    const response = await fetch(url);
    const json = await response.json();
    yield json;
  }
}

const getUser = json => json.results[0];

const isOldUser = user => new Date(user.registered).getFullYear() < 2010;

export default async ({ limit = 5, delay = 0, target = () => {} }) => {
  try {
    return await pipe(
      asyncMap(getUser),
      asyncFilter(isOldUser),
      asyncEach(target),
      toArray
    )(fetchUsers(limit, delay));
  } catch (error) {
    console.error("error", error);
    return [];
  }
};
