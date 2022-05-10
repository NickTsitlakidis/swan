import { Injectable } from "@angular/core";
import {
    Blockchains,
    CompleteSignatureAuthenticationDto,
    NonceDto,
    StartSignatureAuthenticationDto
} from "@nft-marketplace/common";
import { WalletName } from "@solana/wallet-adapter-base";
import { LocalStorageService } from "ngx-webstorage";
import { Observable } from "rxjs";
import { BlockChains } from "../interfaces/blockchain.interface";
import { UserAuthService } from "./authentication/user_auth.service";
import { EthereumWalletService } from "./chains/ethereum.wallet.service";
import { MetaMaskAuthService } from "./chains/metamask.wallet.service";
import { SolanaWalletService } from "./chains/solana.wallet.service";

@Injectable({
    providedIn: "root"
})
export class BlockChainService {
    constructor(
        private _solanaWalletService: SolanaWalletService,
        private _ethereumWalletService: EthereumWalletService,
        private _lcStorage: LocalStorageService,
        private _userAuthService: UserAuthService
    ) {}

    public getWallets(): Observable<BlockChains>[] {
        return [this._solanaWalletService.getWallets(), this._ethereumWalletService.getWallets("metamask")];
    }

    public startChainAuth(
        service: SolanaWalletService | MetaMaskAuthService | undefined /* TODO add for other chains services */
    ): void {
        service?.getPublicKey().subscribe((address: string | string[] | undefined) => {
            if (Array.isArray(address)) {
                address = address[0];
            }
            const userData = this._userAuthService.getUserTokenData();
            if (address && !userData.tokenValue) {
                this._loginUser(service, address);
            }
        });
    }

    public getWalletName() {
        return this._lcStorage.retrieve("walletName");
    }

    public getBlockchain(): Blockchains {
        const chain: Blockchains = this._lcStorage.retrieve("blockchainName");
        return chain;
    }

    public setBlockchain(chainName: string | undefined) {
        this._lcStorage.store("blockchainName", chainName);
    }

    public setWalletName(walletName: string) {
        this._lcStorage.store("walletName", walletName);
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

    /* TODO: Check for Multi chain wallets */
    private _filterChains(chains: BlockChains[], walletName: WalletName): BlockChains | undefined {
        const chain = chains.find((chain) => {
            return chain.wallets.find((wallet) => {
                return wallet.adapter.name === walletName;
            });
        });
        return chain;
    }

    private _loginUser(service: SolanaWalletService | MetaMaskAuthService, address: string) {
        const body: StartSignatureAuthenticationDto = {
            walletAddress: address,
            wallet: this.getWalletName(),
            blockchain: this.getBlockchain()
        };
        this._userAuthService.getNonce(body).subscribe((res: NonceDto) => {
            service.onSignMessage(res.nonce)?.subscribe((signedMessage: string) => {
                const completeAuthBody: CompleteSignatureAuthenticationDto = {
                    walletAddress: address,
                    blockchain: this.getBlockchain(),
                    signature: signedMessage
                };
                this._userAuthService.completeAuthentication(completeAuthBody).subscribe((data) => {
                    console.log(data);
                });
            });
        });
    }
}
