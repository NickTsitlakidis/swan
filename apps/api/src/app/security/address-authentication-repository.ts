import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { AddressAuthentication } from "./address-authentication";
import { ObjectId } from "mongodb";

@Injectable()
export class AddressAuthenticationRepository {
    private _mongoRepo: MongoRepository<AddressAuthentication>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(AddressAuthentication);
    }

    save(authentication: AddressAuthentication): Promise<AddressAuthentication> {
        return this._mongoRepo.save(authentication);
    }

    findByAddress(address: string): Promise<Array<AddressAuthentication>> {
        return this._mongoRepo.find({ address: address });
    }

    deleteById(id: string): Promise<any> {
        return this._mongoRepo.deleteOne({ _id: new ObjectId(id) });
    }
}