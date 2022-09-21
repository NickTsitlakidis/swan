import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { mergeMap, zip, of, EMPTY } from "rxjs";
import { ListingsService } from "../../../@core/services/listings/listings.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivateListingDto, BlockchainWalletDto, CreateListingDto, ProfileNftDto, SubmitListingDto } from "@swan/dto";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { isEqual } from "lodash";
import { BlockchainWalletsFacade } from "../../../@core/store/blockchain-wallets-facade";
import { Janitor } from "../../../@core/components/janitor";
import { UserFacade } from "../../../@core/store/user-facade";

@Component({
    selector: "nft-marketplace-create-listing-page",
    templateUrl: "./create-listing-page.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./create-listing-page.component.scss"]
})
export class CreateListingPageComponent extends Janitor implements OnInit {
    public createListingForm: UntypedFormGroup;
    public selectedForListingNft: ProfileNftDto | undefined;
    public userNfts: ProfileNftDto[];

    constructor(
        private _blockchainWalletsFacade: BlockchainWalletsFacade,
        private _fb: UntypedFormBuilder,
        private _cd: ChangeDetectorRef,
        private _listingsService: ListingsService,
        private _walletRegistryService: WalletRegistryService,
        private _userFacade: UserFacade
    ) {
        super();
    }

    ngOnInit(): void {
        this.createListingForm = this._fb.group({
            price: [undefined, Validators.required]
        });

        const nftSub = this._userFacade.streamNft().subscribe((nfts) => {
            if (nfts.isEmpty) {
                this._userFacade.getNfts();
            } else {
                this.userNfts = nfts.state;
                this._cd.detectChanges();
            }
        });
        this.addSubscription(nftSub);
    }

    async onSelectNft(nft: ProfileNftDto) {
        this.selectedForListingNft = isEqual(this.selectedForListingNft, nft) ? undefined : nft;
        console.log(this.selectedForListingNft);
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
        dto.categoryId = nft.category.id;
        dto.walletId = nft.walletId;
        dto.animationUrl = nft.animationUri;
        dto.imageUrl = nft.imageUri;
        console.log(dto, nft);

        this._listingsService
            .createListing(dto)
            .pipe(
                mergeMap((listingEntity) => {
                    return zip(
                        of(listingEntity),
                        this._walletRegistryService.getWalletService(nft.walletId),
                        this._blockchainWalletsFacade.streamWallets()
                    );
                }),
                mergeMap(([listingEntity, walletService, blockchainWallets]) => {
                    if (walletService) {
                        const matchingWallets = blockchainWallets.find(
                            (wallets) => wallets.blockchain.id === nft.blockchain.id
                        ) as BlockchainWalletDto;
                        return zip(
                            of(listingEntity),
                            of(walletService),
                            walletService.createListing({
                                price: dto.price,
                                blockchain: matchingWallets.blockchain,
                                tokenContractAddress: dto.tokenContractAddress,
                                tokenId: parseInt(dto.chainTokenId || "")
                            })
                        );
                    }
                    return EMPTY;
                }),
                mergeMap(([listingEntity, walletService, transactionHash]) => {
                    const dto = new SubmitListingDto();
                    dto.listingId = listingEntity.id;
                    dto.chainTransactionId = transactionHash;
                    return zip(of(walletService), of(transactionHash), this._listingsService.submitListing(dto));
                }),
                mergeMap(([walletService, transactionHash, listingEntity]) => {
                    return zip(walletService.getListingResult(transactionHash, nft.blockchain.id), of(listingEntity));
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
