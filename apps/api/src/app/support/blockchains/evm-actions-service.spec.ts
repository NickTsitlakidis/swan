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

test("something", (endTest) => {
    const blockchain = new Blockchain();
    blockchain.chainId = "0x1";
    blockchain.name = "Ethereum";
    blockchain.rpcUrl = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

    const contract = new EvmNftContract();
    contract.address = "0x52E66cA968010d064938A8099a172CBAaf08c125";
    contract.blockchainId = "0x1";

    jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    jest.spyOn(contractsRepository, "findByBlockchainId").mockResolvedValue([contract]);

    service.getUserNfts("0xfd35356dcd225bbc7e8f1fde622bfbf5af105fe6", "0x1").then((results) => {
        endTest();
    });
}, 60000);
