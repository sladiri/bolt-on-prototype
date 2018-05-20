// @ts-ignore
import { CountDownClock, UpdateStream } from "./control";

const wait = delay => new Promise(res => setTimeout(res, delay));

export const _Actions = ({ propose, service }) => ({
    async refresh() {
        const proposal = { name: Date.now() };
        await propose({ proposal });
    },
    async fetchPosts(...args) {
        await wait(600);
        const postsData = await fetch("/posts").then(resp => resp.json());
        const proposal = { posts: postsData };
        await propose({ proposal });
    },
    async countDown({ value = -1, counterId }) {
        const payload = { counter: value, counterId };
        if (value === null) {
            await propose({
                proposal: payload,
                nameSpace: `countDown${counterId}`,
            });
            return;
        }
        const {
            countDown: { clock, idsInProgress },
        } = service;
        if (!idsInProgress.has(counterId)) {
            idsInProgress.set(
                counterId,
                clock.tick(counterId).then(() => {
                    idsInProgress.delete(counterId);
                    return payload;
                }),
            );
        }
        const proposal = idsInProgress.get(counterId);
        await propose({ proposal, nameSpace: `countDown${counterId}` });
    },
    async updateTodo({ id, ...attrs }) {
        const proposal = { todoId: id, ...attrs };
        await propose({ proposal });
    },
});

export const Actions = ({ propose }) => {
    const actions = _Actions({
        propose,
        service: {
            countDown: {
                clock: CountDownClock(),
                idsInProgress: new Map(),
            },
        },
    });
    UpdateStream({ actions });
    return actions;
};
