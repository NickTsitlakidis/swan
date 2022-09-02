import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { firstValueFrom, skipWhile, throwError, timeout } from "rxjs";
import { UserFacade } from "../store/user-facade";
import { isNil } from "lodash";
import { take } from "rxjs/operators";

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _userFacade: UserFacade) {}

    async canActivate(): Promise<boolean | UrlTree> {
        const token = await firstValueFrom(this._userFacade.streamToken());
        if (isNil(token.state)) {
            return this._router.parseUrl("/home");
        }

        const user = await firstValueFrom(this._userFacade.streamUser());

        if (!isNil(user)) {
            return true;
        }

        const userStream = this._userFacade.streamUser().pipe(
            skipWhile((user) => isNil(user)),
            timeout({
                each: 1000,
                with: () => throwError(() => new Error("User not found"))
            }),
            take(1)
        );

        try {
            const refreshedUser = await firstValueFrom(userStream);
            return true;
        } catch (error) {
            return this._router.parseUrl("/home");
        }
    }
}
