import { Injectable } from "@nestjs/common";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { EvmMetadata } from "../uploader/evm-metadata";
import { UploadedFiles } from "../uploader/uploaded-files";
import { BlockchainActions } from "./blockchain-actions";

@Injectable()
export class EvmActionsService extends BlockchainActions {
    async uploadMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
        const imageUri = await this.uploadImage(metadata.s3uri);

        const mapped: EvmMetadata = {
            name: metadata.name,
            image: imageUri,
            description: metadata.description,
            attributes: metadata.attributes?.map((at) => {
                return {
                    trait_type: at.traitType,
                    value: at.value,
                    display_type: at.displayType as any //todo : fix this by restricting types for all chains
                };
            })
        };
        const metadataUri = await this.uploadMetadataToStorage(JSON.stringify(mapped), metadata.s3uri);
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }
}
