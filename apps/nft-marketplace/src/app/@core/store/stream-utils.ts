import { Observable } from "rxjs";
import { computed } from "mobx";

export function mobxStream<T>(expression: () => T): Observable<T> {
    return new Observable((observer) => {
        const computedValue = computed(expression);
        const unsubscribe = computedValue.observe_((changes) => {
            observer.next(changes.newValue);
        }, true);

        return () => {
            unsubscribe && unsubscribe();
        };
    });
}
