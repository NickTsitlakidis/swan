import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { fade } from "../../../@core/animations/enter-leave.animation";
import { SolanaAttributes } from "../../../@core/interfaces/create-nft.interface";
import { MetaplexService } from "../../../@core/services/nft/metaplex.service";
import { CreateNftInput } from "@metaplex-foundation/js-next";
import { UserAuthService } from "../../../@core/services/authentication/user_auth.service";
import { PublicKey } from "@solana/web3.js";

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
    public attributes: SolanaAttributes[] = [];

    constructor(
        private _fb: FormBuilder,
        private _userAuthService: UserAuthService,
        private _cd: ChangeDetectorRef,
        private _metaplexService: MetaplexService
    ) {}

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
        const newAttribute: SolanaAttributes = {
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
        const nft = {
            uri: "https://images.unsplash.com/photo-1653387711918-9d36fb815849?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2574&q=80",
            name: this.createNFTForm.get("title")?.value,
            symbol: this.createNFTForm.get("symbol")?.value,
            sellerFeeBasisPoints: this.createNFTForm.get("royalties")?.value,
            // creators?: Creator[],
            // collection?: Collection,
            // uses?: Uses,
            isMutable: false,
            maxSupply: this.createNFTForm.get("maxSupply")?.value,
            // allowHolderOffCurve: boolean,
            // mint: Signer,
            // payer: Signer,
            // mintAuthority: Signer,
            // updateAuthority: Signer,
            owner: new PublicKey(this._userAuthService.getPublicKey())
            // freezeAuthority: PublicKey,
            // tokenProgram: PublicKey,
            // associatedTokenProgram: PublicKey,
            // confirmOptions: ConfirmOptions
        } as CreateNftInput;
        this._metaplexService.mintNFT(nft);
    }
}
