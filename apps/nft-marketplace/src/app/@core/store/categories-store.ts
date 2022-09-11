import { CategoryDto } from "@swan/dto";
import { action, makeObservable, observable } from "mobx";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CategoriesStore {
    @observable
    categories: Array<CategoryDto>;

    constructor() {
        this.categories = [];
        makeObservable(this);
    }

    @action
    setCategories(categories: Array<CategoryDto>) {
        this.categories = [...categories];
    }
}
