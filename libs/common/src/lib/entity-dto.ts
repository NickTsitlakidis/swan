import { ApiProperty } from "@nestjs/swagger";

export class EntityDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    version: number;

    constructor(id: string, version: number) {
        this.id = id;
        this.version = version;
    }
}
