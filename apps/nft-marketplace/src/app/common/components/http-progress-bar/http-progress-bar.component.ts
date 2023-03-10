import { ChangeDetectionStrategy, Component } from "@angular/core";
import { computed } from "mobx-angular";
import { ProgressStore } from "../../store/progress-store";

@Component({
    selector: "swan-http-progress-bar",
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./http-progress-bar.component.html",
    styleUrls: ["./http-progress-bar.component.scss"]
})
export class HttpProgressBarComponent {
    constructor(private _progressStore: ProgressStore) {}

    @computed
    get isInProgress(): boolean {
        return this._progressStore.isInProgress;
    }
}
