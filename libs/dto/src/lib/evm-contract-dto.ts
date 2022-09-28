export class EvmContractDto {
    constructor(public deploymentAddress: string, public blockchainId: string, public isTestNetwork: boolean) {}
}
