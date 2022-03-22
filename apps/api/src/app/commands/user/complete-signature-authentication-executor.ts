import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteSignatureAuthenticationCommand } from "./complete-signature-authentication-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { isNil } from "lodash";
import { getLogger } from "../../infrastructure/logging";
import { UserTokenIssuer } from "../../security/user-token-issuer";
import { sign_detached_verify } from "tweetnacl-ts";
import { Blockchains, TokenDto } from "@nft-marketplace/common";
import { User } from "../../domain/user/user";
import { IdGenerator } from "../../infrastructure/id-generator";
import { EventStore } from "../../infrastructure/event-store";
import { Wallet } from "../../domain/user/wallet";
import { WalletViewRepository } from "../../views/wallet/wallet-view-repository";
import { bufferToHex, ecrecover, fromRpcSig, hashPersonalMessage, publicToAddress, toBuffer } from "ethereumjs-util";
import { decode } from "bs58";

@CommandHandler(CompleteSignatureAuthenticationCommand)
export class CompleteSignatureAuthenticationExecutor
    implements ICommandHandler<CompleteSignatureAuthenticationCommand>
{
    private _logger: Logger;

    constructor(
        private readonly _authenticationRepository: SignatureAuthenticationRepository,
        private readonly _idGenerator: IdGenerator,
        private readonly _walletViewRepository: WalletViewRepository,
        private readonly _userTokenIssuer: UserTokenIssuer,
        private readonly _eventStore: EventStore
    ) {
        this._logger = getLogger(CompleteSignatureAuthenticationExecutor);
    }

    async execute(command: CompleteSignatureAuthenticationCommand): Promise<TokenDto> {
        const authentication = await this._authenticationRepository.findByAddressAndChain(
            command.address,
            command.blockchain
        );

        if (isNil(authentication)) {
            throw new UnauthorizedException("Missing or invalid authentication");
        }
        if (authentication.blockchain === Blockchains.SOLANA) {
            const decodedSignature = decode(command.signature);
            const encodedNonce = new TextEncoder().encode(authentication.message);
            const pubKey = decode(authentication.address);
            try {
                sign_detached_verify(encodedNonce, decodedSignature, pubKey);
            } catch {
                this._logger.error(`Detected unverified signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        } else {
            const authenticationHexMessage = toBuffer(bufferToHex(Buffer.from(authentication.message)));
            const messageHash = hashPersonalMessage(authenticationHexMessage);
            const signatureParams = fromRpcSig(command.signature);
            const publicKey = ecrecover(messageHash, signatureParams.v, signatureParams.r, signatureParams.s);
            const addressBuffer = publicToAddress(publicKey);
            const address = bufferToHex(addressBuffer);

            // The signature verification is successful if the address found with
            // ecrecover matches the initial publicAddress
            if (address.toLowerCase() !== authentication.address) {
                this._logger.error(`Detected unverified signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        }

        await this._authenticationRepository.deleteById(authentication.id);
        const existingWallet = await this._walletViewRepository.findByAddressAndBlockchain(
            command.address,
            command.blockchain
        );

        let userId: string;
        if (isNil(existingWallet)) {
            const firstWallet = new Wallet(
                this._idGenerator.generateEntityId(),
                authentication.address,
                authentication.blockchain,
                authentication.wallet
            );
            const newUser = this._eventStore.connectEntity(new User(this._idGenerator.generateEntityId(), firstWallet));
            await newUser.commit();
            userId = newUser.id;
        } else {
            userId = existingWallet.userId;
        }

        return this._userTokenIssuer.issueFromId(userId);
    }
}
