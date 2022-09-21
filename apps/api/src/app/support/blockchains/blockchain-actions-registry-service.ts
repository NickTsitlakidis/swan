import { Injectable } from "@nestjs/common";
import { Blockchain } from "./blockchain";
import { BlockchainActions } from "./blockchain-actions";
import { BlockchainRepository } from "./blockchain-repository";
import { EvmActionsService } from "./evm-actions-service";
import { SolanaActionsService } from "./solana-actions-service";
import { SignatureTypes } from "./signature-types";

@Injectable()
export class BlockchainActionsRegistryService {
    private _blockchains: Blockchain[];

    constructor(
        private readonly _blockchainRepository: BlockchainRepository,
        private _evmActionsService: EvmActionsService,
        private _solanaActionsService: SolanaActionsService
    ) {}

    async getService(blockchainId: string): Promise<BlockchainActions> {
        await this._initBlockchains();
        const blockchain = this._blockchains.find((blockchain) => blockchain.id === blockchainId);
        if (blockchain?.signatureType === SignatureTypes.EVM) {
            return this._evmActionsService;
        } else if (blockchain?.signatureType === SignatureTypes.SOLANA) {
            return this._solanaActionsService;
        }
    }

    // TODO - Rethink about it, utilizing onModuleInit of Nest produced an error on MikroOrm
    private async _initBlockchains() {
        if (!this._blockchains) {
            this._blockchains = await this._blockchainRepository.findAll();
        }
    }
}
