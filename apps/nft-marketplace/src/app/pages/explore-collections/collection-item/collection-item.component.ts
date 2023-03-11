import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { CollectionDto } from "@swan/dto";
import { isNil } from "@nft-marketplace/utils";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "swan-collection-item",
    templateUrl: "./collection-item.component.html",
    styleUrls: ["./collection-item.component.scss"]
})
export class CollectionItemComponent {
    @Output()
    selected: EventEmitter<CollectionDto> = new EventEmitter();

    private _collection: CollectionDto;

    @Input()
    set collection(collection: CollectionDto) {
        this._collection = collection;
    }

    get collection(): CollectionDto {
        return this._collection;
    }

    get paymentTokenClassName(): string {
        if (isNil(this._collection) || isNil(this.collection.paymentTokenSymbol)) {
            return "";
        }

        return `cf-${this._collection.paymentTokenSymbol.toLowerCase()}`;
    }

    onClick() {
        this.selected.emit(this._collection);
    }
}
