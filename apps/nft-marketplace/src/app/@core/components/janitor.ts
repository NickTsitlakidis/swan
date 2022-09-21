import { Injectable, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

@Injectable()
export abstract class Janitor implements OnDestroy {
    private _subscriptions: Array<Subscription>;

    protected constructor() {
        this._subscriptions = [];
    }

    protected addSubscription(subscription: Subscription) {
        this._subscriptions.push(subscription);
    }

    ngOnDestroy(): void {
        this._subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
