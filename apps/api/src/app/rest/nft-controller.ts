import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { NftMetadataDto } from "@nft-marketplace/common";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { UploaderService } from "../support/uploader/uploader-service";

@Controller("nft")
export class NftController {
    constructor(private _uploaderService: UploaderService) {}

    @Post("/upload/metadata/")
    @UseGuards(UserGuard)
    async uploadFile(@RequestUserId() userId: string, @Body() dto: NftMetadataDto) {
        return this._uploaderService.uploadSolanaMetadata(dto);
    }
}
