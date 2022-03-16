import { Injectable } from "@angular/core";
import detectEthereumProvider from "@metamask/detect-provider";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Observable, from, map, first, switchMap, of } from "rxjs";
import metamaskIcon from "../../../../assets/images/base64/metamask.base64.json";
import { BlockChains } from "../../interfaces/blockchain.interface";

@Injectable({
    providedIn: "root"
})
export class MetaMaskAuthService {
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
        return from(detectEthereumProvider()).pipe(
            switchMap(async (provider: any) => {
                if (!provider) {
                    throw new Error("Please install MetaMask");
                }

                return await provider.request({ method: "eth_requestAccounts" });
            }),
            first()
        );
    }

    public onSelectWallet(): Observable<string | undefined> {
        const observable = from(this.getPublicKey());
        return observable.pipe(
            map((data: any) => {
                return data?.toString();
            }),
            first()
        );
    }

    public onSignMessage(msg: string): Observable<string> | undefined {
        return from(detectEthereumProvider()).pipe(
            switchMap(async (provider: any) => {
                const signed = (await provider.request({
                    method: "personal_sign",
                    params: [msg, provider.selectedAddress]
                })) as string;
                return signed;
            }),
            map((signature: string) => {
                return signature;
            }),
            first()
        );
    }
}
