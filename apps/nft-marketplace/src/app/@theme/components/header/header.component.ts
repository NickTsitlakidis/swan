import { Component, OnInit } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { WalletName } from "@solana/wallet-adapter-base";

import { SolanaWalletService } from "../../../@core/services/solana.wallet.service";
@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    chains: { chain: { title: string; imageUrl: string }; wallets: Wallet[] }[] | undefined;

    constructor(private _solanaWalletService: SolanaWalletService) {}

    ngOnInit() {
        this._solanaWalletService.getWallets().subscribe((wallets) => {
            this.chains = [
                {
                    chain: {
                        title: "Solana",
                        imageUrl: ""
                    },
                    wallets
                }
            ];
        });
    }

    walletSelected(walletName: WalletName) {
        this._solanaWalletService.onSelectWallet(walletName);
    }
}
