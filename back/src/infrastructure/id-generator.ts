import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ObjectID as MongoObjectId } from "mongodb";

/**
 * A service that can be used to create ids based on the id usage.
 * Having this abstraction helps with unit test mocking of id generation.
 */
@Injectable()
export class IdGenerator {
    /**
     * Generate and return a unique Mongo Object Id Hex string
     */
    public generateEntityId(): string {
        return new MongoObjectId().toHexString();
    }

    /**
     * Generate and return a unique v4 UUID string
     */
    public generateUUID(): string {
        return uuidv4();
    }
}
