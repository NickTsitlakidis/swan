export class WalletDto {
    id: string;

    name: string;
    chainId: string;

    constructor(id: string, name: string, chainId: string) {
        this.id = id;
        this.name = name;
        this.chainId = chainId;
    }
}
