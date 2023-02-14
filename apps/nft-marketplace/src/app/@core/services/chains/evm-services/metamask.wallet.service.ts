import { Injectable } from "@angular/core";
import { EvmService } from "./evm.service";
import { ContractFactory } from "@swan/contracts";
import { SupportedWallets } from "@swan/dto";

@Injectable()
export class MetamaskWalletService extends EvmService {
    private _walletType = SupportedWallets.METAMASK;

    constructor(contractFactory: ContractFactory) {
        super(contractFactory);
    }

    public override async getEthersProvider() {
        if (!this.wallet || this.wallet !== this._walletType) {
            this.wallet = this._walletType;
            if ((window as any).ethereum.isMetaMask) {
                this._externalProvider = await (window as any).ethereum.isMetaMask;
            } else {
                this._externalProvider = await (window as any).ethereum.providers?.find(
                    (provider: { isMetaMask: any }) => provider.isMetaMask
                );
            }
        }

        return super.getEthersProvider();
    }
}
