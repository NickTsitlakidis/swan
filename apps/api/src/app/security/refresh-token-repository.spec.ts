import { Test } from "@nestjs/testing";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../test-utils/mongo";
import { Connection } from "typeorm";
import { Collection, ObjectId } from "mongodb";
import { RefreshTokenRepository } from "./refresh-token-repository";
import { RefreshToken } from "./refresh-token";

let repository: RefreshTokenRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [RefreshTokenRepository]
    }).compile();

    repository = moduleRef.get(RefreshTokenRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("refresh-tokens", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("save - persists token", async () => {
    const token = new RefreshToken();
    token.id = new ObjectId().toHexString();
    token.userId = "the-user";
    token.tokenValue = "the-token";
    token.isRevoked = true;
    token.issuedAt = new Date();

    const saved = await repository.save(token);
    expect(saved).toEqual(token);

    const found = await collection.find({ _id: token._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toEqual(token);
});

test("findByTokenValue - returns undefined for no match", async () => {
    const id = new ObjectId();
    await collection.insertOne({
        userId: "the-user",
        tokenValue: "the-token",
        isExpirable: true,
        isRevoked: true,
        expiresAt: new Date(),
        issuedAt: new Date(),
        _id: id
    });

    const found = await repository.findByTokenValue("other token");
    expect(found).toBeUndefined();
});

test("findByEmail - returns match", async () => {
    const id = new ObjectId();
    const issueDate = new Date();
    const expirationDate = new Date();
    await collection.insertOne({
        userId: "the-user",
        tokenValue: "the-token",
        isExpirable: true,
        isRevoked: true,
        expiresAt: expirationDate,
        issuedAt: issueDate,
        _id: id
    });

    const found = await repository.findByTokenValue("the-token");
    expect(found.userId).toBe("the-user");
    expect(found.id).toBe(id.toHexString());
    expect(found.tokenValue).toBe("the-token");
    expect(found.issuedAt).toEqual(issueDate);
    expect(found.isRevoked).toBe(true);
});
