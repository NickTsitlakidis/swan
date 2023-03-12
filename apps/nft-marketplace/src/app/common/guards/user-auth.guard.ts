import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { isNil } from "@nft-marketplace/utils";
import { UserStore } from "../store/user-store";
import { when } from "mobx";
import { from, mergeMap, Observable, of } from "rxjs";
import { getApplicationStatus } from "../../application-initializer";
import { catchError, filter } from "rxjs/operators";

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _userStore: UserStore) {}

    canActivate(): Observable<boolean | UrlTree> {
        if (!isNil(this._userStore.user)) {
            return of(true);
        }

        return getApplicationStatus().pipe(
            filter((isInitialized) => isInitialized),
            mergeMap(() => from(when(() => !this._userStore.userState.isLoading, { timeout: 5000 }))),
            mergeMap(() => {
                if (!isNil(this._userStore.user)) {
                    return of(true);
                } else {
                    return of(this._router.parseUrl("/home"));
                }
            }),
            catchError((error) => {
                console.log(error);
                return of(this._router.parseUrl("/home"));
            })
        );
    }
}
