import { Injectable } from "@angular/core";
import { EvmContractsStore } from "./evm-contracts-store";
import { SupportService } from "../services/support/support.service";
import { Observable, switchMap } from "rxjs";
import { EvmContractDto } from "@swan/dto";
import { mobxStream } from "../utils/stream-utils";

@Injectable({ providedIn: "root" })
export class EvmContractsFacade {
    constructor(private readonly _store: EvmContractsStore, private readonly _supportService: SupportService) {}

    streamMarketplaceContracts(): Observable<Array<EvmContractDto>> {
        const observable = mobxStream(() => this._store.marketplaceContracts);

        if (this._store.marketplaceContracts.length === 0) {
            return this._supportService.getEvmMarketplaceContracts().pipe(
                switchMap((contracts) => {
                    this._store.setMarketplaceContracts(contracts);
                    return observable;
                })
            );
        }

        return observable;
    }

    streamErc721Contracts(): Observable<Array<EvmContractDto>> {
        const observable = mobxStream(() => this._store.erc721Contracts);

        if (this._store.erc721Contracts.length === 0) {
            return this._supportService.getEvmErc721Contracts().pipe(
                switchMap((contracts) => {
                    this._store.setErc721Contracts(contracts);
                    return observable;
                })
            );
        }

        return observable;
    }
}
