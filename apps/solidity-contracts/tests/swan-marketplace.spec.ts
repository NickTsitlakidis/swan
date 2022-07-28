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
        expect(await deployedMarketplace.getFeePercentage()).to.equal(1);
    });

    it("createListing - accepts 0 for price", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        const result = await deployedMarketplace
            .connect(seller)
            .createListing(deployedNft.address, 1, ethers.utils.parseEther("0"));

        expect(result)
            .to.emit(deployedMarketplace, "ListingCreated")
            .withArgs(seller.address, deployedNft.address, 2, ethers.utils.parseEther("0"), 1);

        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(true);
        expect(await deployedNft.ownerOf(1)).to.equal(seller.address);
    });

    it("createListing - reverts if price is negative", async () => {
        await expect(deployedMarketplace.createListing(deployedNft.address, 1, -30)).to.be.reverted;
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
    });

    it("createListing - creates listing, and emits event when approved", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        const result = await deployedMarketplace
            .connect(seller)
            .createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        expect(result)
            .to.emit(deployedMarketplace, "ListingCreated")
            .withArgs(seller.address, deployedNft.address, 2, ethers.utils.parseEther("0.5"), 1);

        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(true);
        expect(await deployedNft.ownerOf(1)).to.equal(seller.address);
    });

    it("createListing - reverts when contract is not approved", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");

        await expect(
            deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"))
        ).to.be.revertedWith("Token is not approved for transfer");

        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
        expect(await deployedNft.ownerOf(1)).to.equal(seller.address);
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
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
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
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
    });

    it("cancelListing - reverts if listing doesn't exist", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(deployedMarketplace.connect(seller).cancelListing(deployedNft.address, 2)).to.be.revertedWith(
            "Listing does not exist"
        );
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(true);
    });

    it("cancelListing - reverts if owner is incorrect", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(deployedMarketplace.connect(third).cancelListing(deployedNft.address, 1)).to.be.revertedWith(
            "Incorrect owner of listing"
        );
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(true);
    });

    it("cancelListing - removes listing", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        const result = deployedMarketplace.connect(seller).cancelListing(deployedNft.address, 1);

        await expect(result)
            .to.emit(deployedMarketplace, "ListingCancelled")
            .withArgs(seller.address, deployedNft.address, 1, 2);
        expect(await deployedNft.ownerOf(1)).to.equal(seller.address);
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
    });

    it("updateFeePercentage - reverts if fee is 0", async () => {
        const [deployer, other] = await ethers.getSigners();

        await expect(deployedMarketplace.connect(deployer).updateFeePercentage(0)).to.be.reverted;
        const newFee = await deployedMarketplace.getFeePercentage();
        expect(newFee.toNumber()).to.eq(1);
    });

    it("updateFeePercentage - reverts if called by non-owner", async () => {
        const [deployer, other] = await ethers.getSigners();

        await expect(deployedMarketplace.connect(other).updateFeePercentage(10)).to.be.reverted;
        const newFee = await deployedMarketplace.getFeePercentage();
        expect(newFee.toNumber()).to.eq(1);
    });

    it("updateFeePercentage - sets new fee percentage", async () => {
        const [deployer, other] = await ethers.getSigners();

        await deployedMarketplace.connect(deployer).updateFeePercentage(10);
        const newFee = await deployedMarketplace.getFeePercentage();
        expect(newFee.toNumber()).to.eq(10);
    });

    it("buyToken - reverts if price is less than required", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedNft.address, 1, { value: ethers.utils.parseEther("0.3") })
        ).to.be.revertedWith("Price doesn't match");
    });

    it("buyToken - reverts if price is more than required", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace.connect(third).buyToken(deployedNft.address, 1, { value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("Price doesn't match");
    });

    it("buyToken - reverts if token is not listed", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedNft.address, 2, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Listing does not exist");
    });

    it("buyToken - reverts if token is listed by the buyer", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(seller)
                .buyToken(deployedNft.address, 1, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Token is listed by the buyer");
    });

    it("buyToken - reverts if owner removed approval", async () => {});

    it("buyToken - reverts if owner no longer has token", async () => {
        const [deployer, seller, third, fourth] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).transferFrom(seller.address, fourth.address, 1);

        // const val = await deployedNft.ownerOf(1);

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedNft.address, 1, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Incorrect owner of token");
    });

    it("updateListingPrice - reverts if sender is not owner", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(third)
                .updateListingPrice(deployedNft.address, 1, ethers.utils.parseEther("0.7"))
        ).to.be.revertedWith("Sender is not the owner of listing");

        const found = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(found.price).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("updateListingPrice - reverts if listing doesn't exist", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(seller)
                .updateListingPrice(deployedNft.address, 666, ethers.utils.parseEther("0.7"))
        ).to.be.revertedWith("Listing does not exist");

        const found = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(found.price).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("updateListingPrice - reverts if price is negative", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await expect(deployedMarketplace.connect(seller).updateListingPrice(deployedNft.address, 1, -90)).to.be
            .reverted;

        const found = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(found.price).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("updateListingPrice - accepts zero price", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        const result = deployedMarketplace
            .connect(seller)
            .updateListingPrice(deployedNft.address, 1, ethers.utils.parseEther("0"));

        await expect(result)
            .to.emit(deployedMarketplace, "ListingUpdated")
            .withArgs(
                seller.address,
                deployedNft.address,
                1,
                ethers.utils.parseEther("0"),
                ethers.utils.parseEther("0.5"),
                2
            );

        const found = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(found.price).to.equal(ethers.utils.parseEther("0"));
    });

    it("updateListingPrice - updates price and emits event", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        const result = deployedMarketplace
            .connect(seller)
            .updateListingPrice(deployedNft.address, 1, ethers.utils.parseEther("0.7"));

        await expect(result)
            .to.emit(deployedMarketplace, "ListingUpdated")
            .withArgs(
                seller.address,
                deployedNft.address,
                1,
                ethers.utils.parseEther("0.7"),
                ethers.utils.parseEther("0.5"),
                2
            );

        const found = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(found.price).to.equal(ethers.utils.parseEther("0.7"));
    });
});
