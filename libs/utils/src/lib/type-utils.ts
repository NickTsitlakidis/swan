export function isNil(toCheck: unknown): toCheck is null | undefined {
    return toCheck === null || toCheck === undefined;
}
