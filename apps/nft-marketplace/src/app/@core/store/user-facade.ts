import { Injectable } from "@angular/core";
import { UserStore } from "./user-store";
import { CompleteSignatureAuthenticationDto, StartSignatureAuthenticationDto, TokenDto, UserDto } from "@swan/dto";
import { firstValueFrom, Observable } from "rxjs";
import { mobxStream } from "./stream-utils";
import { WalletRegistryService } from "../services/chains/wallet-registry.service";
import { isNil } from "lodash";
import { LocalStorageService } from "ngx-webstorage";
import { UserService } from "../services/user/user.service";

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
            this._userStore.setToken(existingToken, true);
        }
    }

    async authenticateWithSignature(body: StartSignatureAuthenticationDto) {
        this._userStore.startLoading();

        try {
            const walletService = await firstValueFrom(this._walletRegistry.getWalletService(body.walletId));
            if (isNil(walletService)) {
                this._userStore.finishLoading(new Error("Unable to match wallet with service"));
                return;
            }

            const nonce = await firstValueFrom(this._userService.startSignatureAuthentication(body));
            const signature = await firstValueFrom(walletService.signMessage(nonce.nonce));
            if (isNil(signature)) {
                this._userStore.finishLoading(new Error("Signature authentication stopped"));
                return;
            }

            const completeBody = new CompleteSignatureAuthenticationDto();
            completeBody.signature = signature;
            completeBody.blockchainId = body.blockchainId;
            completeBody.address = body.address;
            const token = await firstValueFrom(this._userService.completeSignatureAuthentication(completeBody));

            this._userStore.setToken(token);

            this.saveTokenToStorage(token);
            this.refreshUser();
        } catch (error) {
            this._userStore.finishLoading(error as any);
        }
    }

    async refreshUser() {
        if (this._userStore.isLoggedIn) {
            try {
                this._userStore.startLoading();
                const refreshed = await firstValueFrom(this._userService.getUser());
                this._userStore.setUser(refreshed);
            } catch (error) {
                this._userStore.finishLoading(error as any);
            }
        }
    }

    streamUser(): Observable<UserDto | undefined> {
        return mobxStream(() => this._userStore.user);
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
