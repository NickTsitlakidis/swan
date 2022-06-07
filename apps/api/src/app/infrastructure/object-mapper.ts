import { instanceToPlain, plainToClass } from "class-transformer";
import { ClassConstructor } from "class-transformer/types/interfaces";

export function mapObject<T>(source, destinationClass: ClassConstructor<T>): T {
    return plainToClass(destinationClass, instanceToPlain(source));
}
