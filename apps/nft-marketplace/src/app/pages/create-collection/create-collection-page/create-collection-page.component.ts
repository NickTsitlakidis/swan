import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "nft-marketplace-create-collection-page",
    templateUrl: "./create-collection-page.component.html",
    styleUrls: ["./create-collection-page.component.scss"]
})
export class CreateCollectionPageComponent implements OnInit {
    public createCollectionForm: FormGroup;
    public categories = ["Image", "Audio", "Video"];
    public blockchains = [
        {
            name: "Ethereum"
        },
        {
            name: "Solana"
        }
    ];
    public paymentTokens = [
        {
            name: "ETH"
        },
        {
            name: "WETH"
        }
    ];
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
            title: "Category",
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
            title: "Blockchain",
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

    constructor(private _fb: FormBuilder) {}

    ngOnInit(): void {
        this.createCollectionForm = this._fb.group({
            logoImage: [null, Validators.required],
            collectionName: ["", Validators.required],
            marketPlaceUrl: [""],
            description: ["", Validators.maxLength(1000)],
            category: [""],
            socialLinks: this._fb.group({
                customUrl: [""],
                discord: [""],
                instagram: [""],
                medium: [""],
                telegram: [""]
            }),
            chain: [""],
            paymentToken: [""],
            percentageFee: [""],
            sensitiveContent: [""]
        });
    }

    updateLogoImage(file: File | null) {
        this.createCollectionForm.patchValue({
            logoImage: file
        });

        this.createCollectionForm.get("logoImage")?.updateValueAndValidity();
    }

    onSubmit() {
        console.log("Hi");
    }
}
