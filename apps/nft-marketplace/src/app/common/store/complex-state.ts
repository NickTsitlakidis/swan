import { isNil } from "@nft-marketplace/utils";

export class ComplexState<T> {
    private _state: T;
    private _error: Error;
    private _isLoading: boolean;

    static fromLoading<T>(): ComplexState<T> {
        const toReturn = new ComplexState<T>();
        toReturn._isLoading = true;
        return toReturn;
    }

    static fromError<T>(error: Error): ComplexState<T> {
        const toReturn = new ComplexState<T>();
        toReturn._error = error;
        toReturn._isLoading = false;
        return toReturn;
    }

    static fromSuccess<T>(state: T): ComplexState<T> {
        const toReturn = new ComplexState<T>();
        toReturn._state = state;
        toReturn._isLoading = false;
        return toReturn;
    }

    get state(): T {
        return this._state;
    }

    get error(): Error {
        return this._error;
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    get isEmpty(): boolean {
        return isNil(this._state) && isNil(this._error);
    }

    get hasState(): boolean {
        return !isNil(this._state);
    }
}
