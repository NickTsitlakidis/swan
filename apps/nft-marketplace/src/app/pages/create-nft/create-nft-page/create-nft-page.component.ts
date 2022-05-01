import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SolanaAttributes } from "../../../@core/interfaces/create-nft.interface";

@Component({
    selector: "nft-marketplace-create-nft-page",
    templateUrl: "./create-nft-page.component.html",
    styleUrls: ["./create-nft-page.component.scss"]
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
        attributes: "Attributes"
    };
    public createNFTForm: FormGroup;

    constructor(private _fb: FormBuilder) {}

    ngOnInit(): void {
        this.createNFTForm = this._fb.group({
            title: [undefined, Validators.maxLength(50)],
            symbol: [undefined, Validators.maxLength(10)],
            isParentCollection: [false],
            description: [undefined, Validators.maxLength(500)],
            maxSupply: [undefined, Validators.pattern("-?\\d+(?:\\.\\d+)?")],
            attributes: [[]]
        });
    }

    public addAtrribute() {
        console.log("Hola");
        const newAttribute: SolanaAttributes = {
            traitType: "",
            displayType: "",
            value: ""
        };
        const currentValue = this.createNFTForm.get("attributes")?.value;
        currentValue.push(newAttribute);
        this.createNFTForm.patchValue({
            attributes: currentValue
        });
    }

    public onSubmit() {
        console.log("Hey");
    }
}
