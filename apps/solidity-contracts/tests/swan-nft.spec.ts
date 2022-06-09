import { expect } from "chai";
import { ethers } from "hardhat";

describe("SwanNft", function () {
    it("constructor - sets name and symbol correctly", async function () {
        const SwanNft = await ethers.getContractFactory("SwanNft");
        const deployed = await SwanNft.deploy();
        await deployed.deployed();

        expect(await deployed.name()).to.equal("SwanNft");
        expect(await deployed.symbol()).to.equal("SNFT");
    });

    it("createItem - mints with uri", async function () {
        const SwanNft = await ethers.getContractFactory("SwanNft");
        const deployed = await SwanNft.deploy();
        await deployed.deployed();

        const signers = await ethers.getSigners();

        await expect(() => deployed.createItem(signers[2].address, "the-uri")).to.changeTokenBalance(
            deployed,
            signers[2],
            1
        );

        const uri = await deployed.tokenURI(1);
        expect(uri).to.equal("the-uri");
    });

    it("createItem - increments id on every call", async function () {
        const SwanNft = await ethers.getContractFactory("SwanNft");
        const deployed = await SwanNft.deploy();
        await deployed.deployed();

        const signers = await ethers.getSigners();

        await expect(deployed.createItem(signers[2].address, "the-uri"))
            .to.emit(deployed, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "1");

        await expect(deployed.createItem(signers[2].address, "the-uri"))
            .to.emit(deployed, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "2");

        await expect(deployed.createItem(signers[2].address, "the-uri"))
            .to.emit(deployed, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "3");
    });

    it("createItem - can be called by everyone", async function () {
        const SwanNft = await ethers.getContractFactory("SwanNft");
        const deployed = await SwanNft.deploy();
        await deployed.deployed();

        const signers = await ethers.getSigners();

        await expect(() => deployed.connect(signers[3]).createItem(signers[2].address, "the-uri")).to.changeTokenBalance(
            deployed,
            signers[2],
            1
        );

        const uri = await deployed.tokenURI(1);
        expect(uri).to.equal("the-uri");
    });
});
