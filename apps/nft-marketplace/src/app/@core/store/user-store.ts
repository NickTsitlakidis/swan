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

@Injectable({ providedIn: "root" })
export class UserStore {
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
        })

    }

    @action
    deleteToken() {
        this.tokenState = new ComplexState<TokenDto>();
    }

    @action
    setUser(user: ComplexState<UserDto>) {
        this.user = user;
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
        return this.user.isLoading || this.tokenState.isLoading;
    }

    private saveTokenToStorage(token: TokenDto) {
        this._storageService.store("userTokenValue", token.tokenValue);
        this._storageService.store("userExpiresAt", token.expiresAt.toISO());
        this._storageService.store("userRefreshToken", token.refreshToken);
    }
}
