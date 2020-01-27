import * as keys from "../src/session/keys";
import {loadSession} from "../src/services/redis.service";
import Session from "../src/session/session";
import {PTFCompanyProfile} from "../src/model/company.profile";

export const ACCESS_TOKEN = "KGGGUYUYJHHVK1234";

export const COMPANY_NUMBER = "00006400";
export const COMPANY_NAME = "GIRLS TRUST";
export const COMPANY_STATUS_ACTIVE = "Active";
export const COMPANY_STATUS_LIQUIDATED = "liquidated";
export const COMPANY_TYPE = "Limited";
export const COMPANY_INC_DATE = "23 September 1973";
export const LINE_1 = "123";
export const LINE_2 = "street";
export const POST_CODE = "CF1 123";
export const ACCOUNTS_NEXT_DUE_DATE = "2020-01-12";
export const CS_DUE = "";
export const CS_STATUS = "";
export const PTF_REQUESTED = "";
export const EMAIL = "demo@ch.gov.uk";

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

export const fullDummySession = () => {
  let session = Session.newWithCookieId("cookie");
  session.data = {
    [keys.SIGN_IN_INFO]: {
      [keys.SIGNED_IN]: 1,
      [keys.ACCESS_TOKEN]: {
        [keys.ACCESS_TOKEN]: ACCESS_TOKEN,
      },
      [keys.USER_PROFILE]: {
        [keys.USER_ID]: "123",
      },
      [keys.USER_PROFILE]: {
        email: EMAIL,
      }
    },
    [keys.EXTENSION_SESSION]: {
      [keys.COMPANY_IN_CONTEXT]: "00006400",
      [keys.PTF_REQUESTS]: [{
        [keys.COMPANY_NUMBER]: "00006400",
        "ptf_request_id": "request1",
        "reason_in_context_string": "reason1",
      }],
    },
    [keys.PAGE_HISTORY]: {
      page_history: [],
    },
  };
  return session;
};

export const getDummyCompanyProfile = (accountsOverdue: boolean, csOverdue: boolean, isActive): PTFCompanyProfile => {
  return {
    accountingPeriodEndOn: ACCOUNTS_NEXT_DUE_DATE,
    accountingPeriodStartOn: ACCOUNTS_NEXT_DUE_DATE,
    accountsDue: ACCOUNTS_NEXT_DUE_DATE,
    address: {
      line_1: LINE_1,
      line_2: LINE_2,
      postCode: POST_CODE,
    },
    companyName: COMPANY_NAME,
    companyNumber: COMPANY_NUMBER,
    companyStatus: isActive ? COMPANY_STATUS_ACTIVE : COMPANY_STATUS_LIQUIDATED,
    companyType: COMPANY_TYPE,
    csDue: CS_DUE,
    incorporationDate: COMPANY_INC_DATE,
    isAccountsOverdue: accountsOverdue,
    isCSOverdue: csOverdue,
    ptfRequested: PTF_REQUESTED,
  }
};
