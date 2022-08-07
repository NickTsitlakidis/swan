import * as Joi from "joi";
import { isNil } from "lodash";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EvmMetadataValidator {
    validate(metadata: Record<any, any>): boolean {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().uri().required(),
            animation_url: Joi.string().uri(),
            external_url: Joi.string().uri(),
            attributes: Joi.array()
                .items(
                    Joi.object({
                        trait_type: Joi.string().required(),
                        value: Joi.string().required(),
                        display_type: Joi.string()
                    })
                )
                .required()
        });

        return isNil(schema.validate(metadata).error);
    }
}
