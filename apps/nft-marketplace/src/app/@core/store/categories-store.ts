import { CategoryDto } from "@swan/dto";
import { action, computed, observable } from "mobx-angular";
import { Injectable } from "@angular/core";
import { SupportService } from "../services/support/support.service";
import { ComplexState } from "./complex-state";
import { StateStore } from "./state-store";
import { makeObservable, runInAction } from "mobx";

@Injectable({ providedIn: "root" })
export class CategoriesStore implements StateStore {
    @observable
    categoriesState: ComplexState<Array<CategoryDto>>;

    constructor(private _supportService: SupportService) {
        this.categoriesState = new ComplexState<Array<CategoryDto>>();
        makeObservable(this);
        this.fetchCategories();
    }

    @computed
    get isLoading(): boolean {
        return this.categoriesState.isLoading;
    }

    @computed
    get categories(): Array<CategoryDto> {
        return this.categoriesState.hasState ? this.categoriesState.state.slice(0) : [];
    }

    @action
    fetchCategories() {
        this.categoriesState = ComplexState.fromLoading();
        this._supportService.getCategories().subscribe((categories) => {
            runInAction(() => {
                this.categoriesState = ComplexState.fromSuccess(categories);
            });
        });
    }
}
