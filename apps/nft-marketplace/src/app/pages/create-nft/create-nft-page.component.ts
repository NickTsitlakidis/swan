import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import {
    BlockchainDto,
    CategoryDto,
    CollectionDto,
    NftMetadataAttributeDto,
    NftMetadataDto,
    UserWalletDto
} from "@swan/dto";
import { fade } from "../../common/animations/enter-leave.animation";
import { CreateNft } from "../../common/services/chains/create-nft";
import { WalletRegistryService } from "../../common/services/chains/wallet-registry.service";
import { SupportService } from "../../common/services/support/support.service";
import { firstValueFrom, of, switchMap } from "rxjs";
import { NftService } from "../../common/services/chains/nfts/nft.service";
import { CollectionsService } from "../../common/services/collections/collections.service";
import { EvmContractsStore } from "../../common/store/evm-contracts-store";
import { CategoriesStore } from "../../common/store/categories-store";
import { BlockchainWalletsStore } from "../../common/store/blockchain-wallets-store";
import { UserStore } from "../../common/store/user-store";
import { isNil } from "@nft-marketplace/utils";
import { GetUserWalletService } from "../../common/services/chains/get-user-wallet.service";

@Component({
    selector: "swan-create-nft-page",
    templateUrl: "./create-nft-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./create-nft-page.component.scss"],
    animations: [fade]
})
export class CreateNFTPageComponent implements OnInit {
    @ViewChild("collectionSelect") collectionSelect: any;
    public labelsAndPlaceholders = {
        title: {
            name: "Title",
            placeholder: "Max 50 characters"
        },
        symbol: {
            name: "Symbol",
            placeholder: "Max 50 characters"
        },
        isParentCollection: "Is parent collection?",
        description: {
            title: "Description",
            placeholder: "Max 500 characters"
        },
        maxSupply: {
            title: "Maximum Supply",
            placeholder: "Quantity"
        },
        royalties: {
            title: "Royalty Percentage",
            subtitle: "This is how much of each secondary sale will be paid out to the creators.",
            placeholder: "Between 0 - 100"
        },
        attributes: "Attributes",
        attributeTrait: "Trait type (Optional)",
        attributeValue: "Value",
        attributeDisplay: "Display type (Optional)",
        chain: {
            title: "Blockchain *",
            subtitle: "Select the blockchain where you'd like new items from this collection to be added by default."
        },
        category: {
            title: "Category *",
            subtitle: "Adding a category will help make your item discoverable on Swan."
        },
        collection: {
            title: "Collection",
            subtitle: "Adding the NFT to your created collection",
            emptyCategory: "You do not have a collection? Please create one here"
        }
    };
    public createNFTForm: UntypedFormGroup;
    public attributes: NftMetadataAttributeDto[] = [];
    public uploadedFile: File;
    public collections: CollectionDto[];
    public allBlockchains: { name: string; id: string }[];
    public blockchains: { name: string; id: string }[];
    public categories: CategoryDto[];
    public userWallets: UserWalletDto[];

    constructor(
        private _fb: UntypedFormBuilder,
        private _contractsStore: EvmContractsStore,
        private _userStore: UserStore,
        private _blockchainWalletsStore: BlockchainWalletsStore,
        private _cd: ChangeDetectorRef,
        private _walletRegistryService: WalletRegistryService,
        private _supportService: SupportService,
        private _categoriesStore: CategoriesStore,
        private _nftService: NftService,
        private _collectionsService: CollectionsService,
        private _getUserWalletService: GetUserWalletService
    ) {}

    ngOnInit(): void {
        this.createNFTForm = this._fb.group({
            title: [undefined, Validators.maxLength(50)],
            symbol: [undefined, Validators.maxLength(10)],
            isParentCollection: [false],
            description: [undefined, Validators.maxLength(500)],
            maxSupply: [undefined, Validators.pattern("-?\\d+(?:\\.\\d+)?")],
            royalties: [undefined, Validators.required],
            category: [undefined, Validators.required],
            blockchain: [undefined, Validators.required],
            collection: [undefined]
        });

        this._collectionsService.getCollectionsByUserId().subscribe((collections) => {
            this.collections = collections;
            this._cd.detectChanges();
        });

        this.categories = this._categoriesStore.categories;
        this._cd.detectChanges();

        if (!isNil(this._userStore.user)) {
            this.userWallets = this._userStore.user.wallets;
            this.allBlockchains = this._blockchainWalletsStore.blockchainWallets
                .map((chain) => {
                    return {
                        name: chain.blockchain.name,
                        id: chain.blockchain.id
                    };
                })
                .filter((chain) => this.userWallets.find((wal) => wal.wallet.blockchainId === chain.id));
            this.blockchains = [...this.allBlockchains];
            this._cd.detectChanges();
        }
    }

