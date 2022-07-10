import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { CategoryDto, CollectionDto, NftMetadataAttributeDto } from "@nft-marketplace/common";
import { LocalStorageService } from "ngx-webstorage";
import { fade } from "../../../@core/animations/enter-leave.animation";
import { CreateNft } from "../../../@core/services/chains/nft";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { SupportService } from "../../../@core/services/support/support.service";
import { of, switchMap } from "rxjs";
import { NftService } from "../../../@core/services/chains/nfts/nft.service";
import { CollectionsService } from "../../../@core/services/collections/collections.service";

@Component({
    selector: "nft-marketplace-create-nft-page",
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
    public allCategories: CategoryDto[];
    public allBlockchains: { name: string; id: string }[];
    public blockchains: { name: string; id: string }[];
    public categories: CategoryDto[];

    constructor(
        private _fb: UntypedFormBuilder,
        private _cd: ChangeDetectorRef,
        private _walletRegistryService: WalletRegistryService,
        private _lcStorage: LocalStorageService,
        private _supportService: SupportService,
        private _nftService: NftService,
        private _collectionsService: CollectionsService
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

        this._collectionsService.getCollectionByUserId().subscribe((collections) => {
            this.collections = collections;
            this._cd.detectChanges();
        });

        this._supportService.getCategories().subscribe((categories) => {
            this.allCategories = categories;
            this.categories = [...this.allCategories];
            this._cd.detectChanges();
        });

        this._supportService.getBlockchainWallets().subscribe((chains) => {
            this.allBlockchains = chains.map((chain) => {
                return {
                    name: chain.name,
                    id: chain.blockchainId
                };
            });
            this.blockchains = [...this.allBlockchains];
            this._cd.detectChanges();
        });
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
            this.categories = [...this.allCategories];
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

    public onSubmit() {
        const walletId = this._lcStorage.retrieve("walletId");
        const walletService = this._walletRegistryService.getWalletService(walletId);
        const metadata: NftMetadataAttributeDto[] = [];
        for (let index = 1; index <= this.attributes.length; index++) {
            metadata.push({
                traitType: this.createNFTForm.get(`attributeTrait${index}`)?.value,
                value: this.createNFTForm.get(`attributeValue${index}`)?.value,
                displayType: this.createNFTForm.get(`attributeDisplay${index}`)?.value
            });
        }

        this._supportService
            .uploadFileToS3(this.uploadedFile)
            .pipe(
                switchMap((signedUriResponse) => {
                    const nftMetadataDto = {
                        imageType: this.uploadedFile.type,
                        imageName: this.uploadedFile.name,
                        categoryId: this.createNFTForm.get("category")?.value.id,
                        s3uri: signedUriResponse,
                        name: this.createNFTForm.get("title")?.value,
                        description: this.createNFTForm.get("description")?.value,
                        resellPercentage: this.createNFTForm.get("royalties")?.value,
                        maxSupply: this.createNFTForm.get("maxSupply")?.value,
                        chainId: this.createNFTForm.get("blockchain")?.value.id,
                        walletId: this._lcStorage.retrieve("walletId"),
                        attributes: metadata,
                        collectionId: this.createNFTForm.get("collection")?.value?.id || undefined
                    };
                    return this._nftService.createNft(nftMetadataDto);
                }),
                switchMap((nftResponse) => {
                    const nft = {
                        metadataUri: nftResponse.metadataUri,
                        name: this.createNFTForm.get("title")?.value,
                        symbol: this.createNFTForm.get("symbol")?.value,
                        resellPercentage: this.createNFTForm.get("royalties")?.value,
                        maxSupply: this.createNFTForm.get("maxSupply")?.value,
                        metadata
                    } as CreateNft;
                    if (walletService) {
                        return walletService.mint(nft);
                    } else {
                        return of();
                    }
                })
            )
            .subscribe(console.log);
    }
}
