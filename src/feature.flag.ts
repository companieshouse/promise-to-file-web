/**
 * Feature flags will be determined by environment variables and all environment variables in nodejs are
 * either string or undefined. This function will ensure that 'false', '0', 'off' etc remain falsey
 */
export default (flag: string | undefined): boolean => {
    if (flag === undefined) {
        return false;
    }
    const featureFlag = flag.toLowerCase();
    return !(featureFlag === "false" ||
    featureFlag === "0" ||
    featureFlag === "off" ||
    featureFlag === "");

};
