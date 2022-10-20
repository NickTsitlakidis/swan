import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import {
    CreateAuctionHouseBuilderContext,
    CreateAuctionHouseBuilderParams,
    CreateNftInput,
    ExpectedSignerError,
    isSigner,
    Metaplex,
    sol,
    toPublicKey,
    TransactionBuilder,
    TransactionBuilderOptions,
    walletAdapterIdentity
} from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey, Signer } from "@solana/web3.js";
import { ChainsModule } from "../chains.module";
import {
    AuthorityScope,
    createCreateAuctionHouseInstruction,
    createDelegateAuctioneerInstruction
} from "@metaplex-foundation/mpl-auction-house";
const WRAPPED_SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const AUCTIONEER_ALL_SCOPES = [
    AuthorityScope.Deposit,
    AuthorityScope.Buy,
    AuthorityScope.PublicBuy,
    AuthorityScope.ExecuteSale,
    AuthorityScope.Sell,
    AuthorityScope.Cancel,
    AuthorityScope.Withdraw
];

@Injectable({
    providedIn: ChainsModule
})
export class MetaplexService {
    private _metaplex: Metaplex;
    private _connection: Connection;

    constructor() {
        this._connection = new Connection(clusterApiUrl("devnet"));
        this._metaplex = Metaplex.make(this._connection);
    }

    public async mintNFT(nftInput: CreateNftInput, wallet: Wallet) {
        const pubKey = nftInput.tokenOwner;
        this._metaplex.use(walletAdapterIdentity(wallet.adapter));
        let account;
        if (pubKey) {
            account = await this._connection.getAccountInfo(pubKey);
        }
        if (account?.owner) {
            return await this._metaplex.nfts().create(nftInput);
        } else {
            return;
        }
    }

    public async createListing(nftAddress: string, price: number) {
        const auctionHouse: any = await this._createAuctionHouse({
            sellerFeeBasisPoints: 200,
            treasuryMint: new PublicKey(nftAddress)
        });

        return await this._metaplex.auctionHouse().list({
            auctionHouse: auctionHouse,
            mintAccount: new PublicKey(nftAddress),
            price: sol(price)
        });
    }
    private async _createAuctionHouse(
        params?: CreateAuctionHouseBuilderParams,
        options: TransactionBuilderOptions = {}
    ) {
        // Data.
        const { programs, payer = this._metaplex.rpc().getDefaultFeePayer() } = options;
        const canChangeSalePrice = params?.canChangeSalePrice ?? false;
        const requiresSignOff = params?.requiresSignOff ?? canChangeSalePrice;

        // Accounts.
        const authority = params?.authority ?? this._metaplex.identity();
        const treasuryMint = params?.treasuryMint ?? WRAPPED_SOL_MINT;
        const treasuryWithdrawalDestinationOwner =
            params?.treasuryWithdrawalDestinationOwner ?? this._metaplex.identity().publicKey;
        const feeWithdrawalDestination = params?.feeWithdrawalDestination ?? this._metaplex.identity().publicKey;

        // Auctioneer delegate instruction needs to be signed by authority
        if (params?.auctioneerAuthority && !isSigner(authority)) {
            throw new ExpectedSignerError("authority", "PublicKey", {
                problemSuffix:
                    "You are trying to delegate to an Auctioneer authority which " +
                    "requires the Auction House authority to sign a transaction. " +
                    "But you provided the Auction House authority as a Public Key."
            });
        }

        // PDAs.
        const auctionHouse = this._metaplex
            .auctionHouse()
            .pdas()
            .auctionHouse({
                creator: toPublicKey(authority),
                treasuryMint,
                programs
            });
        const auctionHouseFeeAccount = this._metaplex.auctionHouse().pdas().fee({
            auctionHouse,
            programs
        });
        const auctionHouseTreasury = this._metaplex.auctionHouse().pdas().treasury({
            auctionHouse,
            programs
        });
        const treasuryWithdrawalDestination = treasuryMint.equals(WRAPPED_SOL_MINT)
            ? treasuryWithdrawalDestinationOwner
            : this._metaplex.tokens().pdas().associatedTokenAccount({
                  mint: treasuryMint,
                  owner: treasuryWithdrawalDestinationOwner,
                  programs
              });

        return (
            TransactionBuilder.make<CreateAuctionHouseBuilderContext>()
                .setFeePayer(payer)
                .setContext({
                    auctionHouseAddress: auctionHouse,
                    auctionHouseFeeAccountAddress: auctionHouseFeeAccount,
                    auctionHouseTreasuryAddress: auctionHouseTreasury,
                    treasuryWithdrawalDestinationAddress: treasuryWithdrawalDestination
                })

                // Create and initialize the Auction House account.
                .add({
                    instruction: createCreateAuctionHouseInstruction(
                        {
                            treasuryMint,
                            payer: payer.publicKey,
                            authority: toPublicKey(authority),
                            feeWithdrawalDestination,
                            treasuryWithdrawalDestination,
                            treasuryWithdrawalDestinationOwner,
                            auctionHouse,
                            auctionHouseFeeAccount,
                            auctionHouseTreasury
                        },
                        {
                            bump: auctionHouse.bump,
                            feePayerBump: auctionHouseFeeAccount.bump,
                            treasuryBump: auctionHouseTreasury.bump,
                            sellerFeeBasisPoints: params?.sellerFeeBasisPoints || 0,
                            requiresSignOff,
                            canChangeSalePrice
                        }
                    ),
                    signers: [payer],
                    key: params?.instructionKey ?? "createAuctionHouse"
                })

                // Delegate to the Auctioneer authority when provided.
                .when(Boolean(params?.auctioneerAuthority), (builder) => {
                    const auctioneerAuthority = params?.auctioneerAuthority as PublicKey;
                    return builder.add({
                        instruction: createDelegateAuctioneerInstruction(
                            {
                                auctionHouse,
                                authority: toPublicKey(authority as Signer),
                                auctioneerAuthority,
                                ahAuctioneerPda: this._metaplex.auctionHouse().pdas().auctioneer({
                                    auctionHouse,
                                    auctioneerAuthority,
                                    programs
                                })
                            },
                            { scopes: params?.auctioneerScopes ?? AUCTIONEER_ALL_SCOPES }
                        ),
                        signers: [authority as Signer],
                        key: params?.delegateAuctioneerInstructionKey ?? "delegateAuctioneer"
                    });
                })
        );
    }
}
