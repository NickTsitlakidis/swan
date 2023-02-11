import { Injectable } from "@angular/core";
import { ChainsModule } from "../chains.module";
import { EvmService } from "./evm.service";
import { ContractFactory } from "@swan/contracts";
import { from, Observable, switchMap } from "rxjs";
import { SupportedWallets } from "@swan/dto";

@Injectable({
    providedIn: ChainsModule
})
export class BinanceWalletService extends EvmService {
    private _walletType = SupportedWallets.BINANCE;

    constructor(contractFactory: ContractFactory) {
        super(contractFactory);
    }

    public override getEthersProvider() {
        if (!this.wallet || this.wallet !== this._walletType) {
            this.wallet = this._walletType;
            this._externalProvider = (window as any)?.BinanceChain;
        }
        return super.getEthersProvider();
    }

    public override getPublicKey(): Observable<string> {
        return from(this.getEthersProvider()).pipe(
            switchMap((provider) => {
                console.log(provider);
                console.log((window as any)?.BinanceChain.getAccount());
                return (window as any)?.BinanceChain.getAccount() as string;
            })
        );
    }
}
