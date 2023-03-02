import * as Joi from "joi";
import { isNil } from "@nft-marketplace/utils";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MetadataValidator {
    validate(metadata: unknown): boolean {
        const schema = Joi.object({
            name: Joi.string().required(),
            metadataUri: Joi.string().allow(null),
            nftAddress: Joi.string().allow(null),
            description: Joi.string().allow("").required(),
            image: Joi.string().uri().required(),
            animation_url: Joi.string().allow(null).uri(),
            external_url: Joi.string().allow(null).uri(),
            attributes: Joi.array()
                .allow(null)
                .items(
                    Joi.object({
                        trait_type: Joi.string().required(),
                        value: Joi.string().required(),
                        display_type: Joi.string().allow("")
                    })
                )
        }).unknown();

        return isNil(schema.validate(metadata).error);
    }
}
