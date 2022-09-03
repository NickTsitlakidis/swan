import { Injectable } from "@angular/core";
import { SupportService } from "../services/support/support.service";
import { Observable, switchMap } from "rxjs";
import { mobxStream } from "./stream-utils";
import { CategoryDto } from "@swan/dto";
import { CategoriesStore } from "./categories-store";

@Injectable({ providedIn: "root" })
export class CategoriesFacade {
    constructor(private _store: CategoriesStore, private _supportService: SupportService) {}

    streamCategories(): Observable<Array<CategoryDto>> {
        const observable = mobxStream(() => this._store.categories);

        if (this._store.categories.length === 0) {
            return this._supportService.getCategories().pipe(
                switchMap((categories) => {
                    this._store.setCategories(categories);
                    return observable;
                })
            );
        }

        return observable;
    }
}
