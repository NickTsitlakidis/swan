import { ApiException } from "./api-exception";

export class AggregateConcurrencyException extends ApiException {
    constructor(aggregateId: string, expectedVersion: number, databaseVersion: number) {
        super(
            `Concurrency issue for aggregate ${aggregateId}. Expected ${expectedVersion}. Stored ${databaseVersion}`,
            false
        );
    }
}
