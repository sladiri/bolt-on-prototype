import { default as Rx } from "rxjs";
import { default as RxOps } from "rxjs/operators";

export const CountDownClock = () => {
    const ticker$ = Rx.interval(1000);
    return Object.assign(Object.create(null), {
        tick(id) {
            return ticker$.pipe(RxOps.take(1)).toPromise();
        },
    });
};
