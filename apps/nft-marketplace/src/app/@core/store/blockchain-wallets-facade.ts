import { Injectable } from "@angular/core";
import { BlockchainWalletsStore } from "./blockchain-wallets-store";
import { SupportService } from "../services/support/support.service";
import { Observable, switchMap } from "rxjs";
import { BlockchainWalletDto } from "@swan/dto";
import { mobxStream } from "../utils/stream-utils";

@Injectable({ providedIn: "root" })
export class BlockchainWalletsFacade {
    constructor(private _store: BlockchainWalletsStore, private _supportService: SupportService) {}

    streamWallets(): Observable<Array<BlockchainWalletDto>> {
        const observable = mobxStream(() => this._store.wallets);

        if (this._store.wallets.length === 0) {
            return this._supportService.getBlockchainWallets().pipe(
                switchMap((wallets) => {
                    this._store.setWallets(wallets);
                    return observable;
                })
            );
        }

        return observable;
    }
}
