import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenDto } from "@swan/dto";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToClass } from "class-transformer";

@Injectable({
    providedIn: "root"
})
export class ClientService {
    constructor(private httpClient: HttpClient) {}

    public login(): Observable<TokenDto> {
        const httpOptions: { headers: HttpHeaders } = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Authorization: btoa(`${environment.applicationId}:${environment.applicationSecret}`)
            })
        };
        return this.httpClient.post("/client/login", {}, httpOptions).pipe(
            map((httpResult) => {
                return plainToClass(TokenDto, httpResult);
            })
        );
    }
}
