import { EMPTY, Observable } from "rxjs";

export function mobxStream<T>(expression: () => T): Observable<T> {
    return EMPTY;
}
