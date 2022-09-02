import { Injectable } from "@angular/core";
import { BlockchainWalletsStore } from "./blockchain-wallets-store";
import { SupportService } from "../services/support/support.service";
import { Observable, Subject } from "rxjs";
import { BlockchainWalletDto } from "@swan/dto";
import { reaction } from "mobx";

@Injectable({ providedIn: "root" })
export class BlockchainWalletsFacade {
    private _subject: Subject<BlockchainWalletDto[]>;

    constructor(private _store: BlockchainWalletsStore, private _supportService: SupportService) {
        this._subject = new Subject<BlockchainWalletDto[]>();
        reaction(
            () => this._store.wallets,
            (wallets) => {
                this._subject.next(wallets);
            }
        );
    }

    streamWallets(): Observable<Array<BlockchainWalletDto>> {
        if (this._store.wallets.length === 0) {
            this._supportService.getBlockchainWallets().subscribe((wallets) => {
                this._store.setWallets(wallets);
            });
        }

        return this._subject.asObservable();
    }
}
