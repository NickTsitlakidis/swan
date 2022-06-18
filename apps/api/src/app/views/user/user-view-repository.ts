import { Injectable } from "@nestjs/common";
import { UserView } from "./user-view";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class UserViewRepository {
    constructor(private _entityManager: EntityManager) {}

    findById(id: string): Promise<UserView | null> {
        return this._entityManager.fork().findOne(UserView, { id: id });
    }

    save(view: UserView): Promise<UserView> {
        return this._entityManager.persistAndFlush(view).then(() => view);
    }
}
