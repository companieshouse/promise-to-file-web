import { unmarshalAccessToken, unmarshalSignInInfo, unmarshalUserProfile } from "../../src/session/store/util";
import { IAccessToken, IMap, ISignInInfo, IUserProfile } from "../../src/session/types";

const DUMMY_TOKEN = {
  access_token: "token",
  expires_in: "123",
  refresh_token: "refresh",
  token_type: "type",
};

const DUMMY_PROFILE = {
  email: "1@1.com",
  forename: "jane",
  id: "1234",
  locale: "en",
  permissions: {
    permissionKey: 1,
  },
  scope: "scope",
  surname: "doe",
};

describe("Session util tests", () => {

  describe("unmarshal access token tests", () => {

    it("should unmarshal an access token from session data", () => {
      const unmarshalledAccessToken = unmarshalAccessToken({access_token: DUMMY_TOKEN}) || {} as IAccessToken;
      expect(unmarshalledAccessToken.token).toEqual(DUMMY_TOKEN.access_token);
      expect(unmarshalledAccessToken.expiresIn).toEqual(parseInt(DUMMY_TOKEN.expires_in, 10));
      expect(unmarshalledAccessToken.refreshToken).toEqual(DUMMY_TOKEN.refresh_token);
      expect(unmarshalledAccessToken.tokenType).toEqual(DUMMY_TOKEN.token_type);
    });

    it("should return undefined if no access token present", async () => {
      const unmarshalledAccessToken = await unmarshalAccessToken({});
      expect(unmarshalledAccessToken).toBeUndefined();
    });
  });

  describe("unmarshal user profile tests", () => {

    it("should unmarshal user profile from session data", () => {
      const unmarshalledProfile = unmarshalUserProfile({user_profile: DUMMY_PROFILE}) || {} as IUserProfile;
      expect(unmarshalledProfile.email).toEqual(DUMMY_PROFILE.email);
      expect(unmarshalledProfile.forename).toEqual(DUMMY_PROFILE.forename);
      expect(unmarshalledProfile.id).toEqual(DUMMY_PROFILE.id);
      expect(unmarshalledProfile.locale).toEqual(DUMMY_PROFILE.locale);
      expect(unmarshalledProfile.permissions).toEqual({permissionKey: true});
      expect(unmarshalledProfile.surname).toEqual(DUMMY_PROFILE.surname);
      expect(unmarshalledProfile.scope).toEqual(DUMMY_PROFILE.scope);
    });

    it("should return undefined if no userprofile present", () => {
      const unmarshalledProfile = unmarshalUserProfile({});
      expect(unmarshalledProfile).toBeUndefined();

      const unmarshalledUndefinedProfile = unmarshalUserProfile("undefined" as IUserProfile);
      expect(unmarshalledUndefinedProfile).toBeUndefined();
    });

    it("should not have permissions if no permission in session data", () => {
      const unmarshalledProfile = unmarshalUserProfile({
        user_profile: {},
      }) || {} as IUserProfile;
      expect(unmarshalledProfile).not.toBeUndefined();
      expect(unmarshalledProfile.permissions).toEqual({});
    });
  });

  describe("unmarshal signin info tests", () => {

    it("should return null if no data or signin info present", () => {
      expect(unmarshalSignInInfo(null as unknown as IMap<any>)).toBeNull();
      expect(unmarshalSignInInfo({})).toBeNull();
    });

    it("should return a ISigninInfo object if correct data in session", () => {
      const unmarshalledSigninInfo = unmarshalSignInInfo({
        signin_info: {
          access_token: DUMMY_TOKEN,
          user_profile: DUMMY_PROFILE,
        },
      }) || {} as ISignInInfo;
      expect((unmarshalledSigninInfo.accessToken as unknown as IAccessToken).token).toEqual(DUMMY_TOKEN.access_token);
      expect((unmarshalledSigninInfo.userProfile as unknown as IUserProfile).email).toEqual(DUMMY_PROFILE.email);
    });

    it("should not have admin permissions if admins permissions not set", () => {
      const unmarshalledSigninInfo = unmarshalSignInInfo({
        signin_info: {},
      }) || {} as ISignInInfo;
      expect(unmarshalledSigninInfo).toBeTruthy();
      expect(unmarshalledSigninInfo.adminPermissions).toBeFalsy();

      expect((unmarshalSignInInfo({
        signin_info: {
          admin_permissions: "0",
        },
      }) || {} as ISignInInfo).adminPermissions).toBeFalsy();
    });

    it("should have admin permissions if set", () => {
      const unmarshalledSigninInfo = unmarshalSignInInfo({
        signin_info: {
          admin_permissions: "1",
        },
      }) || {} as ISignInInfo;
      expect(unmarshalledSigninInfo).toBeTruthy();
      expect(unmarshalledSigninInfo.adminPermissions).toBeTruthy();
    });

    it("should not be signed in if signed in info is false", () => {
      const unmarshalledSigninInfo = unmarshalSignInInfo({
        signin_info: {
          signed_in: 0,
        },
      }) || {} as ISignInInfo;
      expect(unmarshalledSigninInfo).toBeTruthy();
      expect(unmarshalledSigninInfo.signedIn).toEqual(false);
    });

    it("should be signed in if signed in info is true", () => {
      const unmarshalledSigninInfo = unmarshalSignInInfo({
        signin_info: {
          signed_in: 1,
        },
      }) || {} as ISignInInfo;
      expect(unmarshalledSigninInfo).toBeTruthy();
      expect(unmarshalledSigninInfo.signedIn).toEqual(true);
    });
  });
});
