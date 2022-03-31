import { ApiProperty } from "@nestjs/swagger";

export class CollectionLinksDto {
    @ApiProperty()
    instagram: string;
    @ApiProperty()
    discord: string;
    @ApiProperty()
    telegram: string;
    @ApiProperty()
    website: string;
    @ApiProperty()
    medium: string;
}
