import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";

@Injectable({
    providedIn: "root"
})
export class PlatformUtils {
    constructor(@Inject(PLATFORM_ID) private _platformId: Record<string, any>) {}

    get isServer(): boolean {
        return isPlatformServer(this._platformId);
    }

    get isBrowser(): boolean {
        return isPlatformBrowser(this._platformId);
    }
}
