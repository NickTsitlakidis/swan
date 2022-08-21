import { LocalStorageService } from "ngx-webstorage";
import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { UserService } from "./../services/user/user.service";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _userService: UserService, private _lcStorage: LocalStorageService) {}
    async canActivate() {
        const isAuthenticated =
            (await firstValueFrom(this._userService.getUserWallets())).length &&
            this._lcStorage.retrieve("userTokenValue");
        if (!isAuthenticated) {
            this._router.navigate(["/home"]);
        }
        return !!isAuthenticated;
    }
}
