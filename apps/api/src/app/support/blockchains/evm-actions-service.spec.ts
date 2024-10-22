import { CovalentService } from "./covalent-service";
import { CategoryRepository } from "../categories/category-repository";
import { BlockchainRepository } from "./blockchain-repository";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { EvmActionsService } from "./evm-actions-service";
import { HttpService } from "@nestjs/axios";
import { MetadataValidator } from "./metadata-validator";
import { InternalServerErrorException } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { Blockchain } from "./blockchain";
import { CovalentNftsResponse } from "./covalent-nfts-response";
import { Category } from "../categories/category";
import { ChainNft } from "./chain-nft";
import { EvmContractsRepository } from "../evm-contracts/evm-contracts-repository";
import { EvmContract } from "../evm-contracts/evm-contract";
import { EvmContractType } from "../evm-contracts/evm-contract-type";
import { of } from "rxjs";

let service: EvmActionsService;
let blockchainRepo: BlockchainRepository;
let categoryRepo: CategoryRepository;
let covalentService: CovalentService;
let httpService: HttpService;
let validator: MetadataValidator;
let contractsRepo: EvmContractsRepository;

const covalentResponse: CovalentNftsResponse = {
    error: false,
    error_message: undefined,
    error_code: undefined,
    data: {
        address: "0x8438a93e0d2c5986bc9336490add3961fd127782",
        updated_at: "2022-08-14T19:06:38.128993333Z",
        next_update_at: "2022-08-14T19:11:38.128993463Z",
        quote_currency: "USD",
        chain_id: 250,
        items: [
            {
                contract_decimals: 0,
                contract_name: "Artion",
                contract_ticker_symbol: "ART",
                contract_address: "0x61af4d29f672e27a097291f72fc571304bc93521",
                supports_erc: ["erc20", "erc721"],
                logo_url: "https://logos.covalenthq.com/tokens/250/0x61af4d29f672e27a097291f72fc571304bc93521.png",
                last_transferred_at: "2022-07-16T18:35:07Z",
                native_token: false,
                type: "nft",
                balance: "1",
                balance_24h: undefined,
                quote_rate: 0.0,
                quote_rate_24h: undefined,
                quote: 0.0,
                quote_24h: undefined,
                nft_data: [
                    {
                        token_id: "11001",
                        token_balance: "1",
                        token_url: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G",
                        supports_erc: ["erc20", "erc721"],
                        token_price_wei: undefined,
                        token_quote_rate_eth: undefined,
                        original_owner: "0xe5dfee9b72dcb2e3aca9895bc8dec15b3e8b74dc",
                        external_data: {
                            name: "night123",
                            description: "",
                            image: "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_256:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=256,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_512:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=512,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_1024:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=1024,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            animation_url: undefined,
                            external_url: undefined,
                            attributes: []
                        },
                        owner: "0x8438a93e0d2c5986bc9336490add3961fd127782",
                        burned: null
                    }
                ]
            },
            {
                contract_decimals: 0,
                contract_name: "Artion",
                contract_ticker_symbol: "ART",
                contract_address: "0x61af4d29f672e27a097291f72fc571304bc93521",
                supports_erc: ["erc20", "erc721"],
                logo_url: "https://logos.covalenthq.com/tokens/250/0x61af4d29f672e27a097291f72fc571304bc93521.png",
                last_transferred_at: "2022-07-16T18:35:07Z",
                native_token: false,
                type: "nft",
                balance: "1",
                quote_rate: 0.0,
                quote: 0.0,
                nft_data: [
                    {
                        token_id: "11001",
                        token_balance: "1",
                        token_url: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G",
                        supports_erc: ["erc20", "erc721"],
                        original_owner: "0xe5dfee9b72dcb2e3aca9895bc8dec15b3e8b74dc",
                        external_data: {
                            name: "night123",
                            description: "",
                            image: "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_256:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=256,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_512:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=512,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_1024:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=1024,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            animation_url: undefined,
                            external_url: undefined,
                            attributes: []
                        },
                        owner: "0x8438a93e0d2c5986bc9336490add3961fd127782",
                        burned: null
                    },
                    {
                        token_id: "2",
                        token_balance: "1",
                        token_url: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G",
                        supports_erc: ["erc20", "erc721"],
                        original_owner: "0xe5dfee9b72dcb2e3aca9895bc8dec15b3e8b74dc",
                        external_data: {
                            name: "night123",
                            description: "",
                            image: "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_256:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=256,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_512:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=512,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_1024:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=1024,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            animation_url: undefined,
                            external_url: undefined,
                            attributes: []
                        },
                        owner: "0x8438a93e0d2c5986bc9336490add3961fd127782",
                        burned: null
                    }
                ]
            },
            {
                contract_decimals: 0,
                contract_name: "Swan",
                contract_ticker_symbol: "ART",
                contract_address: "swan-contract",
                supports_erc: ["erc20", "erc721"],
                logo_url: "https://logos.covalenthq.com/tokens/250/0x61af4d29f672e27a097291f72fc571304bc93521.png",
                last_transferred_at: "2022-07-16T18:35:07Z",
                native_token: false,
                type: "nft",
                balance: "1",
                quote_rate: 0.0,
                quote: 0.0,
                nft_data: [
                    {
                        token_id: "11001",
                        token_balance: "1",
                        token_url: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G",
                        supports_erc: ["erc20", "erc721"],
                        original_owner: "0xe5dfee9b72dcb2e3aca9895bc8dec15b3e8b74dc",
                        external_data: {
                            name: "night123",
                            description: "",
                            image: "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_256:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=256,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_512:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=512,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_1024:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=1024,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            animation_url: undefined,
                            external_url: undefined,
                            attributes: []
                        },
                        owner: "0x8438a93e0d2c5986bc9336490add3961fd127782",
                        burned: null
                    },
                    {
                        token_id: "2",
                        token_balance: "1",
                        token_url: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G",
                        supports_erc: ["erc20", "erc721"],
                        original_owner: "0xe5dfee9b72dcb2e3aca9895bc8dec15b3e8b74dc",
                        external_data: {
                            name: "night123",
                            description: "",
                            image: "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_256:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=256,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_512:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=512,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            image_1024:
                                "https://image-proxy.svc.prod.covalenthq.com/cdn-cgi/image/width=1024,fit/https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx",
                            animation_url: undefined,
                            external_url: undefined,
                            attributes: []
                        },
                        owner: "0x8438a93e0d2c5986bc9336490add3961fd127782",
                        burned: null
                    }
                ]
            }
        ]
    }
};

