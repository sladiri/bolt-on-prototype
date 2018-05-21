// @ts-ignore
import { UpdateStream } from "./control";

const wait = (delay, value) =>
    new Promise(res => setTimeout(() => res(value), delay));

export const _Actions = ({ propose, service }) => {
    return Object.assign(Object.create(null), {
        async refresh() {
            const proposal = { name: Date.now() };
            await propose({ proposal });
        },
        async fetchPosts({ cancel = false } = {}) {
            const proposal = cancel
                ? {}
                : wait(1000, fetch("/posts"))
                      .then(resp => resp.json())
                      .then(posts => ({ posts }));
            await propose({ proposal }, true);
        },
        async countDown({ value = -1, counterId }) {
            const { idsInProgress } = service;
            const payload = { counter: value, counterId };
            if (value === null) {
                clearTimeout(idsInProgress.get(counterId));
                idsInProgress.delete(counterId);
                await propose({
                    proposal: payload,
                    nameSpace: `countDown${counterId}`,
                });
                return;
            }
            if (idsInProgress.has(counterId)) {
                return;
            }
            idsInProgress.set(
                counterId,
                setTimeout(async () => {
                    await propose({
                        proposal: payload,
                        nameSpace: `countDown${counterId}`,
                    });
                    idsInProgress.delete(counterId);
                }, 1000),
            );
        },
        async updateTodo({ id, ...attrs }) {
            const proposal = { todoId: id, ...attrs };
            await propose({ proposal });
        },
    });
};

export const Actions = ({ propose }) => {
    const actions = _Actions({
        propose,
        service: {
            idsInProgress: new Map(),
        },
    });
    UpdateStream({ actions });
    return actions;
};
