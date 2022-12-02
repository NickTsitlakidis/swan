import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenDto } from "@swan/dto";
import { LocalStorageService } from "ngx-webstorage";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { plainToClass } from "class-transformer";
import { DateTime } from "luxon";

@Injectable({
    providedIn: "root"
})
export class ClientAuthService {
    constructor(private httpClient: HttpClient, private _lcStorage: LocalStorageService) {}

    public getClientTokenData(): TokenDto {
        return new TokenDto(
            this._lcStorage.retrieve("clientTokenValue"),
            DateTime.fromISO(this._lcStorage.retrieve("clientExpiresAt"))
        );
    }

    public getAndStoreClientToken(): Observable<TokenDto> {
        const httpOptions: { headers: HttpHeaders } = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Authorization: btoa(`${environment.applicationId}:${environment.applicationSecret}`)
            })
        };
        return this.httpClient.post("/client/login", {}, httpOptions).pipe(
            map((httpResult) => {
                return plainToClass(TokenDto, httpResult);
            }),
            tap((dto) => {
                this._lcStorage.store("clientTokenValue", dto.tokenValue);
                this._lcStorage.store("clientExpiresAt", dto.expiresAt.toISO());
            })
        );
    }
}
