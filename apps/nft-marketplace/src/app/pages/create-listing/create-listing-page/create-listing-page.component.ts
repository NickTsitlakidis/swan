import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { mergeMap, zip, of, EMPTY, firstValueFrom } from "rxjs";
import { ListingsService } from "../../../@core/services/listings/listings.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivateListingDto, BlockchainWalletDto, CreateListingDto, ProfileNftDto, SubmitListingDto } from "@swan/dto";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { isEqual } from "lodash";
import { BlockchainWalletsFacade } from "../../../@core/store/blockchain-wallets-facade";
import { Janitor } from "../../../@core/components/janitor";
import { UserFacade } from "../../../@core/store/user-facade";
import { EvmContractsFacade } from "../../../@core/store/evm-contracts-facade";
import { NftService } from "../../../@core/services/chains/nfts/nft.service";

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
        private _evmContractsFacade: EvmContractsFacade,
        private _fb: UntypedFormBuilder,
        private _cd: ChangeDetectorRef,
        private _listingsService: ListingsService,
        private _walletRegistryService: WalletRegistryService,
        private _userFacade: UserFacade,
        private _nftService: NftService
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

    async onSubmit() {
        if (!this.selectedForListingNft) {
            return;
        }
        const nft = this.selectedForListingNft;
        const dto = new CreateListingDto();
        dto.price = this.createListingForm.get("price")?.value;
        dto.tokenContractAddress = nft.tokenContractAddress;
        dto.chainTokenId = nft.tokenId;
        dto.blockchainId = nft.blockchain.id;
        // TODO better handling
        dto.nftAddress = nft.nftAddress || nft.tokenContractAddress;
        dto.categoryId = nft.category.id;
        dto.walletId = nft.walletId;
        dto.animationUrl = nft.animationUri;
        dto.imageUrl = nft.imageUri;
        dto.nftId = nft.id;
        console.log(dto, nft);

        if (!nft.id) {
            await firstValueFrom(this._nftService.createExternalNft(nft).pipe(mergeMap(() => EMPTY)));
        }

        const [listingEntity, walletService, blockchainWallets, marketplaceContracts] = await firstValueFrom(
            this._listingsService.createListing(dto).pipe(
                mergeMap((listingEntity) => {
                    return zip(
                        of(listingEntity),
                        this._walletRegistryService.getWalletService(nft.walletId),
                        this._blockchainWalletsFacade.streamWallets(),
                        this._evmContractsFacade.streamMarketplaceContracts()
                    );
                })
            )
        );

        if (walletService) {
            const matchingWallets = blockchainWallets.find(
                (wallets) => wallets.blockchain.id === nft.blockchain.id
            ) as BlockchainWalletDto;

            const matchingContract = marketplaceContracts.find((c) => c.blockchainId === nft.blockchain.id);

            const transactionHash = await firstValueFrom(
                walletService.createListing({
                    price: dto.price,
                    blockchain: matchingWallets.blockchain,
                    tokenContractAddress: dto.tokenContractAddress,
                    nftAddress: dto.nftAddress,
                    tokenId: parseInt(dto.chainTokenId || ""),
                    marketplaceContract: matchingContract
                })
            );

            const submitListingDto = new SubmitListingDto();
            submitListingDto.listingId = listingEntity.id;
            submitListingDto.chainTransactionId = transactionHash;
            const submittedListingEntity = await firstValueFrom(this._listingsService.submitListing(submitListingDto));

            const result = await firstValueFrom(
                walletService.getListingResult(transactionHash, matchingContract?.deploymentAddress as string)
            );

            const activateListingDto = new ActivateListingDto();
            activateListingDto.chainListingId = result.chainListingId;
            activateListingDto.blockNumber = result.blockNumber;
            activateListingDto.listingId = submittedListingEntity.id;

            return this._listingsService.activateListing(activateListingDto).subscribe((activated) => {
                console.log(activated);
            });
        } else {
            return EMPTY;
        }
    }
}
