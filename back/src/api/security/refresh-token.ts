import { Column, CreateDateColumn, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("refresh-tokens")
export class RefreshToken extends MongoDocument {
    @Column()
    userId: string;

    @Column()
    tokenValue: string;

    @Column()
    isRevoked: boolean;

    @CreateDateColumn()
    issuedAt: Date;
}
