import { NftView } from "../views/nft/nft-view";
import { random, uid } from "radash";
import { ObjectId } from "mongodb";
import { CollectionView } from "../views/collection/collection-view";
import { CollectionLinksView } from "../views/collection/collection-links-view";

export function buildNftView(): NftView {
    const view = new NftView();
    view.userId = uid(5);
    view.fileUri = uid(5);
    view.blockchainId = uid(5);
    view.categoryId = uid(5);
    view.collectionId = uid(5);
    view.metadataUri = uid(5);
    view.tokenContractAddress = uid(5);
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
