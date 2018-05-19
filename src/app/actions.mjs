const wait = delay => new Promise(res => setTimeout(res, delay));

const countDownClock = {
    _tickerInProgress: null,
    tick() {
        if (!this._tickerInProgress) {
            this._tickerInProgress = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this._tickerInProgress = null;
                    resolve();
                }, 1000);
            });
        }
        return this._tickerInProgress;
    },
};

export const Actions = ({ propose }) => ({
    async refresh() {
        // console.log("Actions.refresh");
        await propose({ name: Date.now() });
    },
    async fetchPosts(...args) {
        // console.log("Actions.fetchPosts", ...args);
        await wait(600);
        const postsData = await fetch("/posts").then(resp => resp.json());
        await propose({ posts: postsData });
    },
    async countDown({ value = -1, nap = false }) {
        // console.log("Actions.countDown", value);
        if (value === null) {
            await propose({ counter: value });
            return;
        }
        countDownClock
            .tick()
            .then(() => {
                // console.log("down");
                return propose({ counter: value, nap });
            })
            .catch(error => {
                console.error("countDown", error);
            });
    },
});
