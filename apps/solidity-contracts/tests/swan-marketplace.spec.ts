import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SwanERC721V1, SwanMarketplace, TestToken, TestToken1155 } from "../typechain-types";
import { firstValueFrom, Observable, take } from "rxjs";

describe("Swan Marketplace Tests", () => {
    let deployedMarketplace: SwanMarketplace;
    let deployedNft: SwanERC721V1;
    let deployedTestToken: TestToken;
    let deployedTestToken1155: TestToken1155;

    beforeEach(async () => {
        const factory = await ethers.getContractFactory("SwanERC721V1");
        deployedNft = (await upgrades.deployProxy(factory)) as SwanERC721V1;

        await ethers
            .getContractFactory("SwanMarketplace")
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
            })
            .then(() => ethers.getContractFactory("TestToken1155"))
            .then((factory) => factory.deploy())
            .then((deployed) => {
                deployedTestToken1155 = deployed;
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

    it("createListing - accepts 0 for price (ERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        const result = await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0"));

        expect(result)
            .to.emit(deployedMarketplace, "ListingCreated")
            .withArgs(seller.address, deployedTestToken1155.address, 2, ethers.utils.parseEther("0"), 1);

        expect(await deployedMarketplace.isTokenListed(deployedTestToken1155.address, 1)).to.equal(true);
        expect(await deployedTestToken1155.ownerOf(seller.address, 1)).to.equal(true);
    });

    it("createListing - reverts if price is negative", async () => {
        await expect(deployedMarketplace.createListing(deployedNft.address, 1, -30)).to.be.reverted;
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
    });

    it("createListing - reverts if price is negative (ERC1155)", async () => {
        await expect(deployedMarketplace.createListing(deployedTestToken1155.address, 1, -30)).to.be.reverted;
        expect(await deployedMarketplace.isTokenListed(deployedTestToken1155.address, 1)).to.equal(false);
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
        const listing = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(await deployedNft.ownerOf(1)).to.equal(seller.address);
    });

    it("createListing - creates listing, and emits event when approved (ERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        const result = await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        expect(result)
            .to.emit(deployedMarketplace, "ListingCreated")
            .withArgs(seller.address, deployedTestToken1155.address, 2, ethers.utils.parseEther("0.5"), 1);

        expect(await deployedMarketplace.isTokenListed(deployedTestToken1155.address, 1)).to.equal(true);
        const listing = await deployedMarketplace.getListing(deployedTestToken1155.address, 1);
        expect(await deployedTestToken1155.ownerOf(seller.address, 1)).to.equal(true);
    });

    it("createListing - emits event with indexed address", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        const eventFilter = deployedMarketplace.filters["ListingCreated"](seller.address);

        const observable = new Observable<any>((subscriber) => {
            deployedMarketplace.on(eventFilter, (seller, contractAddress, tokenId, price, listingId) => {
                subscriber.next({ seller, contractAddress, tokenId, price, listingId });
            });
        }).pipe(take(1));

        const eventResult = await firstValueFrom(observable);

        expect(eventResult.seller).to.equal(seller.address);
        expect(eventResult.contractAddress).to.equal(deployedNft.address);
        expect(eventResult.tokenId).to.equal(ethers.BigNumber.from(1));
        expect(eventResult.price).to.equal(ethers.utils.parseEther("0.5"));
        expect(eventResult.listingId).to.equal(ethers.BigNumber.from(2));
    });

    it("createListing - emits event with indexed address (ERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        const eventFilter = deployedMarketplace.filters["ListingCreated"](seller.address);

        const observable = new Observable<any>((subscriber) => {
            deployedMarketplace.on(eventFilter, (seller, contractAddress, tokenId, price, listingId) => {
                subscriber.next({ seller, contractAddress, tokenId, price, listingId });
            });
        }).pipe(take(1));

        const eventResult = await firstValueFrom(observable);

        expect(eventResult.seller).to.equal(seller.address);
        expect(eventResult.contractAddress).to.equal(deployedTestToken1155.address);
        expect(eventResult.tokenId).to.equal(ethers.BigNumber.from(1));
        expect(eventResult.price).to.equal(ethers.utils.parseEther("0.5"));
        expect(eventResult.listingId).to.equal(ethers.BigNumber.from(2));
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

    it("createListing - reverts when contract is not approved (ERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);

        await expect(
            deployedMarketplace
                .connect(seller)
                .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"))
        ).to.be.revertedWith("Token is not approved for transfer");

        expect(await deployedMarketplace.isTokenListed(deployedTestToken1155.address, 1)).to.equal(false);
        expect(await deployedTestToken1155.ownerOf(seller.address, 1)).to.equal(true);
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

    it("createListing - reverts if listing exists (ERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(seller)
                .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"))
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

    it("createListing - reverts if token belongs to other user (IERC1155)", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await expect(
            deployedMarketplace
                .connect(third)
                .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"))
        ).to.be.revertedWith("Incorrect owner of token");
        expect(await deployedMarketplace.isTokenListed(deployedTestToken1155.address, 1)).to.equal(false);
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
            .withArgs(2, seller.address, deployedNft.address, 1);
        expect(await deployedNft.ownerOf(1)).to.equal(seller.address);
        expect(await deployedMarketplace.isTokenListed(deployedNft.address, 1)).to.equal(false);
    });

    it("cancelListing - emits event with indexed listing id", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));
        await deployedMarketplace.connect(seller).cancelListing(deployedNft.address, 1);

        const eventFilter = deployedMarketplace.filters["ListingCancelled"](2);

        const observable = new Observable<any>((subscriber) => {
            deployedMarketplace.on(eventFilter, (listingId, seller, contractAddress, tokenId) => {
                subscriber.next({ seller, contractAddress, tokenId, listingId });
            });
        }).pipe(take(1));

        const eventResult = await firstValueFrom(observable);

        expect(eventResult.seller).to.equal(seller.address);
        expect(eventResult.contractAddress).to.equal(deployedNft.address);
        expect(eventResult.tokenId).to.equal(ethers.BigNumber.from(1));
        expect(eventResult.listingId).to.equal(ethers.BigNumber.from(2));
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

    it("buyToken - reverts if price is less than required (IERC1155)", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedTestToken1155.address, 1, { value: ethers.utils.parseEther("0.3") })
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

    it("buyToken - reverts if price is more than required (IERC1155)", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedTestToken1155.address, 1, { value: ethers.utils.parseEther("1") })
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

    it("buyToken - reverts if token is not listed (ERC1155)", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.mint(seller.address, 2, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedTestToken1155.address, 2, { value: ethers.utils.parseEther("0.5") })
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

    it("buyToken - reverts if token is listed by the buyer (ERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await expect(
            deployedMarketplace
                .connect(seller)
                .buyToken(deployedTestToken1155.address, 1, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Token is listed by the buyer");
    });

    it("buyToken - reverts if owner removed approval", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 1);

        await expect(deployedNft.connect(seller).getApproved(1))
            .to.not.be.equal(deployedMarketplace.address)
            .to.be.equal(ethers.constants.AddressZero);

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedNft.address, 1, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Token is not approved for transfer");
    });

    it("buyToken - reverts if owner removed approval (ERC1155)", async () => {
        const [deployer, seller, third] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, false);

        expect(
            await deployedTestToken1155.connect(seller).isApprovedForAll(seller.address, deployedMarketplace.address)
        ).to.be.equal(false);

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedTestToken1155.address, 1, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Token is not approved for transfer");
    });

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

    it("buyToken - reverts if owner no longer has token (ERC1155)", async () => {
        const [deployer, seller, third, fourth] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155
            .connect(seller)
            .safeTransferFrom(seller.address, fourth.address, 1, 1, deployedMarketplace.address);

        // const val = await deployedTestToken1155.ownerOf(1);

        await expect(
            deployedMarketplace
                .connect(third)
                .buyToken(deployedTestToken1155.address, 1, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Incorrect owner of token");
    });

    it("buyToken - Succesful transaction and emits sold event", async () => {
        const [deployer, seller, third, fourth] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);

        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        const res = await deployedMarketplace
            .connect(third)
            .buyToken(deployedNft.address, 1, { value: ethers.utils.parseEther("0.5") });

        const eventFilter = deployedMarketplace.filters["TokenSold"]();

        const observable = new Observable<any>((subscriber) => {
            deployedMarketplace.on(eventFilter, (listingId, seller, buyer, tokenContractAddress, tokenId, price) => {
                subscriber.next({ listingId, seller, buyer, tokenContractAddress, tokenId, price });
            });
        }).pipe(take(1));

        const eventResult = await firstValueFrom(observable);

        expect(eventResult.seller).to.equal(seller.address);
        expect(eventResult.buyer).to.equal(third.address);
        expect(eventResult.tokenContractAddress).to.equal(deployedNft.address);
        expect(eventResult.tokenId).to.equal(ethers.BigNumber.from(1));
        expect(eventResult.price).to.equal(ethers.utils.parseEther("0.5"));
        expect(eventResult.listingId).to.equal(ethers.BigNumber.from(2));
    });

    it("buyToken - Succesful transaction and emits sold event (ERC1155)", async () => {
        const [deployer, seller, third, fourth] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);

        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        const res = await deployedMarketplace
            .connect(third)
            .buyToken(deployedTestToken1155.address, 1, { value: ethers.utils.parseEther("0.5") });

        const eventFilter = deployedMarketplace.filters["TokenSold"]();

        const observable = new Observable<any>((subscriber) => {
            deployedMarketplace.on(eventFilter, (listingId, seller, buyer, tokenContractAddress, tokenId, price) => {
                subscriber.next({ listingId, seller, buyer, tokenContractAddress, tokenId, price });
            });
        }).pipe(take(1));

        const eventResult = await firstValueFrom(observable);

        expect(eventResult.seller).to.equal(seller.address);
        expect(eventResult.buyer).to.equal(third.address);
        expect(eventResult.tokenContractAddress).to.equal(deployedTestToken1155.address);
        expect(eventResult.tokenId).to.equal(ethers.BigNumber.from(1));
        expect(eventResult.price).to.equal(ethers.utils.parseEther("0.5"));
        expect(eventResult.listingId).to.equal(ethers.BigNumber.from(2));
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
                2,
                seller.address,
                deployedNft.address,
                1,
                ethers.utils.parseEther("0"),
                ethers.utils.parseEther("0.5")
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
                2,
                seller.address,
                deployedNft.address,
                1,
                ethers.utils.parseEther("0.7"),
                ethers.utils.parseEther("0.5")
            );

        const found = await deployedMarketplace.getListing(deployedNft.address, 1);
        expect(found.price).to.equal(ethers.utils.parseEther("0.7"));
    });

    it("updateListingPrice - emits event with indexed listing id", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));
        await deployedMarketplace
            .connect(seller)
            .updateListingPrice(deployedNft.address, 1, ethers.utils.parseEther("0.7"));

        const eventFilter = deployedMarketplace.filters["ListingUpdated"](2);

        const observable = new Observable<any>((subscriber) => {
            deployedMarketplace.on(
                eventFilter,
                (listingId, seller, contractAddress, tokenId, currentPrice, previousPrice) => {
                    subscriber.next({ seller, contractAddress, tokenId, listingId, currentPrice, previousPrice });
                }
            );
        }).pipe(take(1));

        const eventResult = await firstValueFrom(observable);

        expect(eventResult.seller).to.equal(seller.address);
        expect(eventResult.contractAddress).to.equal(deployedNft.address);
        expect(eventResult.tokenId).to.equal(ethers.BigNumber.from(1));
        expect(eventResult.listingId).to.equal(ethers.BigNumber.from(2));
        expect(eventResult.currentPrice).to.equal(ethers.utils.parseEther("0.7"));
        expect(eventResult.previousPrice).to.equal(ethers.utils.parseEther("0.5"));
    });

    it("filterForInvalid - returns invalid when one approval changes", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 2);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 2, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 3);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 3, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 3);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(2);
        expect(invalid[0].toNumber()).to.equal(0);
        expect(invalid[1].toNumber()).to.equal(4);
    });

    it("filterForInvalid - returns invalid for all when approval changes (IERC1155)", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 2, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 2, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 3, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 3, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, false);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(3);
        expect(invalid[0].toNumber()).to.equal(2);
        expect(invalid[1].toNumber()).to.equal(3);
        expect(invalid[2].toNumber()).to.equal(4);
    });

    it("filterForInvalid - returns invalid when one owner changes", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 2);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 2, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 3);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 3, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).transferFrom(seller.address, other.address, 1);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(3);
        expect(invalid[0].toNumber()).to.equal(2);
        expect(invalid[1].toNumber()).to.equal(0);
        expect(invalid[2].toNumber()).to.equal(0);
    });

    it("filterForInvalid - returns invalid when one owner changes (ERC1155)", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 2, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 2, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 3, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 3, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155
            .connect(seller)
            .safeTransferFrom(seller.address, other.address, 1, 1, deployedMarketplace.address);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(3);
        expect(invalid[0].toNumber()).to.equal(2);
        expect(invalid[1].toNumber()).to.equal(0);
        expect(invalid[2].toNumber()).to.equal(0);
    });

    it("filterForInvalid - returns invalid when one owner changes and one approval changes", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 2);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 2, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 3);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 3, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).transferFrom(seller.address, other.address, 1);
        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 3);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(3);
        expect(invalid[0].toNumber()).to.equal(2);
        expect(invalid[1].toNumber()).to.equal(0);
        expect(invalid[2].toNumber()).to.equal(4);
    });

    it("filterForInvalid - returns zeros array when nothing is invalid", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 2);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 2, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 3);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 3, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 3);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(2);
        expect(invalid[0].toNumber()).to.equal(0);
        expect(invalid[1].toNumber()).to.equal(0);
    });

    it("filterForInvalid - returns zeros array when nothing is invalid (ERC1155)", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 2, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 2, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 3, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 3, ethers.utils.parseEther("0.5"));

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(2);
        expect(invalid[0].toNumber()).to.equal(0);
        expect(invalid[1].toNumber()).to.equal(0);
    });

    it("filterForInvalid - returns zeros array when there are invalid listings but not included in the parameter", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 2);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 2, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 3);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 3, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 1);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(2);
        expect(invalid[0].toNumber()).to.equal(0);
        expect(invalid[1].toNumber()).to.equal(0);
    });

    it("filterForInvalid - returns zeros array when there are invalid listings but not included in the parameter (ERC1155)", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 2, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 2, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 3, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 3, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155
            .connect(seller)
            .safeTransferFrom(seller.address, other.address, 1, 1, deployedMarketplace.address);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(2);
        expect(invalid[0].toNumber()).to.equal(0);
        expect(invalid[1].toNumber()).to.equal(0);
    });

    it("filterForInvalid - returns invalid when all are invalid", async () => {
        const [deployer, seller] = await ethers.getSigners();

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 1);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 1, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 2);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 2, ethers.utils.parseEther("0.5"));

        await deployedNft.createItem(seller.address, "the-uri");
        await deployedNft.connect(seller).approve(deployedMarketplace.address, 3);
        await deployedMarketplace.connect(seller).createListing(deployedNft.address, 3, ethers.utils.parseEther("0.5"));

        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 1);
        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 2);
        await deployedNft.connect(seller).approve(ethers.constants.AddressZero, 3);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedNft.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(3);
        expect(invalid[0].toNumber()).to.equal(2);
        expect(invalid[1].toNumber()).to.equal(3);
        expect(invalid[2].toNumber()).to.equal(4);
    });

    it("filterForInvalid - returns invalid when all are invalid (ERC1155)", async () => {
        const [deployer, seller, other] = await ethers.getSigners();

        await deployedTestToken1155.mint(seller.address, 1, 1);
        await deployedTestToken1155.connect(seller).setApprovalForAll(deployedMarketplace.address, true);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 1, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 2, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 2, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155.mint(seller.address, 3, 1);
        await deployedMarketplace
            .connect(seller)
            .createListing(deployedTestToken1155.address, 3, ethers.utils.parseEther("0.5"));

        await deployedTestToken1155
            .connect(seller)
            .safeTransferFrom(seller.address, other.address, 1, 1, deployedMarketplace.address);

        await deployedTestToken1155
            .connect(seller)
            .safeTransferFrom(seller.address, other.address, 2, 1, deployedMarketplace.address);

        await deployedTestToken1155
            .connect(seller)
            .safeTransferFrom(seller.address, other.address, 3, 1, deployedMarketplace.address);

        const invalid = await deployedMarketplace.filterForInvalid([
            {
                listingId: 2,
                tokenId: 1,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 3,
                tokenId: 2,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            },
            {
                listingId: 4,
                tokenId: 3,
                tokenContractAddress: deployedTestToken1155.address,
                price: 0,
                seller: seller.address
            }
        ]);

        expect(invalid.length).to.equal(3);
        expect(invalid[0].toNumber()).to.equal(2);
        expect(invalid[1].toNumber()).to.equal(3);
        expect(invalid[2].toNumber()).to.equal(4);
    });
});
