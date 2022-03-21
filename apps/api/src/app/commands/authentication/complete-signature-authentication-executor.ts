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
import * as ethUtil from "ethereumjs-util";
import { Wallet } from "../../domain/user/wallet";
import { WalletViewRepository } from "../../views/wallet/wallet-view-repository";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require("bs58");

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
            const decodedSignature = bs58.decode(command.signature);
            const encodedNonce = new TextEncoder().encode(authentication.message);
            const pubKey = bs58.decode(authentication.address);
            try {
                sign_detached_verify(encodedNonce, decodedSignature, pubKey);
            } catch {
                this._logger.error(`Detected unverified signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        } else {
            const msgBuffer = ethUtil.toBuffer(authentication.message);
            const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
            const signatureBuffer = ethUtil.toBuffer(command.signature);
            const signatureParams = ethUtil.fromRpcSig(signatureBuffer.toString());
            const publicKey = ethUtil.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
            const addressBuffer = ethUtil.publicToAddress(publicKey);
            const address = ethUtil.bufferToHex(addressBuffer);

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
