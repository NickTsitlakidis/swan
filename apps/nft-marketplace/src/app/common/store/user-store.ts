import { Injectable } from "@angular/core";
import { makeObservable, runInAction } from "mobx";
import {
    CompleteSignatureAuthenticationDto,
    ProfileNftDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    UserDto,
    WalletDto
} from "@swan/dto";
import { ComplexState } from "./complex-state";
import { UserService } from "../services/user/user.service";
import { WalletService } from "../services/chains/wallet-service";
import { switchMap } from "rxjs";
import { StateStore } from "./state-store";
import { action, computed, observable } from "mobx-angular";

@Injectable({ providedIn: "root" })
export class UserStore implements StateStore {
    @observable
    tokenState: ComplexState<TokenDto>;

    @observable
    userState: ComplexState<UserDto>;

    @observable
    nft: ComplexState<Array<ProfileNftDto>>;

    constructor(private readonly _userService: UserService) {
        this.tokenState = new ComplexState<TokenDto>();
        this.userState = new ComplexState<UserDto>();
        this.nft = new ComplexState<Array<ProfileNftDto>>();
        makeObservable(this);
    }

    @action
    authenticateWithSignature(wallet: WalletDto, address: string, walletService: WalletService) {
        this.tokenState = ComplexState.fromLoading();
        const body = new StartSignatureAuthenticationDto();
        body.address = address;
        body.blockchainId = wallet.blockchainId;
        body.walletId = wallet.id;
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
        this.tokenState = ComplexState.fromLoading();
        this._userService.refreshToken().subscribe({
            next: (refreshedToken) => {
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
}
