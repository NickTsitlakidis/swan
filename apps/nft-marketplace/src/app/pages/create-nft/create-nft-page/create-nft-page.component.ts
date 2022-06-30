import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { NftMetadataAttributeDto } from "@nft-marketplace/common";
import { LocalStorageService } from "ngx-webstorage";
import { fade } from "../../../@core/animations/enter-leave.animation";
import { CreateNft } from "../../../@core/services/chains/nft";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { SupportService } from "../../../@core/services/support/support.service";
import { of, switchMap } from "rxjs";
import { NftService } from "../../../@core/services/chains/nfts/nft.service";

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
    public createNFTForm: UntypedFormGroup;
    public attributes: NftMetadataAttributeDto[] = [];
    public uploadedFile: File;

    constructor(
        private _fb: UntypedFormBuilder,
        private _cd: ChangeDetectorRef,
        private _walletRegistryService: WalletRegistryService,
        private _lcStorage: LocalStorageService,
        private _supportService: SupportService,
        private _nftService: NftService
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
                        categoryId: "628ea0716b8991c676c19a4a",
                        s3uri: signedUriResponse,
                        name: this.createNFTForm.get("title")?.value,
                        description: this.createNFTForm.get("description")?.value,
                        resellPercentage: this.createNFTForm.get("royalties")?.value,
                        maxSupply: this.createNFTForm.get("maxSupply")?.value,
                        chainId: "628e9d126b8991c676c19a47",
                        walletId: this._lcStorage.retrieve("walletId"),
                        attributes: metadata
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
