import { FANTOM_TEST_NET } from "./abi/swan-nft-fantom-testnet";
import { FANTOM_MAIN_NET } from "./abi/swan-nft-fantom-mainnet";

export class Erc721DeploymentHistory {
    getFantomAddresses(includeTestNet = false): Array<string> {
        const mainNet = [FANTOM_MAIN_NET.address];

        if (includeTestNet) {
            return mainNet.concat([FANTOM_TEST_NET.address]);
        }

        return mainNet;
    }

    getAllAddresses(includeTestNet = false): Array<string> {
        return this.getFantomAddresses(includeTestNet);
    }
}
