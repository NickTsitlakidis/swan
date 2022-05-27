import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { SignatureAuthentication } from "./signature-authentication";
import { DeleteWriteOpResultObject, ObjectId } from "mongodb";

@Injectable()
export class SignatureAuthenticationRepository {
    private _mongoRepo: MongoRepository<SignatureAuthentication>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(SignatureAuthentication);
    }

    save(authentication: SignatureAuthentication): Promise<SignatureAuthentication> {
        return this._mongoRepo.save(authentication);
    }

    findByAddressAndChain(address: string, chainId: string): Promise<SignatureAuthentication> {
        return this._mongoRepo.findOne({ address: address, blockchainId: chainId });
    }

    findByAddressAndChainAndUserId(address: string, chainId: string, userId: string): Promise<SignatureAuthentication> {
        return this._mongoRepo.findOne({ address: address, blockchainId: chainId, userId: userId });
    }

    deleteById(id: string): Promise<DeleteWriteOpResultObject> {
        return this._mongoRepo.deleteOne({ _id: new ObjectId(id) });
    }

    deleteByAddressAndChain(address: string, chainId: string): Promise<DeleteWriteOpResultObject> {
        return this._mongoRepo.deleteOne({ address: address, blockchainId: chainId });
    }
}
