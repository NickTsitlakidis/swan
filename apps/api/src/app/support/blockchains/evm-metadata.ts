export interface EvmMetadata {
    name: string;
    description: string;
    image: string;
    attributes?: Array<EvmMetadataAttribute>;
}

export interface EvmMetadataAttribute {
    trait_type: string;
    display_type?: "number" | "date";
    value: string | number;
}
