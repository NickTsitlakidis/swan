import { Injectable } from "@nestjs/common";
import { ContractFactory } from "@swan/contracts";

@Injectable()
export class EvmEventSubscriber {
    constructor(private readonly _contractFactory: ContractFactory) {}
}
