import { ApiProperty } from "@nestjs/swagger";

export class CollectionDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    blockchain: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    items: object[];

    constructor(id: string, blockchain: string, name: string, items: object[]) {
        this.id = id;
        this.blockchain = blockchain;
        this.name = name;
        this.items = items;
    }
}
