import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "nft-marketplace-title-subtitle",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./title-subtitle.component.scss"],
    template: `
        <div class="title-subtitle">
            <label *ngIf="title">{{ title }}</label
            ><span *ngIf="subtitle" class="text-description">{{ subtitle }}</span>
        </div>
    `
})
export class TitleSubtitleComponent {
    @Input() title: string | undefined;
    @Input() subtitle: string | undefined;
}
