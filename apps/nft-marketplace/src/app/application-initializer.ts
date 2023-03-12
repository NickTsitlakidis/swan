import { ClientStore } from "./common/store/client-store";
import { when } from "mobx";
import { PlatformUtils } from "./common/utils/platform-utils";
import { UserStore } from "./common/store/user-store";
import { Observable, Subject } from "rxjs";

/*
For some reason, SSR is breaking the initialization : Guard logic is running before the initialization is completed.
So we have this subject to notify guards about the initialization status and the guards are waiting before making a decision
about a route.
 */
const applicationStatusStream: Subject<boolean> = new Subject<boolean>();

export function initializeSwan(
    store: ClientStore,
    platformUtils: PlatformUtils,
    userStore: UserStore
): () => Promise<unknown> {
    return () => {
        store.fetchToken();
        return when(() => !store.isLoading).finally(() => {
            if (platformUtils.isBrowser) {
                userStore.refreshUser();
                return when(() => !userStore.isLoading).finally(() => {
                    applicationStatusStream.next(true);
                    return Promise.resolve({});
                });
            }
            applicationStatusStream.next(true);
            return Promise.resolve({});
        });
    };
}

export function getApplicationStatus(): Observable<boolean> {
    return applicationStatusStream.asObservable();
}
