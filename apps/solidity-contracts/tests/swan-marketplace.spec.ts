import { expect } from "chai";
import { ethers } from "hardhat";
import { SwanMarketplace, SwanNft, TestToken } from "../typechain";

describe("SwanMarketplace", () => {
    let deployedMarketplace: SwanMarketplace;
    let deployedNft: SwanNft;
    let deployedTestToken: TestToken;

    beforeEach(async () => {
        await ethers
            .getContractFactory("SwanNft")
            .then((factory) => factory.deploy())
            .then((deployed) => {
                deployedNft = deployed;
                return deployed.deployed();
            })
            .then(() => ethers.getContractFactory("SwanMarketplace"))
            .then((factory) => factory.deploy())
            .then((deployed) => {
                deployedMarketplace = deployed;
                return deployed.deployed();
            })
            .then(() => ethers.getContractFactory("TestToken"))
            .then((factory) => factory.deploy())
            .then((deployed) => {
                deployedTestToken = deployed;
                return deployed.deployed();
            });
    });

    it("constructor - sets percentage and swan wallet correctly", async function () {
        const [deployer] = await ethers.getSigners();

        expect(await deployedMarketplace.swanWallet()).to.equal(deployer.address);
        expect(await deployedMarketplace.feePercentage()).to.equal(1);
    });

    it("createListing - reverts if price is 0", async () => {
        await expect(deployedMarketplace.createListing(deployedNft.address, 1, 0)).to.be.revertedWith(
            "Price must be greater than 0"
        );
    });

    it("createListing - reverts if price is negative", async () => {
        await expect(deployedMarketplace.createListing(deployedNft.address, 1, -30)).to.be.reverted;
    });

    it("createListing - creates listing, transfers nft and emits event", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        const result = await deployedMarketplace
            .connect(seller)
            .createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        expect(result)
            .to.emit(deployedMarketplace, "ListingCreated")
            .withArgs(seller.address, deployedNft.address, 2, ethers.utils.parseEther("0.5"), 1);
        expect(await deployedNft.ownerOf(1)).to.equal(deployedMarketplace.address);
    });

    it("createListing - reverts if listing exists", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"))
        ).to.be.revertedWith("Token is already listed");
    });

    it("createListing - reverts if token belongs to other user", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await expect(
            deployedMarketplace.connect(third).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"))
        ).to.be.revertedWith("Incorrect owner of token");
    });

    it("createListing - reverts if contract is unsupported", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken.connect(deployer).mint(seller.address, 10);
        await deployedTestToken.connect(seller).approve(deployedMarketplace.address, 1);

        await expect(
            deployedMarketplace
                .connect(seller)
                .createListing(deployedTestToken.address, 1, ethers.utils.parseEther("0.5"))
        ).to.be.revertedWith("Contract is currently not supported");
    });

    it("cancelListing - reverts if listing doesn't exist", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(deployedMarketplace.connect(seller).cancelListing(deployedNft.address, 2)).to.be.revertedWith(
            "Listing does not exist"
        );
    });
});
