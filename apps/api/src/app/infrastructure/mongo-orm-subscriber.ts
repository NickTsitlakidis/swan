import { EventSubscriber, FlushEventArgs } from "@mikro-orm/core";
import { isNil, isObject, isObjectLike, keys } from "lodash";

export class MongoOrmSubscriber implements EventSubscriber {
    /**
     * A hook that will be called before an entity is saved in the database. We use this to check for any properties (
     * top level or nested) which might be undefined or null. If such properties are found, then we delete them to make
     * sure that no null or undefined values exist in mongo documents.
     * @param args
     */
    async beforeFlush(args: FlushEventArgs): Promise<void> {
        args.uow.getPersistStack().forEach((entry) => {
            keys(entry).forEach((key) => {
                if (isNil(entry[key])) {
                    delete entry[key];
                } else {
                    if (isObject(entry[key]) || isObjectLike(entry[key])) {
                        keys(entry[key]).forEach((nestedKey) => {
                            if (isNil(entry[key][nestedKey])) {
                                delete entry[key][nestedKey];
                            }
                        });
                    }
                }
            });
        });
    }
}
