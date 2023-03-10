import { ClientStore } from "./common/store/client-store";
import { when } from "mobx";

export function initializeSwan(store: ClientStore): () => Promise<unknown> {
    return () => {
        store.fetchToken();
        return when(() => !store.isLoading).finally(() => {
            return Promise.resolve({});
        });
    };
}
