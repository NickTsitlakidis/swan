import { ApiProperty } from "@nestjs/swagger";

export class CategoryDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    imageUrl: string;
    @ApiProperty()
    id: string;

    constructor(name: string, imageUrl: string, id: string) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.id = id;
    }
}
