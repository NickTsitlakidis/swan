export class UploadNftImageCommand {
    nftId: string;
    userId: string;
    fileBuffer: Buffer;


    constructor(nftId: string, userId: string, fileBuffer: Buffer) {
        this.nftId = nftId;
        this.userId = userId;
        this.fileBuffer = fileBuffer;
    }
}