import { BlockchainRepository } from "./blockchain-repository";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { EvmActionsService } from "./evm-actions-service";
import { AwsService } from "../aws/aws-service";
import { ConfigService } from "@nestjs/config";
import { MetaplexService } from "../metaplex/metaplex-service";
import { EvmNftContractRepository } from "../evm-nft-contracts/evm-nft-contract-repository";
import { EvmNftContract } from "../evm-nft-contracts/evm-nft-contract";
import { Blockchain } from "./blockchain";

let service: EvmActionsService;
let awsService: AwsService;
let configService: ConfigService;
let metaplexService: MetaplexService;
let blockchainRepo: BlockchainRepository;
let contractsRepository: EvmNftContractRepository;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(EvmActionsService);
    service = testModule.get(EvmActionsService);
    configService = testModule.get(ConfigService);
    metaplexService = testModule.get(MetaplexService);
    blockchainRepo = testModule.get(BlockchainRepository);
    contractsRepository = testModule.get(EvmNftContractRepository);
    awsService = testModule.get(AwsService);
});

test("something", async () => {
    const blockchain = new Blockchain();
    blockchain.chainId = "250";
    blockchain.name = "Fantom Opera";
    blockchain.rpcUrl = "https://rpc.ankr.com/fantom/";

    const contract = new EvmNftContract();
    contract.address = "0xAB00af3cB05E3acd9E6a32783b583507b7634e00";
    contract.blockchainId = "250";

    jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    jest.spyOn(contractsRepository, "findByBlockchainId").mockResolvedValue([contract]);

    const result = await service.getUserNfts("0xe1e040ba7b34d882c422de852cdfe4dd7fa5398f", "250");
});
