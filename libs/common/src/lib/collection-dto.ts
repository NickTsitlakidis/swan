import { Blockchains } from "./blockchains";
import { CollectionLinksDto } from "./collection-links-dto";
import { ApiProperty } from "@nestjs/swagger";

export class CollectionDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    categoryId: string;
    @ApiProperty()
    customUrl: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    isExplicit: boolean;
    @ApiProperty()
    imageUrl: string;
    @ApiProperty()
    links: CollectionLinksDto;
    @ApiProperty()
    salePercentage: number;
    @ApiProperty({ enum: Blockchains })
    blockchain: Blockchains;
    @ApiProperty()
    paymentToken: string;
    @ApiProperty()
    assetsCount: number;
}
