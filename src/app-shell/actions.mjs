import { UpdateStream } from "./control/update-stream";

const wait = delay => value =>
    new Promise(res => setTimeout(() => res(value), delay));

export const _Actions = ({ propose, service }) => {
    return Object.assign(Object.create(null), {
        async refresh() {
            const proposal = { rand: Date.now() };
            await propose({ proposal });
        },
        async route({ oldPath, location }) {
            if (oldPath === location.href) {
                return;
            }
            const routeMatch = service.routeRegex.exec(location.pathname);
            const route = routeMatch ? routeMatch[2] || routeMatch[0] : "/";
            const params = new URLSearchParams(location.search);
            let query = [...params.keys()].reduce(
                (keys, key) => keys.add(key),
                new Set(),
            );
            query = [...query.values()].reduce(
                (obj, key) => Object.assign(obj, { [key]: params.getAll(key) }),
                Object.create(null),
            );
            await propose({ proposal: { route, query } });
        },
        async setName({ value }) {
            if (typeof value !== "string") {
                return;
            }
            await propose({ proposal: { rand: value } });
        },
        async fetchPosts({ cancel = false } = {}) {
            const proposal = cancel
                ? {}
                : fetch("/posts")
                      .then(wait(1000))
                      .then(resp => resp.json())
                      .then(posts => ({ posts }));
            await propose({ proposal }, "fetchPosts");
        },
        async countDown({ value = -1, counterId }) {
            const { idsInProgress } = service;
            const payload = { counter: value, counterId };
            if (value === null) {
                clearTimeout(idsInProgress.get(counterId));
                await propose({
                    proposal: payload,
                    nameSpace: `countDown${counterId}`,
                });
                idsInProgress.delete(counterId);
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
            routeRegex: /^\/(app)?(\/.+)?/,
            idsInProgress: new Map(),
        },
    });
    UpdateStream({ actions });
    return actions;
};
