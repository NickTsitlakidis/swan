export class NftDto {

    constructor(public metadataUri: string, public id: string) {
        this.metadataUri = metadataUri;
        this.id = id;
    }
}