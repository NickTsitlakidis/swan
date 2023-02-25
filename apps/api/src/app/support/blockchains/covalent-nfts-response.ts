export interface ExternalData {
    name: string;
    description: string;
    image: string;
    image_256: string;
    image_512: string;
    image_1024: string;
    animation_url?: string;
    external_url?: string;
    attributes?: any[];
    owner?: string;
}

export interface NftData {
    token_id: string;
    token_balance: string;
    token_url: string;
    supports_erc: string[];
    token_price_wei?: number;
    token_quote_rate_eth?: number;
    original_owner: string;
    external_data: ExternalData;
    owner: string;
    owner_address?: string;
    burned?: any;
}

export interface Item {
    contract_decimals: number;
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    supports_erc: string[];
    logo_url: string;
    last_transferred_at?: string;
    native_token: boolean;
    type: string;
    balance: string;
    balance_24h?: string;
    quote_rate?: number;
    quote_rate_24h?: number;
    quote: number;
    quote_24h?: number;
    nft_data: NftData[];
}

export interface Data {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    chain_id: number;
    items: Item[];
    pagination?: any;
}

export interface CovalentNftsResponse {
    data: Data;
    error: boolean;
    error_message?: string;
    error_code?: number;
}
