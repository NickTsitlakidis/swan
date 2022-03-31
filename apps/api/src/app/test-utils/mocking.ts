export function getMockCalledParameters(spy, length = 1, callNumber = 1): Array<any> {
    const toReturn = [];
    for (let i = 0; i < length; i++) {
        toReturn.push((spy.mock.calls[callNumber - 1] as Array<any>)[i]);
    }

    return toReturn;
}

export function getThrower() {
    return () => {
        throw "should never be called";
    };
}
