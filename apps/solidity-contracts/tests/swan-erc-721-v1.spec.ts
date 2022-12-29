import { expect } from "chai";
import { SwanERC721V1 } from "../typechain-types";
import { ethers, upgrades } from "hardhat";

let nftProxy: SwanERC721V1;

describe("Swan ERC721 V1 Tests", () => {
    beforeEach(async () => {
        const factory = await ethers.getContractFactory("SwanERC721V1");
        nftProxy = (await upgrades.deployProxy(factory)) as SwanERC721V1;
    });

    it("createItem - mints with uri", async function () {
        const signers = await ethers.getSigners();

        await expect(() => nftProxy.createItem(signers[2].address, "the-uri")).to.changeTokenBalance(
            nftProxy,
            signers[2],
            1
        );

        const uri = await nftProxy.tokenURI(1);
        expect(uri).to.equal("the-uri");
    });

    it("createItem - increments id on every call", async function () {
        const signers = await ethers.getSigners();

        await expect(nftProxy.createItem(signers[2].address, "the-uri"))
            .to.emit(nftProxy, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "1");

        await expect(nftProxy.createItem(signers[2].address, "the-uri"))
            .to.emit(nftProxy, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "2");

        await expect(nftProxy.createItem(signers[2].address, "the-uri"))
            .to.emit(nftProxy, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", signers[2].address, "3");
    });

    it("createItem - can be called by everyone", async function () {
        const signers = await ethers.getSigners();

        await expect(() =>
            nftProxy.connect(signers[3]).createItem(signers[2].address, "the-uri")
        ).to.changeTokenBalance(nftProxy, signers[2], 1);

        const uri = await nftProxy.tokenURI(1);
        expect(uri).to.equal("the-uri");
    });

    it("createItem - adds token id to owner mapping", async function () {
        const [deployer, receiver] = await ethers.getSigners();

        await nftProxy.connect(receiver).createItem(receiver.address, "the-uri");

        const tokenIds = await nftProxy.connect(receiver).getTokensByOwner(receiver.address);
        expect(tokenIds.length).to.equal(1);
        expect(tokenIds[0].toNumber()).to.equal(1);
    });

    it("createItem - adds multiple ids for same owner", async function () {
        const [deployer, receiver] = await ethers.getSigners();

        await nftProxy.connect(receiver).createItem(receiver.address, "the-uri");
        await nftProxy.connect(receiver).createItem(receiver.address, "the-uri");
        await nftProxy.connect(receiver).createItem(receiver.address, "the-uri");

        const tokenIds = await nftProxy.connect(receiver).getTokensByOwner(receiver.address);
        expect(tokenIds.length).to.equal(3);
        expect(tokenIds[0].toNumber()).to.equal(1);
        expect(tokenIds[1].toNumber()).to.equal(2);
        expect(tokenIds[2].toNumber()).to.equal(3);
    });

    it("getTokensByOwner - returns empty array for no owner match", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await nftProxy.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await nftProxy.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const tokens = await nftProxy.connect(firstReceiver).getTokensByOwner(secondReceiver.address);

        expect(tokens.length).to.equal(0);
    });

    it("getTokensByOwner - returns tokens for matching owner", async () => {
        const [deployer, firstReceiver, secondReceiver] = await ethers.getSigners();

        await nftProxy.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");
        await nftProxy.connect(firstReceiver).createItem(firstReceiver.address, "the-uri");

        const tokens = await nftProxy.connect(firstReceiver).getTokensByOwner(firstReceiver.address);

        expect(tokens.length).to.equal(2);
        expect(tokens[0].toNumber()).to.equal(1);
        expect(tokens[1].toNumber()).to.equal(2);
    });
});
