import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "nft-marketplace-product-card",
    templateUrl: "./product-card.component.html",
    styleUrls: ["./product-card.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
    @Input() imageUrl: string;
    @Input() productTitle: string;
    @Input() animationUrl: string | undefined;
}
