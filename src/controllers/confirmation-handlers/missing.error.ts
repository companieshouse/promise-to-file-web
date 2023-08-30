export const createMissingError = (item: string): Error => {
    const errMsg: string = item + " missing from session";
    return new Error(errMsg);
};

export default createMissingError;
