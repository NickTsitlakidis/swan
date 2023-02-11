import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import {
    BlockchainDto,
    BlockchainWalletDto,
    CategoryDto,
    CollectionDto,
    NftMetadataAttributeDto,
    NftMetadataDto,
    UserWalletDto
} from "@swan/dto";
import { fade } from "../../../@core/animations/enter-leave.animation";
import { CreateNft } from "../../../@core/services/chains/create-nft";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { SupportService } from "../../../@core/services/support/support.service";
import { firstValueFrom, of, switchMap } from "rxjs";
import { NftService } from "../../../@core/services/chains/nfts/nft.service";
import { CollectionsService } from "../../../@core/services/collections/collections.service";
import { UserFacade } from "../../../@core/store/user-facade";
import { Janitor } from "../../../@core/components/janitor";
import { EvmContractsStore } from "../../../@core/store/evm-contracts-store";
import { CategoriesStore } from "../../../@core/store/categories-store";
import { BlockchainWalletsStore } from "../../../@core/store/blockchain-wallets-store";

@Component({
    selector: "nft-marketplace-create-nft-page",
    templateUrl: "./create-nft-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./create-nft-page.component.scss"],
    animations: [fade]
})
export class CreateNFTPageComponent extends Janitor implements OnInit {
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
        private _userFacade: UserFacade,
        private _blockchainWalletsStore: BlockchainWalletsStore,
        private _cd: ChangeDetectorRef,
        private _walletRegistryService: WalletRegistryService,
        private _supportService: SupportService,
        private _categoriesStore: CategoriesStore,
        private _nftService: NftService,
        private _collectionsService: CollectionsService
    ) {
        super();
    }

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

        this._collectionsService.getCollectionByUserId().subscribe((collections) => {
            this.collections = collections;
            this._cd.detectChanges();
        });

        this.categories = this._categoriesStore.categories;
        this._cd.detectChanges();

        const userSub = this._userFacade.streamUser().subscribe((user) => {
            if (user) {
                this.userWallets = user.wallets;
                this.allBlockchains = this._blockchainWalletsStore.wallets
                    .map((chain) => {
                        return {
                            name: chain.blockchain.name,
                            id: chain.blockchain.id
                        };
                    })
                    .filter((chain) => this.userWallets.find((wal) => wal.wallet.chainId === chain.id));
                this.blockchains = [...this.allBlockchains];
            }
            this._cd.detectChanges();
        });
        this.addSubscription(userSub);
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
        const walletId = await this._findAvailableWallet(chainId);
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
                    const matchingWallets = this._blockchainWalletsStore.wallets.find((wallets) => wallets.blockchain.id === chainId);
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

    private async _findAvailableWallet(chainId: string): Promise<string> {
        let walletId: string | undefined;
        const userWallets = this.userWallets.filter((wallet) => wallet.wallet.chainId === chainId);

        if (userWallets.length === 1) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Object is possibly 'undefined'
            walletId = userWallets.at(0).wallet.id;
        } else if (userWallets.length > 1) {
            // const allWallets = this.blockchainWallets
            //     .filter((wal) => wal.blockchain.id === chainId)
            //     .filter((wal) => {
            //         wal.wallets = wal.wallets.filter((w) =>
            //             userWallets.find((userWallet) => userWallet.wallet.id === w.id)
            //         );
            //         return wal;
            //     });
            // walletId = await this._getWallet(chainId, allWallets);
        }

        if (!walletId) {
            // TODO Handle
            return "";
        }

        return walletId;
    }

    // private async _getWallet(chainId: string, wallets: BlockchainWalletDto[]): Promise<string | undefined> {
    //     const selectWalletsInput = wallets
    //         .filter((wallet) => wallet.blockchain.id === chainId)
    //         .flatMap((wallet) => wallet.wallets)
    //         .map((wallet) => {
    //             return {
    //                 img: `assets/images/${wallet.name}.png`,
    //                 title: wallet.name,
    //                 chain: this.blockchains.find((chain) => chain.id === wallet.chainId)?.name || ""
    //             };
    //         });
    //     const dialogRef = this._openDialog(selectWalletsInput);
    //     const walletName = await firstValueFrom(dialogRef.afterClosed());
    //     const wallet = wallets
    //         .filter((wallet) => wallet.blockchain.id === chainId)
    //         .flatMap((wallet) => wallet.wallets)
    //         .find((wallet) => wallet.name === walletName);
    //     return wallet?.id;
    // }

    // private _openDialog(wallets: { img: string; title: string; chain: string }[]) {
    //     return this._dialog.open(SelectWalletDialogComponent, {
    //         width: "500px",
    //         data: {
    //             wallets
    //         }
    //     });
    // }
}
