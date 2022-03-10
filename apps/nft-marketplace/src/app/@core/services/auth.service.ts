import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenDto } from "@nft-marketplace/common";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    httpOptions: { headers: HttpHeaders };

    constructor(private httpClient: HttpClient) {
        this.httpOptions = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Authorization: btoa(`${environment.applicationId}:${environment.applicationSecret}`)
            })
        };
    }

    public getClientToken() {
        return this.httpClient.post<TokenDto>("/client/login", {}, this.httpOptions);
    }
}
