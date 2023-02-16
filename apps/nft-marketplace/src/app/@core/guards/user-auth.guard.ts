import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { isNil } from "lodash";
import { UserStore } from "../store/user-store";
import { when } from "mobx";

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _userStore: UserStore) {}

    async canActivate(): Promise<boolean | UrlTree> {
        // if (isNil(this._userStore.token)) {
        //     return this._router.parseUrl("/home");
        // }
        console.log("called guard");
        if (!isNil(this._userStore.user)) {
            return true;
        }

        this._userStore.refreshUser();
        return when(() => !this._userStore.userState.isLoading, { timeout: 5000 })
            .then(() => {
                if (!isNil(this._userStore.user)) {
                    return true;
                } else {
                    return this._router.parseUrl("/home");
                }
            })
            .catch((error) => {
                console.log(error);
                return this._router.parseUrl("/home");
            });
    }
}
