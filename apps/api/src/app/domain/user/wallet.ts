import { Blockchains, SupportedWallets } from "@nft-marketplace/common";

export class Wallet {
    constructor(public id: string,
                public address: string,
                public blockchain: Blockchains,
                public name: SupportedWallets) {
    }
}
