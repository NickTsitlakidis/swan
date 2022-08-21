export class EntityDto {
    id: string;

    version: number;

    constructor(id: string, version = 0) {
        this.id = id;
        this.version = version;
    }
}