beforeEach(async () => {
    const testModule = await getUnitTestingModule(EvmActionsService);
    service = testModule.get(EvmActionsService);
    blockchainRepo = testModule.get(BlockchainRepository);
    covalentService = testModule.get(CovalentService);
    httpService = testModule.get(HttpService);
    validator = testModule.get(MetadataValidator);
    categoryRepo = testModule.get(CategoryRepository);
    contractsRepo = testModule.get(EvmContractsRepository);
});

test("getUserNfts - throws if blockchainId parameter is missing", async () => {
    await expect(service.getUserNfts("otinanai")).rejects.toThrow(InternalServerErrorException);
});

test("getUserNfts - throws if blockchain is missing from db", async () => {
    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(null);

    await expect(service.getUserNfts("otinanai", "the-chain-id")).rejects.toThrow(InternalServerErrorException);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");
});

test("getUserNfts - throws if covalent response is not 200 OK", async () => {
    const blockchain = new Blockchain();
    blockchain.chainIdDecimal = 1000;

    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    const fakeResponse: AxiosResponse = {
        status: 507,
        data: {}
    } as AxiosResponse;
    const covalentServiceSpy = jest.spyOn(covalentService, "fetchNfts").mockResolvedValue(fakeResponse);

    await expect(service.getUserNfts("otinanai", "the-chain-id")).rejects.toThrow(InternalServerErrorException);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");

    expect(covalentServiceSpy).toHaveBeenCalledTimes(1);
    expect(covalentServiceSpy).toHaveBeenCalledWith(blockchain.chainIdDecimal, "otinanai");
});

