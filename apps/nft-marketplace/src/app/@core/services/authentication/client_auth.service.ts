import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenDto } from "@nft-marketplace/common";
import { LocalStorageService } from "ngx-webstorage";
import { environment } from "../../../../environments/environment";

@Injectable({
    providedIn: "root"
})
export class ClientAuthService {
    constructor(private httpClient: HttpClient, private _lcStorage: LocalStorageService) {}

    public getClientTokenData(): TokenDto {
        return {
            tokenValue: this._lcStorage.retrieve("clientTokenValue"),
            expiresAt: this._lcStorage.retrieve("clientExpiresAt")
        };
    }

    public getClientToken() {
        const httpOptions: { headers: HttpHeaders } = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Authorization: btoa(`${environment.applicationId}:${environment.applicationSecret}`)
            })
        };
        return this.httpClient.post<TokenDto>("/client/login", {}, httpOptions);
    }
}
