import { ApiProperty } from "@nestjs/swagger";

export class AvailabilityDto {
    @ApiProperty()
    isAvailable: boolean;

    constructor(isAvailable: boolean) {
        this.isAvailable = isAvailable;
    }
}
