import { Injectable } from "@nestjs/common";
import { CategoryDto } from "@nft-marketplace/common";
import { CategoryViewRepository } from "../views/categories/category-view-repository";
import { LogAsyncMethod } from "../infrastructure/logging";

@Injectable()
export class SystemQueryHandler {
    constructor(private _repository: CategoryViewRepository) {}

    @LogAsyncMethod
    async getCategories(): Promise<Array<CategoryDto>> {
        const views = await this._repository.findAll();
        return views.map((view) => {
            return new CategoryDto(view.name, view.imageUrl, view.id);
        });
    }
}
