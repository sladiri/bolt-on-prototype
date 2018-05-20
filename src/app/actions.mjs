// @ts-ignore
import { CountDownClock } from "./control";

const wait = delay => new Promise(res => setTimeout(res, delay));

export const actions = ({ propose, countDownClock }) => ({
    async refresh() {
        await propose({ name: Date.now() });
    },
    async fetchPosts(...args) {
        await wait(600);
        const postsData = await fetch("/posts").then(resp => resp.json());
        await propose({ posts: postsData });
    },
    async countDown({ value = -1 } = {}) {
        const payload = { counter: value };
        const proposal =
            value === null
                ? payload
                : countDownClock.tick().then(() => payload);
        await propose(proposal);
    },
    async updateTodo({ id, ...attrs }) {
        await propose({ todoId: id, ...attrs });
    },
});

export const Actions = ({ propose }) => {
    return actions({ propose, countDownClock: CountDownClock() });
};
