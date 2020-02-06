import {INTEGER_PARSE_BASE} from "../../properties";
import * as keys from "../keys";
import {IAccessToken, IMap, ISignInInfo, IUserProfile} from "../types";

/**
 * Generate sign in info from data map.
 *
 * This function should take the entire data from the store.
 */
export const unmarshalSignInInfo = (data: IMap<any>): ISignInInfo | null => {
  if (!data) {
    return null;
  }
  const signInInfoData = data[keys.SIGN_IN_INFO];
  if (!signInInfoData) {
    return null;
  }

  let adminPermissions = false;
  if (keys.ADMIN_PERMISSIONS in signInInfoData) {
    adminPermissions = signInInfoData[keys.ADMIN_PERMISSIONS] === "1";
  }

  let signedIn = false;
  if (keys.SIGNED_IN in signInInfoData) {
    signedIn = signInInfoData[keys.SIGNED_IN] === 1;
  }

  return {
    accessToken: unmarshalAccessToken(signInInfoData),
    adminPermissions,
    signedIn,
    userProfile: unmarshalUserProfile(signInInfoData),
  };
};

/**
 * Return the access token from data.
 *
 * @param data the entire blob of data from the store.
 */
export const unmarshalAccessToken = (data: IMap<any>): IAccessToken | undefined => {
  const accessTokenData = data[keys.ACCESS_TOKEN];
  if (!accessTokenData) {
    return undefined;
  }

  return {
    expiresIn: parseInt(accessTokenData[keys.EXPIRES_IN], INTEGER_PARSE_BASE),
    refreshToken: accessTokenData[keys.REFRESH_TOKEN],
    token: data[keys.ACCESS_TOKEN][keys.ACCESS_TOKEN],
    tokenType: accessTokenData[keys.TOKEN_TYPE],
  };
};

/**
 * Get the user profile from raw data.
 *
 * @param data the entire data blob from storage.
 */
export const unmarshalUserProfile = (data: IMap<any>): IUserProfile | undefined => {
  const userProfileData = data[keys.USER_PROFILE];
  if (!userProfileData) {
    return undefined;
  }

  const permissions: IMap<boolean> = {};

  // iterate over permissions key (if exists)
  const permissionData = userProfileData[keys.PERMISSIONS] as IMap<number>;
  if (permissionData) {
    Object.keys(permissionData).forEach((key) => {
      permissions[key] = permissionData[key] === 1;
    });
  }

  return {
    email: userProfileData[keys.EMAIL],
    forename: userProfileData[keys.FORENAME],
    id: userProfileData[keys.USER_ID],
    locale: userProfileData[keys.LOCALE],
    permissions,
    scope: userProfileData[keys.SCOPE],
    surname: userProfileData[keys.SURNAME],
  };
};
