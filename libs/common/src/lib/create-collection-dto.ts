import { CollectionLinksDto } from "./collection-links-dto";
import { Blockchains } from "./blockchains";
import { ApiProperty } from "@nestjs/swagger";
import { CollectionDescriptor } from "./descriptors/collection-descriptor";

export class CreateCollectionDto implements CollectionDescriptor {
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
}
