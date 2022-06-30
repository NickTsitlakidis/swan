import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NftDto, NftMetadataDto } from "@nft-marketplace/common";
import { Observable } from "rxjs";
import { CoreModule } from "../../../core.module";

@Injectable({
    providedIn: CoreModule
})
export class NftService {
    constructor(private _httpClient: HttpClient) {}

    public createNft(body: NftMetadataDto): Observable<NftDto> {
        return this._httpClient.post<NftDto>("/nft/create", body);
    }
}