test("getUserNfts - returns empty array if all nfts are invalid", async () => {
    const blockchain = new Blockchain();
    blockchain.chainIdDecimal = 1000;

    const contracts = [new EvmContract()];
    contracts[0].deploymentAddress = "swan-contract";
    const historySpy = jest.spyOn(contractsRepo, "findByType").mockResolvedValue(contracts);

    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const fakeResponse: AxiosResponse = {
        status: 200,
        data: covalentResponse,
        statusText: ""
    } as AxiosResponse;
    const covalentServiceSpy = jest.spyOn(covalentService, "fetchNfts").mockResolvedValue(fakeResponse);

    const validatorSpy = jest.spyOn(validator, "validate").mockReturnValue(false);

    const returned = await service.getUserNfts("otinanai", "the-chain-id");
    expect(returned.length).toBe(0);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");

    expect(covalentServiceSpy).toHaveBeenCalledTimes(1);
    expect(covalentServiceSpy).toHaveBeenCalledWith(blockchain.chainIdDecimal, "otinanai");

    expect(validatorSpy).toHaveBeenCalledTimes(3);
    expect(validatorSpy).nthCalledWith(1, covalentResponse.data.items[0].nft_data[0].external_data);
    expect(validatorSpy).nthCalledWith(2, covalentResponse.data.items[1].nft_data[0].external_data);
    expect(validatorSpy).nthCalledWith(3, covalentResponse.data.items[1].nft_data[1].external_data);

    expect(historySpy).toHaveBeenCalledTimes(1);
    expect(historySpy).toHaveBeenCalledWith(EvmContractType.ERC721);
});

test("getUserNfts - returns empty array if all nfts are erc20", async () => {
    const blockchain = new Blockchain();
    blockchain.chainIdDecimal = 1000;

    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const clonedResponse = JSON.parse(JSON.stringify(covalentResponse));
    clonedResponse.data.items.forEach((item: any) => {
        item.supports_erc = ["erc20"];
    });

    const fakeResponse: AxiosResponse = {
        status: 200,
        data: clonedResponse,
        statusText: ""
    } as AxiosResponse;
    const covalentServiceSpy = jest.spyOn(covalentService, "fetchNfts").mockResolvedValue(fakeResponse);

    const validatorSpy = jest.spyOn(validator, "validate").mockReturnValue(false);

    const returned = await service.getUserNfts("otinanai", "the-chain-id");
    expect(returned.length).toBe(0);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");

    expect(covalentServiceSpy).toHaveBeenCalledTimes(1);
    expect(covalentServiceSpy).toHaveBeenCalledWith(blockchain.chainIdDecimal, "otinanai");

    expect(validatorSpy).toHaveBeenCalledTimes(0);
});

test("getUserNfts - returns empty array if user has no items", async () => {
    const blockchain = new Blockchain();
    blockchain.chainIdDecimal = 1000;

    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const clonedResponse = JSON.parse(JSON.stringify(covalentResponse));
    clonedResponse.data.items = [];

    const fakeResponse: AxiosResponse = {
        status: 200,
        data: clonedResponse,
        statusText: ""
    } as AxiosResponse;
    const covalentServiceSpy = jest.spyOn(covalentService, "fetchNfts").mockResolvedValue(fakeResponse);

    const validatorSpy = jest.spyOn(validator, "validate").mockReturnValue(false);

    const returned = await service.getUserNfts("otinanai", "the-chain-id");
    expect(returned.length).toBe(0);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");

    expect(covalentServiceSpy).toHaveBeenCalledTimes(1);
    expect(covalentServiceSpy).toHaveBeenCalledWith(blockchain.chainIdDecimal, "otinanai");

    expect(validatorSpy).toHaveBeenCalledTimes(0);
});

