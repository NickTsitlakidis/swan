import { Injectable } from "@angular/core";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import {
    CompleteSignatureAuthenticationDto,
    ProfileNftDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    UserDto
} from "@swan/dto";
import { ComplexState } from "./complex-state";
import { LocalStorageService } from "ngx-webstorage";
import { UserService } from "../services/user/user.service";
import { WalletService } from "../services/chains/wallet-service";
import { switchMap } from "rxjs";
import { isNil } from "lodash";
import { DateTime } from "luxon";
import { StateStore } from "./state-store";

@Injectable({ providedIn: "root" })
export class UserStore implements StateStore {
    @observable
    tokenState: ComplexState<TokenDto>;

    @observable
    userState: ComplexState<UserDto>;

    @observable
    nft: ComplexState<Array<ProfileNftDto>>;

    constructor(private readonly _storageService: LocalStorageService, private readonly _userService: UserService) {
        this.tokenState = new ComplexState<TokenDto>();
        this.userState = new ComplexState<UserDto>();
        this.nft = new ComplexState<Array<ProfileNftDto>>();
        makeObservable(this);
        const existingToken = this.readTokenFromStorage();
        if (existingToken) {
            this.tokenState = ComplexState.fromSuccess(existingToken);
        }
    }

    @action
    authenticateWithSignature(body: StartSignatureAuthenticationDto, walletService: WalletService) {
        this.tokenState = ComplexState.fromLoading();
        this._userService
            .startSignatureAuthentication(body)
            .pipe(
                switchMap((nonce) => walletService.signMessage(nonce.nonce)),
                switchMap((signature) => {
                    const completeBody = new CompleteSignatureAuthenticationDto();
                    completeBody.signature = signature;
                    completeBody.blockchainId = body.blockchainId;
                    completeBody.address = body.address;
                    return this._userService.completeSignatureAuthentication(completeBody);
                })
            )
            .subscribe({
                next: (token) => {
                    this.saveTokenToStorage(token);
                    runInAction(() => {
                        this.tokenState = ComplexState.fromSuccess(token);
                    });
                    this.refreshUser();
                },
                error: (error) => {
                    runInAction(() => {
                        this.tokenState = ComplexState.fromError(error);
                    });
                }
            });
    }

    @action
    refreshUser() {
        if (!this.tokenState.hasState) {
            return;
        }

        this.userState = ComplexState.fromLoading();
        this._userService.getUser().subscribe({
            next: (user) => {
                runInAction(() => {
                    this.userState = ComplexState.fromSuccess(user);
                });
            },
            error: (error) => {
                runInAction(() => {
                    this.userState = ComplexState.fromError(error);
                });
            }
        });
    }

    @action
    addWallet(body: StartSignatureAuthenticationDto, walletService: WalletService) {
        this.userState = ComplexState.fromLoading();
        this._userService
            .startWalletAddition(body)
            .pipe(
                switchMap((nonce) => walletService.signMessage(nonce.nonce)),
                switchMap((signature) => {
                    const completeBody = new CompleteSignatureAuthenticationDto();
                    completeBody.signature = signature;
                    completeBody.blockchainId = body.blockchainId;
                    completeBody.address = body.address;
                    return this._userService.completeWalletAddition(completeBody);
                })
            )
            .subscribe({
                next: () => {
                    this.refreshUser();
                },
                error: () => {
                    this.refreshUser();
                }
            });
    }

    @action
    refreshToken() {
        const tokenValue = this.tokenState.state.refreshToken;
        this.tokenState = ComplexState.fromLoading();
        if (isNil(tokenValue)) {
            const e = new Error("Refresh token should always exist for user tokens");
            this.tokenState = ComplexState.fromError(e);
        } else {
            this._userService.refreshToken(tokenValue).subscribe({
                next: (refreshedToken) => {
                    this.saveTokenToStorage(refreshedToken);
                    runInAction(() => {
                        this.tokenState = ComplexState.fromSuccess(refreshedToken);
                    });
                },
                error: (error) => {
                    runInAction(() => {
                        this.tokenState = ComplexState.fromError(error);
                    });
                }
            });
        }
    }

    @action
    deleteToken() {
        this.tokenState = new ComplexState<TokenDto>();
    }

    @action
    addSwanNft(nft: ComplexState<Array<ProfileNftDto>>) {
        this.nft = nft;
    }

    @action
    addExternalNft(nft: ComplexState<Array<ProfileNftDto>>) {
        if (!nft.error) {
            if (!this.nft.error) {
                const finalArray = this.nft.state.slice(0).concat(nft.state);
                this.nft = ComplexState.fromSuccess(finalArray);
            }
        }
    }

    @computed
    get isLoading(): boolean {
        return this.userState.isLoading || this.tokenState.isLoading;
    }

    @computed
    get token(): TokenDto | undefined {
        return this.tokenState.state;
    }

    @computed
    get user(): UserDto | undefined {
        return this.userState.state;
    }

    private saveTokenToStorage(token: TokenDto) {
        this._storageService.store("userTokenValue", token.tokenValue);
        this._storageService.store("userExpiresAt", token.expiresAt.toISO());
        this._storageService.store("userRefreshToken", token.refreshToken);
    }

    private readTokenFromStorage(): TokenDto | undefined {
        const userToken = this._storageService.retrieve("userTokenValue");
        const expiresAt = this._storageService.retrieve("userExpiresAt");
        const refreshToken = this._storageService.retrieve("userRefreshToken");

        if (!isNil(userToken) && !isNil(expiresAt) && !isNil(refreshToken)) {
            return new TokenDto(userToken, DateTime.fromISO(expiresAt), refreshToken);
        }

        return undefined;
    }
}
