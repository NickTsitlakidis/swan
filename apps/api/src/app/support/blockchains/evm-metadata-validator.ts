import * as Joi from "joi";
import { isNil } from "lodash";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EvmMetadataValidator {
    validate(metadata: unknown): boolean {
        const schema = Joi.object({
            name: Joi.string().required(),
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
                        display_type: Joi.string()
                    })
                )
        }).unknown();

        return isNil(schema.validate(metadata).error);
    }
}
