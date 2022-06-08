import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { fade } from "../../../@core/animations/enter-leave.animation";
import { CreateNft, MetadataAttribute } from "../../../@core/services/chains/nft";

@Component({
    selector: "nft-marketplace-create-nft-page",
    templateUrl: "./create-nft-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./create-nft-page.component.scss"],
    animations: [fade]
})
export class CreateNFTPageComponent implements OnInit {
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
        attributeDisplay: "Display type (Optional)"
    };
    public createNFTForm: FormGroup;
    public attributes: MetadataAttribute[] = [];

    constructor(private _fb: FormBuilder, private _cd: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.createNFTForm = this._fb.group({
            title: [undefined, Validators.maxLength(50)],
            symbol: [undefined, Validators.maxLength(10)],
            isParentCollection: [false],
            description: [undefined, Validators.maxLength(500)],
            maxSupply: [undefined, Validators.pattern("-?\\d+(?:\\.\\d+)?")],
            royalties: [undefined, Validators.required]
        });
    }

    public getAttributeValue(formAttributeName: string) {
        return this.createNFTForm.get(formAttributeName)?.value;
    }

    public addAtrribute() {
        const newAttribute: MetadataAttribute = {
            traitType: "",
            displayType: "",
            value: ""
        };
        this.attributes.push(newAttribute);
        const i = this.attributes.length;
        this.createNFTForm.addControl(`attributeTrait${i}`, new FormControl(newAttribute.traitType));
        this.createNFTForm.addControl(`attributeValue${i}`, new FormControl(newAttribute.value, Validators.required));
        this.createNFTForm.addControl(`attributeDisplay${i}`, new FormControl(newAttribute.displayType));
        this._cd.detectChanges();
    }

    public onSubmit() {
        const metadata: MetadataAttribute[] = [];
        for (const index in this.attributes) {
            metadata.push({
                traitType: this.createNFTForm.get(`attributeTrait${index}`)?.value,
                value: this.createNFTForm.get(`attributeValue${index}`)?.value,
                displayType: this.createNFTForm.get(`attributeDisplay${index}`)?.value
            });
        }
        const nft = {
            metadataUri:
                "https://images.unsplash.com/photo-1653387711918-9d36fb815849?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80",
            name: this.createNFTForm.get("title")?.value,
            symbol: this.createNFTForm.get("symbol")?.value,
            resellPercentage: this.createNFTForm.get("royalties")?.value,
            maxSupply: this.createNFTForm.get("maxSupply")?.value,
            metadata
        } as CreateNft;

        /* this._solanaWalletService.mint(nft); */
    }
}
