import { Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadNftImageCommand } from "../commands/nft/upload-nft-image-command";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CommandBus } from "@nestjs/cqrs";

@Controller("nft")
export class NftController {

    constructor(private _commandBus: CommandBus) {
    }

    @Post(':nftId/upload/image/')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(UserGuard)
    async uploadFile(@UploadedFile() file,
                     @Param() params,
                     @RequestUserId() userId: string) {
        const command  = new UploadNftImageCommand(params.nftId, userId, file.buffer);
        return this._commandBus.execute(command);

        // const wallet = Keypair.generate();
        // const key = wallet.secretKey;
        //
        // const savedImage = fs.writeFileSync("mplampla.jpg", file.buffer);
        //
        // const client = NFTStorageMetaplexor.withSecretKey(key, {
        //     solanaCluster: 'devnet',
        //     mintingAgent: 'swan',
        // });
        //
        // const metadata = {
        //     "name": "Swan2 Solana NFT Test",
        //     "symbol": "",
        //     "description": "A dummy test",
        //     "seller_fee_basis_points": 0,
        //     "image": "./mplampla.jpg",
        //     "animation_url": "https://www.arweave.net/efgh1234?ext=mp4",
        //     "external_url": "https://solflare.com",
        //     "attributes": [
        //         {
        //             "trait_type": "web",
        //             "value": "yes"
        //         },
        //         {
        //             "trait_type": "mobile",
        //             "value": "yes"
        //         },
        //         {
        //             "trait_type": "extension",
        //             "value": "yes"
        //         }
        //     ],
        //     "collection": {
        //         "name": "Swan dummy collection",
        //         "family": "Swan"
        //     },
        //     "properties": {
        //         "files": [
        //             {
        //                 "uri": "./mplampla.jpg",
        //                 "type": "image/jpg"
        //             }
        //         ],
        //         "category": "image",
        //         "creators": [
        //             {
        //                 "address": "SOLFLR15asd9d21325bsadythp547912501b",
        //                 "share": 100
        //             }
        //         ]
        //     }
        // }
        //
        // const savedMetadata = fs.writeFileSync("metadata.json", JSON.stringify(metadata));
        //
        // const result = await client.storeNFTFromFilesystem("./metadata.json");
        //
        // console.log(result);
    }
}