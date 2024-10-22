import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { BlockchainDto, CategoryDto, CollectionLinksDto, CreateCollectionDto } from "@swan/dto";
import { CollectionsService } from "../../common/services/collections/collections.service";
import { ValidateName, ValidateUrl } from "./create-collection-page.validator";
import { DisplayPaymentTokens } from "./create-collection";
import { CategoriesStore } from "../../common/store/categories-store";
import { BlockchainWalletsStore } from "../../common/store/blockchain-wallets-store";
import { computed } from "mobx-angular";
import { makeObservable } from "mobx";

@Component({
    selector: "swan-create-collection-page",
    templateUrl: "./create-collection-page.component.html",
    styleUrls: ["./create-collection-page.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCollectionPageComponent implements OnInit {
    public createCollectionForm: UntypedFormGroup;
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
        private _categoriesStore: CategoriesStore
    ) {
        makeObservable(this);
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
    }

    @computed
    get categories(): Array<CategoryDto> {
        return this._categoriesStore.categories;
    }

    @computed
    get paymentTokens(): DisplayPaymentTokens[] {
        return this._blockchainWalletsStore.tokenSymbols.map((symbol) => {
            return {
                name: symbol
            };
        });
    }

    @computed
    get blockchains(): BlockchainDto[] {
        return this._blockchainWalletsStore.blockchains;
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
