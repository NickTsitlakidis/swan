export class WalletDto {
    id: string;

    blockchain: string;

    name: string;

    constructor(id: string, blockchain: string, name: string) {
        this.id = id;
        this.blockchain = blockchain;
        this.name = name;
    }
}