test("getUserNfts - returns array of valid erc721 or valid erc1155", async () => {
    const historySpy = jest.spyOn(contractsRepo, "findByType").mockResolvedValue([]);

    const blockchain = new Blockchain();
    blockchain.chainIdDecimal = 1000;

    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const clonedResponse: any = JSON.parse(JSON.stringify(covalentResponse));
    clonedResponse.data.items[0].supports_erc = ["erc20"];
    clonedResponse.data.items.pop();

    const fakeResponse: AxiosResponse = {
        status: 200,
        data: clonedResponse,
        statusText: ""
    } as AxiosResponse;

    const fakeResponseForFileTypeCategories: AxiosResponse = {
        headers: {
            "Content-Type": "image/png"
        },
        status: 206,
        statusText: "Partial Content",
        data: new Uint8Array([
            137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 200, 0, 0, 0, 200, 8, 6, 0, 0, 0,
            173, 88, 174, 158, 0, 0, 0, 1, 115, 82, 71, 66, 0, 174, 206, 28, 233, 0, 0, 0, 68, 101, 88, 73, 102, 77, 77,
            0, 42, 0, 0, 0, 8, 0, 1, 135, 105, 0, 4, 0, 0, 0, 1, 0, 0, 0, 26, 0, 0, 0, 0, 0, 3, 160, 1, 0, 3, 0, 0, 0,
            1, 0, 1, 0, 0, 160, 2, 0, 4, 0, 0, 0, 1, 0, 0, 0, 200, 160, 3, 0, 4, 0, 0, 0, 1, 0, 0, 0, 200, 0, 0, 0, 0,
            155, 91, 61, 149, 0, 0, 64, 0, 73, 68, 65, 84, 120, 1, 237, 93, 7, 120, 84, 69, 215, 62, 155, 132, 14, 33,
            141, 14, 73, 72, 2, 1, 129, 208, 68, 58, 134, 22, 170, 2, 42, 40, 189, 137, 160, 162, 232, 231, 103, 111,
            216, 191, 223, 2, 34, 32, 136, 93, 138, 34, 10, 98, 3, 84, 154, 160, 168, 180, 16, 154, 129, 116, 2, 36,
            244, 78, 10, 100, 255
        ])
    } as AxiosResponse;

    const category = new Category();
    category.name = "image";
    category.id = "628ea0716b8991c676c19a4a";

    const httpServiceSpy = jest
        .spyOn(httpService, "get")
        .mockReturnValueOnce(of(fakeResponseForFileTypeCategories))
        .mockReturnValueOnce(of(fakeResponseForFileTypeCategories));

    const covalentServiceSpy = jest.spyOn(covalentService, "fetchNfts").mockResolvedValueOnce(fakeResponse);

    const categorySpy = jest.spyOn(categoryRepo, "findAll").mockResolvedValue([category]);

    const validatorSpy = jest.spyOn(validator, "validate").mockReturnValue(true);

    const returned = await service.getUserNfts("otinanai", "the-chain-id");

    expect(returned.length).toBe(2);

    const expectedNft1: ChainNft = {
        tokenId: covalentResponse.data.items[1].nft_data[0].token_id,
        tokenContractAddress: covalentResponse.data.items[1].contract_address,
        name: covalentResponse.data.items[1].nft_data[0].external_data.name,
        image: covalentResponse.data.items[1].nft_data[0].external_data.image,
        attributes: covalentResponse.data.items[1].nft_data[0].external_data.attributes,
        categoryId: category.id,
        description: covalentResponse.data.items[1].nft_data[0].external_data.description,
        animation_url: covalentResponse.data.items[1].nft_data[0].external_data.animation_url,
        external_url: covalentResponse.data.items[1].nft_data[0].external_data.external_url,
        properties: {
            files: []
        },
        metadataUri: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G"
    };

    const expectedNft2: ChainNft = {
        tokenId: covalentResponse.data.items[1].nft_data[1].token_id,
        tokenContractAddress: covalentResponse.data.items[1].contract_address,
        name: covalentResponse.data.items[1].nft_data[1].external_data.name,
        image: covalentResponse.data.items[1].nft_data[1].external_data.image,
        attributes: covalentResponse.data.items[1].nft_data[1].external_data.attributes,
        description: covalentResponse.data.items[1].nft_data[1].external_data.description,
        categoryId: category.id,
        animation_url: covalentResponse.data.items[1].nft_data[1].external_data.animation_url,
        external_url: covalentResponse.data.items[1].nft_data[1].external_data.external_url,
        properties: {
            files: []
        },
        metadataUri: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G"
    };
    expect(returned[0]).toEqual(expectedNft1);
    expect(returned[1]).toEqual(expectedNft2);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");

    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(covalentServiceSpy).toHaveBeenCalledTimes(1);
    expect(covalentServiceSpy).toHaveBeenCalledWith(blockchain.chainIdDecimal, "otinanai");

    const imageUrl = "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx";
    const imageHeaders = {
        headers: { "Content-Type": "application/json", Range: "bytes=0-300" },
        responseType: "arraybuffer"
    };

    expect(httpServiceSpy).toHaveBeenCalledTimes(2);
    expect(httpServiceSpy).toHaveBeenNthCalledWith(1, imageUrl, imageHeaders);
    expect(httpServiceSpy).toHaveBeenNthCalledWith(2, imageUrl, imageHeaders);

    expect(validatorSpy).toHaveBeenCalledTimes(2);
    expect(validatorSpy).toHaveBeenCalledWith(covalentResponse.data.items[1].nft_data[0].external_data);
    expect(validatorSpy).toHaveBeenCalledWith(covalentResponse.data.items[1].nft_data[1].external_data);

    expect(historySpy).toHaveBeenCalledTimes(1);
    expect(historySpy).toHaveBeenCalledWith(EvmContractType.ERC721);
});

