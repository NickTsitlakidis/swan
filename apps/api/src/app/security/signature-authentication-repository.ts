import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { SignatureAuthentication } from "./signature-authentication";
import { DeleteWriteOpResultObject, ObjectId } from "mongodb";
import { Blockchains } from "@nft-marketplace/common";

@Injectable()
export class SignatureAuthenticationRepository {
    private _mongoRepo: MongoRepository<SignatureAuthentication>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(SignatureAuthentication);
    }

    save(authentication: SignatureAuthentication): Promise<SignatureAuthentication> {
        return this._mongoRepo.save(authentication);
    }

    findByAddressAndChain(address: string, chain: Blockchains): Promise<SignatureAuthentication> {
        return this._mongoRepo.findOne({ address: address, blockchain: chain });
    }

    deleteById(id: string): Promise<DeleteWriteOpResultObject> {
        return this._mongoRepo.deleteOne({ _id: new ObjectId(id) });
    }

    deleteByAddressAndChain(address: string, chain: Blockchains): Promise<DeleteWriteOpResultObject> {
        return this._mongoRepo.deleteOne({ address: address, blockchain: chain });
    }
}
