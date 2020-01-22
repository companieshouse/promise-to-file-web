import * as keys from "../src/session/keys";
import {loadSession} from "../src/services/redis.service";
import Session from "../src/session/session";

export const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

export const loadMockSession = (mockLoadSessionFunction: jest.Mock<typeof loadSession>): void => {
  mockLoadSessionFunction.prototype.constructor.mockImplementation(async (cookieId) => {
    const session = Session.newWithCookieId(cookieId);
    session.data = {
      [keys.SIGN_IN_INFO]: {
        [keys.SIGNED_IN]: 1,
        [keys.ACCESS_TOKEN]: {
          [keys.ACCESS_TOKEN]: ACCESS_TOKEN,
        },
        [keys.USER_PROFILE]: {
          [keys.USER_ID]: "123",
        },
      }
    };
    return session;
  });
};