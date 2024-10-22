require("dotenv").config({ path: "../../.env" });
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const deployerKey: string = process.env.EVM_DEPLOYER_KEY as string;
const config: HardhatUserConfig = {
    solidity: "0.8.13",
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD"
    },
    paths: {
        sources: "./contracts",
        tests: "./tests",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    networks: {
        fantomTestNet: {
            url: "https://rpc.ankr.com/fantom_testnet",
            chainId: 4002,
            accounts: [deployerKey]
        },
        fantomMainNet: {
            url: `https://rpc.ankr.com/fantom/`,
            chainId: 250,
            accounts: [deployerKey]
        }
    }
};

export default config;
