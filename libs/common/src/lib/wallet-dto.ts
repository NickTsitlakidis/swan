import { ApiProperty } from "@nestjs/swagger";

export class WalletDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    blockchain: string;

    @ApiProperty()
    name: string;

    constructor(id: string, blockchain: string, name: string) {
        this.id = id;
        this.blockchain = blockchain;
        this.name = name;
    }
}
