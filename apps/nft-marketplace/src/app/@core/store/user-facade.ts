import { Injectable } from "@angular/core";
import { UserStore } from "./user-store";
import { CompleteSignatureAuthenticationDto, StartSignatureAuthenticationDto, TokenDto, UserDto } from "@swan/dto";
import { firstValueFrom, Observable } from "rxjs";
import { mobxStream } from "./stream-utils";
import { WalletRegistryService } from "../services/chains/wallet-registry.service";
import { isNil } from "lodash";
import { LocalStorageService } from "ngx-webstorage";
import { UserService } from "../services/user/user.service";
import { ComplexState } from "./complex-state";

@Injectable({ providedIn: "root" })
export class UserFacade {
    constructor(
        private readonly _userStore: UserStore,
        private readonly _userService: UserService,
        private readonly _walletRegistry: WalletRegistryService,
        private readonly _storageService: LocalStorageService
    ) {
        const existingToken = this.readTokenFromStorage();
        if (existingToken) {
            this._userStore.setToken(ComplexState.fromSuccess(existingToken));
        }
    }

    async authenticateWithSignature(body: StartSignatureAuthenticationDto) {
        try {
            const walletService = await firstValueFrom(this._walletRegistry.getWalletService(body.walletId));
            if (isNil(walletService)) {
                this._userStore.setToken(ComplexState.fromError(new Error("Unable to match wallet with service")));
                return;
            }

            const nonce = await firstValueFrom(this._userService.startSignatureAuthentication(body));
            const signature = await firstValueFrom(walletService.signMessage(nonce.nonce));
            if (isNil(signature)) {
                this._userStore.setToken(ComplexState.fromError(new Error("Signature authentication stopped")));
                return;
            }

            const completeBody = new CompleteSignatureAuthenticationDto();
            completeBody.signature = signature;
            completeBody.blockchainId = body.blockchainId;
            completeBody.address = body.address;
            const token = await firstValueFrom(this._userService.completeSignatureAuthentication(completeBody));

            this._userStore.setToken(ComplexState.fromSuccess(token));

            this.saveTokenToStorage(token);
            this.refreshUser();
        } catch (error) {
            this._userStore.setToken(ComplexState.fromError(error as Error));
        }
    }

    async addUserWallet(body: StartSignatureAuthenticationDto) {
        try {
            const walletService = await firstValueFrom(this._walletRegistry.getWalletService(body.walletId));
            if (isNil(walletService)) {
                //todo this should throw a generic error without changing state
                return;
            }

            const nonce = await firstValueFrom(this._userService.startWalletAddition(body));
            const signature = await firstValueFrom(walletService.signMessage(nonce.nonce));
            if (isNil(signature)) {
                //todo this should throw a generic error without changing state
                return;
            }

            const completeBody = new CompleteSignatureAuthenticationDto();
            completeBody.signature = signature;
            completeBody.blockchainId = body.blockchainId;
            completeBody.address = body.address;

            await firstValueFrom(this._userService.completeWalletAddition(completeBody));
            this.refreshUser();
        } catch (error) {
            //todo this should throw a generic error without changing state
            return;
        }
    }

    async refreshUser() {
        if (this._userStore.isLoggedIn) {
            try {
                const refreshed = await firstValueFrom(this._userService.getUser());
                this._userStore.setUser(ComplexState.fromSuccess(refreshed));
            } catch (error) {
                this._userStore.setUser(ComplexState.fromError(error as Error));
            }
        }
    }

    async refreshToken() {
        if (!this._userStore.token?.state.refreshToken) {
            this._userStore.setToken(ComplexState.fromError(new Error("No refresh token")));
            return;
        }
        try {
            const tokenValue = this._userStore.token.state.refreshToken;
            const refreshed = await firstValueFrom(this._userService.refreshToken(tokenValue));
            this._userStore.setToken(ComplexState.fromSuccess(refreshed));
        } catch (error) {
            this._userStore.setToken(ComplexState.fromError(error as Error));
        }
    }

    streamUser(): Observable<UserDto | undefined> {
        return mobxStream(() => this._userStore.user.state);
    }

    streamToken(): Observable<ComplexState<TokenDto>> {
        return mobxStream(() => this._userStore.token);
    }

    private saveTokenToStorage(token: TokenDto) {
        this._storageService.store("userTokenValue", token.tokenValue);
        this._storageService.store("userExpiresAt", token.expiresAt.toISOString());
        this._storageService.store("userRefreshToken", token.refreshToken);
    }

    private readTokenFromStorage(): TokenDto | undefined {
        const userToken = this._storageService.retrieve("userTokenValue");
        const expiresAt = this._storageService.retrieve("userExpiresAt");
        const refreshToken = this._storageService.retrieve("userRefreshToken");

        if (!isNil(userToken) && !isNil(expiresAt) && !isNil(refreshToken)) {
            return new TokenDto(userToken, expiresAt, refreshToken);
        }

        return undefined;
    }
}
