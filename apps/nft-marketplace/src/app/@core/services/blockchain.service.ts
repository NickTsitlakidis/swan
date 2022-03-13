import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { CompleteAuthenticationDto, NonceDto, StartAuthenticationDto, TokenDto } from "@nft-marketplace/common";
import { WalletName } from "@solana/wallet-adapter-base";
import { LocalStorageService } from "ngx-webstorage";
import { map, Observable } from "rxjs";
import { BlockChains } from "../interfaces/blockchain.interface";
import { UserAuthService } from "./authentication/user_auth.service";
import { SolanaWalletService } from "./chains/solana.wallet.service";

@Injectable({
    providedIn: "root"
})
export class BlockChainService {
    constructor(
        private _solanaWalletService: SolanaWalletService,
        private _lcStorage: LocalStorageService,
        private _userAuthService: UserAuthService
    ) {}

    public getWallets(): Observable<BlockChains[]> {
        return this._solanaWalletService.getWallets().pipe(
            map((wallets: Wallet[]) => {
                return [
                    {
                        chain: {
                            title: "Solana",
                            imageUrl: "",
                            service: this._solanaWalletService
                        },
                        wallets
                    }
                ];
            })
        );
    }

    public startChainAuth(service: SolanaWalletService | undefined /* TODO add for other chains services */): void {
        if (service) {
            service.getPublicKey().subscribe((address: string | undefined) => {
                const userData = this._userAuthService.getUserTokenData();
                if (address && !userData.tokenValue) {
                    this._loginUser(service, address);
                }
            });
        }
    }

    public getWalletName() {
        return this._lcStorage.retrieve("walletName");
    }

    public getWalletServiceByName(walletName: WalletName, chains: BlockChains[] | undefined): BlockChains | undefined {
        if (!chains) {
            return;
        }
        return this._filterChains(chains, walletName);
    }

    /*********************************************************
     *                  Private Methods
     *********************************************************/

    private _filterChains(chains: BlockChains[], walletName: WalletName): BlockChains | undefined {
        const chain = chains.find((chain) => {
            return chain.wallets.find((wallet) => {
                return wallet.adapter.name === walletName;
            });
        });
        return chain;
    }

    private _loginUser(service: SolanaWalletService, address: string) {
        const body: StartAuthenticationDto = { walletAddress: address };
        this._userAuthService.getNonce(body).subscribe((res: NonceDto) => {
            service.onSignMessage(res.nonce)?.subscribe((signedMessage: string) => {
                const completeAuthBody: CompleteAuthenticationDto = {
                    walletAddress: address,
                    walletType: this.getWalletName(),
                    signature: signedMessage
                };
                this._userAuthService.completeAuthentication(completeAuthBody).subscribe((res: TokenDto) => {
                    this._userAuthService.storeUserData(res);
                });
            });
        });
    }
}
