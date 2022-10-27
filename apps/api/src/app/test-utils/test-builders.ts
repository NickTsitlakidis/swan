import { NftView } from "../views/nft/nft-view";
import { random, uid } from "radash";
import { ObjectId } from "mongodb";
import { CollectionView } from "../views/collection/collection-view";
import { CollectionLinksView } from "../views/collection/collection-links-view";
import { Blockchain } from "../support/blockchains/blockchain";
import { EvmContract } from "../support/evm-contracts/evm-contract";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";
import { ListingView } from "../views/listing/listing-view";
import { BuyerView } from "../views/listing/buyer-view";
import { ListingStatus } from "../domain/listing/listing-status";
import { ChainTransactionView } from "../views/listing/chain-transaction-view";
import { ethers } from "ethers";

export function buildNftView(): NftView {
    const view = new NftView();
    view.userId = uid(5);
    view.fileUri = uid(5);
    view.blockchainId = uid(5);
    view.categoryId = uid(5);
    view.collectionId = uid(5);
    view.metadataUri = uid(5);
    view.tokenContractAddress = ethers.constants.AddressZero;
    view.tokenId = uid(5);
    view.transactionId = uid(5);
    view._id = new ObjectId();
    view.createdAt = new Date();
    return view;
}

export function buildCollectionView(): CollectionView {
    const view = new CollectionView();
    view._id = new ObjectId();
    view.categoryId = uid(5);
    view.name = uid(5);
    view.blockchainId = uid(5);
    view.customUrl = uid(5);
    view.salePercentage = random(0, 100);
    view.description = uid(5);
    view.imageUrl = uid(5);
    view.isExplicit = false;
    view.paymentToken = uid(5);
    view.userId = uid(5);
    view.links = new CollectionLinksView(uid(5), uid(5), uid(5), uid(5), uid(5));

    return view;
}

export function buildBlockchain(): Blockchain {
    const b = new Blockchain();
    b._id = new ObjectId();
    b.name = uid(5);
    b.chainIdDecimal = random(0, 10);
    b.chainIdHex = uid(5);
    b.isTestNetwork = false;
    b.mainTokenName = uid(5);
    b.mainTokenSymbol = uid(5);
    b.scanSiteUrl = uid(5);
    b.rpcUrl = "https://rpc.testnet.fantom.network/";
    return b;
}

export function buildEvmContract(): EvmContract {
    const contract = new EvmContract();
    contract._id = new ObjectId();
    contract.abi = uid(5);
    contract.blockchainId = uid(5);
    contract.deploymentAddress = ethers.constants.AddressZero;
    contract.isActive = true;
    contract.type = EvmContractType.MARKETPLACE;
    contract.version = random(1, 10);
    return contract;
}

export function buildListingView(): ListingView {
    const view = new ListingView();
    view._id = new ObjectId();
    view.userId = uid(5);
    view.blockchainId = uid(5);
    view.categoryId = uid(5);
    view.animationUrl = uid(5);
    view.chainListingId = random(1, 100).toString();
    view.chainTokenId = random(1, 100).toString();
    view.imageUrl = uid(5);
    view.nftAddress = uid(5);
    view.nftId = uid(5);
    view.sellerAddress = uid(5);
    view.tokenContractAddress = ethers.constants.AddressZero;
    view.walletId = uid(5);
    view.price = random(1, 100);
    view.buyer = new BuyerView(uid(5), uid(5));
    view.status = ListingStatus.ACTIVE;
    view.listingCreatedTransaction = new ChainTransactionView(uid(5), random(1, 200));

    return view;
}
