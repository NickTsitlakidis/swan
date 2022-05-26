import { Injectable } from "@angular/core";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Observable, from, map, switchMap, of, throwError } from "rxjs";
import metamaskIcon from "../../../../assets/images/base64/metamask.base64.json";
import { BlockChains } from "../../interfaces/blockchain.interface";
import { ethers } from "ethers";
import { isNil } from "lodash";

@Injectable({
    providedIn: "root"
})
export class MetaMaskAuthService {
    private _ethersProvider: ethers.providers.Web3Provider;

    public getWallets(): Observable<BlockChains> {
        const blockchain: BlockChains = {
            chain: {
                title: "Ethereum",
                imageUrl: "",
                service: this
            },
            wallets: [
                {
                    adapter: {
                        name: "Metamask",
                        icon: metamaskIcon.imageUrl
                    },
                    readyState: WalletReadyState.Installed
                }
            ]
        };
        return of(blockchain);
    }

    public getPublicKey(): Observable<string | undefined> {
        return this.getEthersProvider().pipe(
            switchMap(() => {
                return this._ethersProvider.getSigner().getAddress();
            })
        )
    }

    public onSelectWallet(): Observable<string | undefined> {
        return this.getPublicKey();
    }

    public onSignMessage(msg: string): Observable<string> | undefined {
        return this.getEthersProvider().pipe(
            map((provider) => provider.getSigner()),
            switchMap((signer) => {
                return from(signer.signMessage(msg))
            })
        );
    }

    private getEthersProvider(): Observable<ethers.providers.Web3Provider> {
        const externalProvider = (window as any).ethereum;
        if(!isNil(externalProvider)) {
            if(!isNil(this._ethersProvider)) {
                return of(this._ethersProvider);
            }
            this._ethersProvider = new ethers.providers.Web3Provider(externalProvider)
            return from(this._ethersProvider.send("eth_requestAccounts", [])).pipe(map(() => this._ethersProvider));
        } else {
            return throwError(() => "Ethereum object is not added to window");
        }
    }
}
