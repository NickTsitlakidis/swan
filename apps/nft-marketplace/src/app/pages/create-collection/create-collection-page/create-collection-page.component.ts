import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { CategoryDto, CollectionLinksDto, CreateCollectionDto } from "@swan/dto";
import { CollectionsService } from "../../../@core/services/collections/collections.service";
import { ValidateName, ValidateUrl } from "./create-collection-page.validator";
import { DisplayedBlockchains, DisplayPaymentTokens } from "./create-collection";
import { Janitor } from "../../../@core/components/janitor";
import { CategoriesStore } from "../../../@core/store/categories-store";
import { BlockchainWalletsStore } from "../../../@core/store/blockchain-wallets-store";

@Component({
    selector: "nft-marketplace-create-collection-page",
    templateUrl: "./create-collection-page.component.html",
    styleUrls: ["./create-collection-page.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCollectionPageComponent extends Janitor implements OnInit {
    public createCollectionForm: UntypedFormGroup;
    public categories: CategoryDto[];
    public blockchains: DisplayedBlockchains[];
    public paymentTokens: DisplayPaymentTokens[];
    public labelsAndPlaceholders = {
        logoImage: {
            subtitle: "This image will also be used for navigation. 350 x 350 recommended.",
            title: "Logo image *"
        },
        collectionName: {
            title: "Name *",
            placeholder: "Example: Temple of illusions"
        },
        marketPlaceUrl: {
            title: "URL",
            subtitle: "Customize your URL on Swan :P. Must only contain lowercase letters,numbers, and hyphens.",
            placeholder: "temple-of-illusions",
            prefix: "https://swan-marketplace.io/collection/"
        },
        description: {
            title: "Description",
            subtitle: "0 of 1000 characters used."
        },
        category: {
            title: "Category *",
            subtitle: "Adding a category will help make your item discoverable on Swan."
        },
        socialLinks: {
            title: "Links",
            customUrl: {
                placeholder: "yoursite.com"
            },
            discord: {
                placeholder: "abcdef"
            },
            instagram: {
                placeholder: "yourinstagram"
            },
            medium: {
                placeholder: "yourmedium"
            },
            telegram: {
                placeholder: "yourtelegram"
            }
        },
        chain: {
            title: "Blockchain *",
            subtitle: "Select the blockchain where you'd like new items from this collection to be added by default."
        },
        paymentToken: {
            title: "Payment tokens",
            subtitle: "These tokens can be used to buy and sell your items."
        },
        percentageFee: {
            title: "Creator Earnings",
            subtitle:
                "Collect a fee when a user re-sells an item you originally created. This is deducted from the final sale price and paid monthly to a payout address of your choosing.",
            placeholder: "Percentage fee, e.g 1.5"
        },
        sensitiveContent: {
            title: "Explicit & sensitive content",
            subtitle: "Set this collection as explicit and sensitive content"
        }
    };

    constructor(
        private _fb: UntypedFormBuilder,
        private _collectionsService: CollectionsService,
        private _blockchainWalletsStore: BlockchainWalletsStore,
        private _categoriesStore: CategoriesStore,
        private _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        this.createCollectionForm = this._fb.group({
            logoImage: [undefined, Validators.required],
            collectionName: [undefined, [Validators.required], [ValidateName.validateName(this._collectionsService)]],
            marketPlaceUrl: [undefined, [ValidateUrl.validateUrl(this._collectionsService)]],
            description: [undefined, Validators.maxLength(1000)],
            category: [undefined, Validators.required],
            socialLinks: this._fb.group({
                customUrl: [undefined],
                discord: [undefined],
                instagram: [undefined],
                medium: [undefined],
                telegram: [undefined]
            }),
            chain: [undefined, Validators.required],
            paymentToken: [undefined],
            percentageFee: [undefined],
            sensitiveContent: [undefined]
        });

        this.categories = this._categoriesStore.categories;
        this.blockchains = this._blockchainWalletsStore.wallets.map((chain) => {
            return {
                name: chain.blockchain.name,
                id: chain.blockchain.id
            };
        });
        this.paymentTokens = this._blockchainWalletsStore.wallets.map((chain) => {
            return {
                name: chain.mainTokenSymbol
            };
        });
        this._cd.detectChanges();
    }

    updateLogoImage(file: File | null) {
        this.createCollectionForm.patchValue({
            logoImage: file
        });

        this.createCollectionForm.get("logoImage")?.updateValueAndValidity();
    }

    onSubmit() {
        const body = new CreateCollectionDto();
        const socialLinks = new CollectionLinksDto();
        const socialFormVal = this.createCollectionForm.get("socialLinks")?.value;

        socialLinks.discord = socialFormVal.discord;
        socialLinks.instagram = socialFormVal?.instagram;
        socialLinks.medium = socialFormVal?.medium;
        socialLinks.telegram = socialFormVal?.telegram;
        socialLinks.website = socialFormVal?.customUrl;
        body.links = socialLinks;
        body.name = this.createCollectionForm.get("collectionName")?.value;
        body.categoryId = this.createCollectionForm.get("category")?.value;
        body.customUrl = this.createCollectionForm.get("marketPlaceUrl")?.value;
        body.description = this.createCollectionForm.get("description")?.value;
        body.isExplicit = this.createCollectionForm.get("sensitiveContent")?.value;
        body.imageUrl = this.createCollectionForm.get("logoImage")?.value;
        body.salePercentage = this.createCollectionForm.get("percentageFee")?.value;
        body.paymentToken = this.createCollectionForm.get("paymentToken")?.value?.name;
        body.blockchainId = this.createCollectionForm.get("chain")?.value?.id;

        this._collectionsService.createCollection(body).subscribe(() => undefined);
    }
}
