export class WalletDto {
    id: string;

    name: string;
    blockchainId: string;

    constructor(id: string, name: string, blockchainId: string) {
        this.id = id;
        this.name = name;
        this.blockchainId = blockchainId;
    }
}
