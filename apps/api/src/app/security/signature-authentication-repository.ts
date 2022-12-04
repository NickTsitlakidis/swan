import { Injectable } from "@nestjs/common";
import { SignatureAuthentication } from "./signature-authentication";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class SignatureAuthenticationRepository {
    constructor(private _entityManager: EntityManager) {}

    save(authentication: SignatureAuthentication): Promise<SignatureAuthentication> {
        return this._entityManager
            .fork()
            .persistAndFlush([authentication])
            .then(() => authentication);
    }

    findByAddressAndChain(address: string, chainId: string): Promise<SignatureAuthentication | null> {
        return this._entityManager.fork().findOne(SignatureAuthentication, { address: address, blockchainId: chainId });
    }

    findByAddressAndChainAndUserId(
        address: string,
        chainId: string,
        userId: string
    ): Promise<SignatureAuthentication | null> {
        return this._entityManager
            .fork()
            .findOne(SignatureAuthentication, { address: address, blockchainId: chainId, userId: userId });
    }

    deleteById(id: string): Promise<number> {
        return this._entityManager.fork().nativeDelete(SignatureAuthentication, { id: id });
    }

    deleteByAddressAndChain(address: string, chainId: string): Promise<number> {
        return this._entityManager
            .fork()
            .nativeDelete(SignatureAuthentication, { address: address, blockchainId: chainId });
    }
}
