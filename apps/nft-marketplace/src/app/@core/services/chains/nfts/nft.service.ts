import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EntityDto, NftDto, NftMetadataDto, NftMintTransactionDto, ProfileNftDto } from "@swan/dto";
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

    public createExternalNft(body: ProfileNftDto): Observable<NftDto> {
        return this._httpClient.post<NftDto>("/nft/create-external", body);
    }

    public mintNft(body: NftMintTransactionDto): Observable<EntityDto> {
        return this._httpClient.post<EntityDto>("/nft/mint", body);
    }
}
