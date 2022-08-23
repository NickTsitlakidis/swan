import { LocalStorageService } from "ngx-webstorage";
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { UserService } from "./../services/user/user.service";
import { map } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _userService: UserService, private _lcStorage: LocalStorageService) {}
    canActivate() {
        return this._userService.getUserWallets().pipe(
            map((userWallets) => {
                if (!userWallets.length && !this._lcStorage.retrieve("userTokenValue")) {
                    this._router.navigate(["/home"]);
                    return false;
                }
                return true;
            })
        );
    }
}