    public getAttributeValue(formAttributeName: string) {
        return this.createNFTForm.get(formAttributeName)?.value;
    }

    public resetSelectionOfCollection() {
        if (this.createNFTForm.get("collection")?.value) {
            this.collectionSelect.reset();
            this._cd.detectChanges();
        }
    }

    public collectionSelected(collection: CollectionDto) {
        if (!collection) {
            this.blockchains = [...this.allBlockchains];
            this.categories = this._categoriesStore.categories;
        } else {
            this.blockchains = this.blockchains.filter((chain) => chain.id === collection.blockchainId);
            this.categories = this.categories.filter((cat) => cat.id === collection.categoryId);
        }
        this._cd.detectChanges();
    }

    public addAtrribute() {
        const newAttribute: NftMetadataAttributeDto = {
            traitType: "",
            displayType: "",
            value: ""
        };
        this.attributes.push(newAttribute);
        const i = this.attributes.length;
        this.createNFTForm.addControl(`attributeTrait${i}`, new UntypedFormControl(newAttribute.traitType));
        this.createNFTForm.addControl(
            `attributeValue${i}`,
            new UntypedFormControl(newAttribute.value, Validators.required)
        );
        this.createNFTForm.addControl(`attributeDisplay${i}`, new UntypedFormControl(newAttribute.displayType));
        this._cd.detectChanges();
    }

    public uploadFiles(files: File[]) {
        this.uploadedFile = files[0];
    }

    public async onSubmit() {
        const chainId = this.createNFTForm.get("blockchain")?.value.id;
        const walletId = await this._getUserWalletService.findAvailableWallet(chainId);
        const walletService = await firstValueFrom(this._walletRegistryService.getWalletService(walletId));
        const metadata: NftMetadataAttributeDto[] = [];
        for (let index = 1; index <= this.attributes.length; index++) {
            metadata.push({
                traitType: this.createNFTForm.get(`attributeTrait${index}`)?.value,
                value: this.createNFTForm.get(`attributeValue${index}`)?.value,
                displayType: this.createNFTForm.get(`attributeDisplay${index}`)?.value
            });
        }

        const erc721Match = this._contractsStore.erc721Contracts.find((c) => c.blockchainId === chainId);

        this._supportService
            .uploadFileToS3(this.uploadedFile)
            .pipe(
                switchMap((signedUriResponse) => {
                    const nftMetadataDto = new NftMetadataDto();
                    nftMetadataDto.imageType = this.uploadedFile.type;
                    nftMetadataDto.imageName = this.uploadedFile.name;
                    nftMetadataDto.categoryId = this.createNFTForm.get("category")?.value.id;
                    nftMetadataDto.s3uri = signedUriResponse;
                    nftMetadataDto.name = this.createNFTForm.get("title")?.value;
                    nftMetadataDto.description = this.createNFTForm.get("description")?.value;
                    nftMetadataDto.resellPercentage = this.createNFTForm.get("royalties")?.value;
                    nftMetadataDto.maxSupply = this.createNFTForm.get("maxSupply")?.value;
                    nftMetadataDto.chainId = chainId;
                    nftMetadataDto.walletId = walletId;
                    nftMetadataDto.attributes = metadata;
                    nftMetadataDto.collectionId = this.createNFTForm.get("collection")?.value?.id || undefined;
                    return this._nftService.createNft(nftMetadataDto);
                }),
                switchMap((nftResponse) => {
                    const matchingWallets = this._blockchainWalletsStore.blockchainWallets.find(
                        (wallets) => wallets.blockchain.id === chainId
                    );
                    const nft: CreateNft = {
                        id: nftResponse.id,
                        metadataUri: nftResponse.metadataUri,
                        name: this.createNFTForm.get("title")?.value,
                        symbol: this.createNFTForm.get("symbol")?.value,
                        resellPercentage: this.createNFTForm.get("royalties")?.value,
                        maxSupply: this.createNFTForm.get("maxSupply")?.value,
                        metadata,
                        blockchain: matchingWallets?.blockchain as BlockchainDto,
                        contract: erc721Match
                    };
                    if (walletService) {
                        return walletService.mint(nft);
                    } else {
                        return of();
                    }
                }),
                switchMap((mintResponse) => {
                    return this._nftService.mintNft(mintResponse);
                })
            )
            .subscribe(console.log);
    }
}
