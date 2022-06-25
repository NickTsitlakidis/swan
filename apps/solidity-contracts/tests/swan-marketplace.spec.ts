import { expect } from "chai";
import { ethers } from "hardhat";
import { SwanMarketplace, SwanNft } from "../typechain";

describe("SwanMarketplace", function () {
    let deployedMarketplace: SwanMarketplace;
    let deployedNft: SwanNft;

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

        expect(result).to.emit(deployedMarketplace, "ListingCreated").withArgs(
            seller.address,
            deployedNft.address,
            2,
            ethers.utils.parseEther("0.5"),
            1
        );
        expect(await deployedNft.ownerOf(1)).to.equal(deployedMarketplace.address);
    });

    it("createListing - reverts if listing exists", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(deployedMarketplace
            .connect(seller)
            .createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"))).to.be.revertedWith(
                "Token is already listed"
        );
    });

    it("cancelListing - reverts if listing doesn't exist", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(deployedMarketplace
            .connect(seller)
            .cancelListing( 122)).to.be.revertedWith(
            "Listing does not exist"
        );
    });
});
