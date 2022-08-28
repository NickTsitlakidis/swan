import { UserService } from "./../../../@core/services/user/user.service";
import { WalletRegistryService } from "./../../../@core/services/chains/wallet-registry.service";
import { mergeMap, zip, of, EMPTY } from "rxjs";
import { ListingsService } from "./../../../@core/services/listings/listings.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivateListingDto, CreateListingDto, ProfileNftDto, SubmitListingDto } from "@swan/dto";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { isEqual } from "lodash";

@Component({
    selector: "nft-marketplace-create-listing-page",
    templateUrl: "./create-listing-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./create-listing-page.component.scss"]
})
export class CreateListingPageComponent implements OnInit {
    public createListingForm: UntypedFormGroup;
    public selectedForListingNft: ProfileNftDto | undefined;
    public userNfts: ProfileNftDto[];

    constructor(
        private _fb: UntypedFormBuilder,
        private _cd: ChangeDetectorRef,
        private _listingsService: ListingsService,
        private _walletRegistryService: WalletRegistryService,
        private _userService: UserService
    ) {}

    ngOnInit(): void {
        this.createListingForm = this._fb.group({
            price: [undefined, Validators.required]
        });
        this._userService.getUserNfts().subscribe((nfts) => {
            this.userNfts = nfts;
            this._cd.detectChanges();
        });
    }

    async onSelectNft(nft: ProfileNftDto) {
        this.selectedForListingNft = isEqual(this.selectedForListingNft, nft) ? undefined : nft;
        this._cd.detectChanges();
    }

    onSubmit() {
        if (!this.selectedForListingNft) {
            return;
        }
        const nft = this.selectedForListingNft;
        const dto = new CreateListingDto();
        dto.price = this.createListingForm.get("price")?.value;
        dto.tokenContractAddress = nft.tokenContractAddress;
        dto.chainTokenId = nft.tokenId;
        dto.blockchainId = nft.blockchain.id;
        // TODO what happens?
        dto.categoryId = nft.category?.id || "";
        console.log(dto, nft);

        this._listingsService
            .createListing(dto)
            .pipe(
                mergeMap((listingEntity) => {
                    return zip(
                        of(listingEntity),
                        this._walletRegistryService.getWalletService("628ea2226b8991c676c19a4d")
                    );
                }),
                mergeMap(([listingEntity, metamaskService]) => {
                    if (metamaskService) {
                        return zip(
                            of(listingEntity),
                            of(metamaskService),
                            metamaskService.createListing(
                                dto.price,
                                dto.tokenContractAddress,
                                // TODO add solana implementation
                                parseInt(dto.chainTokenId || "")
                            )
                        );
                    }
                    return EMPTY;
                }),
                mergeMap(([listingEntity, metamaskService, transactionHash]) => {
                    const dto = new SubmitListingDto();
                    dto.listingId = listingEntity.id;
                    dto.chainTransactionId = transactionHash;
                    return zip(of(metamaskService), of(transactionHash), this._listingsService.submitListing(dto));
                }),
                mergeMap(([metamaskService, transactionHash, listingEntity]) => {
                    return zip(metamaskService.getListingResult(transactionHash), of(listingEntity));
                }),
                mergeMap(([result, listingEntity]) => {
                    const dto = new ActivateListingDto();
                    dto.chainListingId = result.chainListingId;
                    dto.blockNumber = result.blockNumber;
                    dto.listingId = listingEntity.id;

                    return this._listingsService.activateListing(dto);
                })
            )
            .subscribe((r) => console.log(r));
    }
}
