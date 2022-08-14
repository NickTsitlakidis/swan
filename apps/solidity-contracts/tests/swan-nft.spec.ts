import { expect } from "chai";
import { ethers } from "hardhat";
import { SwanNft } from "../typechain-types";

describe("SwanNft", function () {
    let deployedNft: SwanNft;

    beforeEach(async () => {
        await ethers
            .getContractFactory("SwanNft")
            .then((factory) => factory.deploy())
            .then((deployed) => {
                deployedNft = deployed;
                return deployed.deployed();
            });
    });

    it("constructor - sets name and symbol correctly", async function () {
        expect(await deployedNft.name()).to.equal("SwanNft");
        expect(await deployedNft.symbol()).to.equal("SNFT");
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
        const signers = await ethers.getSigners();

        await expect(deployedNft.createItem(signers[2].address, "the-uri"))
            .to.emit(deployedNft, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "1");

        await expect(deployedNft.createItem(signers[2].address, "the-uri"))
            .to.emit(deployedNft, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "2");

        await expect(deployedNft.createItem(signers[2].address, "the-uri"))
            .to.emit(deployedNft, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "3");
    });

    it("createItem - can be called by everyone", async function () {
        const signers = await ethers.getSigners();

        await expect(() =>
            deployedNft.connect(signers[3]).createItem(signers[2].address, "the-uri")
        ).to.changeTokenBalance(deployedNft, signers[2], 1);

        const uri = await deployedNft.tokenURI(1);
        expect(uri).to.equal("the-uri");
    });

    it("createItem - adds token id to owner mapping", async function () {
        const [deployer, receiver] = await ethers.getSigners();

        await deployedNft.connect(receiver).createItem(receiver.address, "the-uri");

        const tokenIds = await deployedNft.connect(receiver).getTokensByOwner(receiver.address);
        expect(tokenIds.length).to.equal(1);
        expect(tokenIds[0].toNumber()).to.equal(1);
    });

    it("createItem - adds multiple ids for same owner", async function () {
        const [deployer, receiver] = await ethers.getSigners();

        await deployedNft.connect(receiver).createItem(receiver.address, "the-uri");
        await deployedNft.connect(receiver).createItem(receiver.address, "the-uri");
        await deployedNft.connect(receiver).createItem(receiver.address, "the-uri");

        const tokenIds = await deployedNft.connect(receiver).getTokensByOwner(receiver.address);
        expect(tokenIds.length).to.equal(3);
        expect(tokenIds[0].toNumber()).to.equal(1);
        expect(tokenIds[1].toNumber()).to.equal(2);
        expect(tokenIds[2].toNumber()).to.equal(3);
    });

    it("transferFrom - updates owner mappings", async function () {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).transferFrom(firstReceiver.address, secondReceiver.address, 1);

        const secondReceiverTokens = await deployedNft.connect(secondReceiver).getTokensByOwner(secondReceiver.address);
        expect(secondReceiverTokens.length).to.equal(1);
        expect(secondReceiverTokens[0].toNumber()).to.equal(1);

        const firstReceiverTokens = await deployedNft.connect(firstReceiver).getTokensByOwner(firstReceiver.address);
        expect(firstReceiverTokens.length).to.equal(0);
    });

    it("transferFrom - updates owner mappings for owners with multiple tokens", async function () {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        await deployedNft.connect(secondReceiver).createItem(secondReceiver.address, "the-uri");
        await deployedNft.connect(secondReceiver).createItem(secondReceiver.address, "the-uri");

        await deployedNft.connect(secondReceiver).transferFrom(secondReceiver.address, firstReceiver.address, 4);

        const secondReceiverTokens = await deployedNft.connect(secondReceiver).getTokensByOwner(secondReceiver.address);
        expect(secondReceiverTokens.length).to.equal(1);
        expect(secondReceiverTokens[0].toNumber()).to.equal(3);

        const firstReceiverTokens = await deployedNft.connect(firstReceiver).getTokensByOwner(firstReceiver.address);
        expect(firstReceiverTokens.length).to.equal(3);
        expect(firstReceiverTokens[0].toNumber()).to.equal(1);
        expect(firstReceiverTokens[1].toNumber()).to.equal(2);
        expect(firstReceiverTokens[2].toNumber()).to.equal(4);
    });

    it("totalSupply - returns 0 before any mint", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        const supply = await deployedNft.connect(firstReceiver).totalSupply();
        expect(supply).to.equal(0);
    });

    it("totalSupply - returns number of tokens after minting", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const supply = await deployedNft.connect(firstReceiver).totalSupply();
        expect(supply).to.equal(2);
    });

    it("tokenByIndex - returns id for matching index", async () => {
        const [deployer, firstReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenByIndex(1);

        expect(id).to.equal(2);
    });

    it("tokenByIndex - returns 0 for index equal to length", async () => {
        const [deployer, firstReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenByIndex(2);

        expect(id).to.equal(0);
    });

    it("tokenByIndex - returns 0 for no match", async () => {
        const [deployer, firstReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenByIndex(25000);

        expect(id).to.equal(0);
    });

    it("tokenOfOwnerByIndex - returns 0 for no owner match", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenOfOwnerByIndex(secondReceiver.address, 1);

        expect(id).to.equal(0);
    });

    it("tokenOfOwnerByIndex - returns 0 for no index match", async () => {
        const [deployer, firstReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenOfOwnerByIndex(firstReceiver.address, 10);

        expect(id).to.equal(0);
    });

    it("tokenOfOwnerByIndex - returns 0 for index equal to length", async () => {
        const [deployer, firstReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenOfOwnerByIndex(firstReceiver.address, 2);

        expect(id).to.equal(0);
    });

    it("tokenOfOwnerByIndex - returns id for owner and index match", async () => {
        const [deployer, firstReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const id = await deployedNft.connect(firstReceiver).tokenOfOwnerByIndex(firstReceiver.address, 0);

        expect(id).to.equal(1);
    });

    it("getTokensByOwner - returns empty array for no owner match", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const tokens = await deployedNft.connect(firstReceiver).getTokensByOwner(secondReceiver.address);

        expect(tokens.length).to.equal(0);
    });

    it("getTokensByOwner - returns tokens for matching owner", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await deployedNft.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const tokens = await deployedNft.connect(firstReceiver).getTokensByOwner(firstReceiver.address);

        expect(tokens.length).to.equal(2);
        expect(tokens[0].toNumber()).to.equal(1);
        expect(tokens[1].toNumber()).to.equal(2);
    });
});