test("getUserNfts - returns array with excluded nfts of swan contracts", async () => {
    const contracts = [new EvmContract()];
    contracts[0].deploymentAddress = "swan-contract";
    const historySpy = jest.spyOn(contractsRepo, "findByType").mockResolvedValue(contracts);

    const blockchain = new Blockchain();
    blockchain.chainIdDecimal = 1000;

    const blockchainRepoSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const clonesResponse: any = JSON.parse(JSON.stringify(covalentResponse));
    clonesResponse.data.items[0].supports_erc = ["erc20"];

    const fakeResponse: AxiosResponse = {
        status: 200,
        data: clonesResponse,
        statusText: ""
    } as AxiosResponse;

    const fakeResponseForFileTypeCategories: AxiosResponse = {
        headers: {
            "Content-Type": "image/png"
        },
        status: 206,
        statusText: "Partial Content",
        data: new Uint8Array([
            137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 200, 0, 0, 0, 200, 8, 6, 0, 0, 0,
            173, 88, 174, 158, 0, 0, 0, 1, 115, 82, 71, 66, 0, 174, 206, 28, 233, 0, 0, 0, 68, 101, 88, 73, 102, 77, 77,
            0, 42, 0, 0, 0, 8, 0, 1, 135, 105, 0, 4, 0, 0, 0, 1, 0, 0, 0, 26, 0, 0, 0, 0, 0, 3, 160, 1, 0, 3, 0, 0, 0,
            1, 0, 1, 0, 0, 160, 2, 0, 4, 0, 0, 0, 1, 0, 0, 0, 200, 160, 3, 0, 4, 0, 0, 0, 1, 0, 0, 0, 200, 0, 0, 0, 0,
            155, 91, 61, 149, 0, 0, 64, 0, 73, 68, 65, 84, 120, 1, 237, 93, 7, 120, 84, 69, 215, 62, 155, 132, 14, 33,
            141, 14, 73, 72, 2, 1, 129, 208, 68, 58, 134, 22, 170, 2, 42, 40, 189, 137, 160, 162, 232, 231, 103, 111,
            216, 191, 223, 2, 34, 32, 136, 93, 138, 34, 10, 98, 3, 84, 154, 160, 168, 180, 16, 154, 129, 116, 2, 36,
            244, 78, 10, 100, 255
        ])
    } as AxiosResponse;

    const category = new Category();
    category.name = "image";
    category.id = "628ea0716b8991c676c19a4a";

    const httpServiceSpy = jest
        .spyOn(httpService, "get")
        .mockReturnValueOnce(of(fakeResponseForFileTypeCategories))
        .mockReturnValueOnce(of(fakeResponseForFileTypeCategories));

    const covalentServiceSpy = jest.spyOn(covalentService, "fetchNfts").mockResolvedValueOnce(fakeResponse);

    const categorySpy = jest.spyOn(categoryRepo, "findAll").mockResolvedValue([category]);

    const validatorSpy = jest.spyOn(validator, "validate").mockReturnValue(true);

    const returned = await service.getUserNfts("otinanai", "the-chain-id");

    expect(returned.length).toBe(2);

    const expectedNft1: ChainNft = {
        tokenId: covalentResponse.data.items[1].nft_data[0].token_id,
        tokenContractAddress: covalentResponse.data.items[1].contract_address,
        name: covalentResponse.data.items[1].nft_data[0].external_data.name,
        image: covalentResponse.data.items[1].nft_data[0].external_data.image,
        attributes: covalentResponse.data.items[1].nft_data[0].external_data.attributes,
        categoryId: category.id,
        description: covalentResponse.data.items[1].nft_data[0].external_data.description,
        animation_url: covalentResponse.data.items[1].nft_data[0].external_data.animation_url,
        external_url: covalentResponse.data.items[1].nft_data[0].external_data.external_url,
        properties: {
            files: []
        },
        metadataUri: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G"
    };

    const expectedNft2: ChainNft = {
        tokenId: covalentResponse.data.items[1].nft_data[1].token_id,
        tokenContractAddress: covalentResponse.data.items[1].contract_address,
        name: covalentResponse.data.items[1].nft_data[1].external_data.name,
        image: covalentResponse.data.items[1].nft_data[1].external_data.image,
        attributes: covalentResponse.data.items[1].nft_data[1].external_data.attributes,
        description: covalentResponse.data.items[1].nft_data[1].external_data.description,
        categoryId: category.id,
        animation_url: covalentResponse.data.items[1].nft_data[1].external_data.animation_url,
        external_url: covalentResponse.data.items[1].nft_data[1].external_data.external_url,
        properties: {
            files: []
        },
        metadataUri: "https://artion1.mypinata.cloud/ipfs/QmRZGMTyrLfPna9WiKRLw5iXdP1VT6jUAKi8CZkRUnr32G"
    };
    expect(returned[0]).toEqual(expectedNft1);
    expect(returned[1]).toEqual(expectedNft2);

    expect(blockchainRepoSpy).toHaveBeenCalledTimes(1);
    expect(blockchainRepoSpy).toHaveBeenCalledWith("the-chain-id");

    expect(categorySpy).toHaveBeenCalledTimes(1);

    const imageUrl = "https://artion1.mypinata.cloud/ipfs/QmR6nMJRB3DjK8ZjjfdUqNKzxSPMz15YN1dhZZwVb49bgx";
    const imageHeaders = {
        headers: { "Content-Type": "application/json", Range: "bytes=0-300" },
        responseType: "arraybuffer"
    };
    expect(covalentServiceSpy).toHaveBeenCalledTimes(1);
    expect(covalentServiceSpy).toHaveBeenCalledWith(blockchain.chainIdDecimal, "otinanai");
    expect(httpServiceSpy).toHaveBeenCalledTimes(2);
    expect(httpServiceSpy).toHaveBeenNthCalledWith(1, imageUrl, imageHeaders);
    expect(httpServiceSpy).toHaveBeenNthCalledWith(2, imageUrl, imageHeaders);

    expect(validatorSpy).toHaveBeenCalledTimes(2);
    expect(validatorSpy).toHaveBeenCalledWith(covalentResponse.data.items[1].nft_data[0].external_data);
    expect(validatorSpy).toHaveBeenCalledWith(covalentResponse.data.items[1].nft_data[1].external_data);

    expect(historySpy).toHaveBeenCalledTimes(1);
    expect(historySpy).toHaveBeenCalledWith(EvmContractType.ERC721);
});
