import { CollectionLinksDto } from "./collection-links-dto";
import { Blockchains } from "./blockchains";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateCollectionDto {
    @ApiProperty()
    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;

    @ApiProperty({ enum: Blockchains })
    blockchain: Blockchains;

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
    salePercentage: number;
    @ApiProperty()
    paymentToken: string;
}
