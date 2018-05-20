export const CountDownClock = () => {
    let tickerInProgress = null;
    return Object.assign(Object.create(null), {
        tick() {
            if (!tickerInProgress) {
                tickerInProgress = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        tickerInProgress = null;
                        resolve();
                    }, 1000);
                });
            }
            return tickerInProgress;
        },
    });
};
