import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LocalStorageService } from "ngx-webstorage";

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _lcStorage: LocalStorageService) {}
    canActivate(): boolean {
        const isAuthenticated = this._lcStorage.retrieve("walletId") && this._lcStorage.retrieve("userTokenValue");
        if (!isAuthenticated) {
            this._router.navigate(["/home"]);
        }
        return !!isAuthenticated;
    }
}
