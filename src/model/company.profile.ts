export interface ExtensionsCompanyProfile {
    companyName: string;
    companyNumber: string;
    companyStatus: string;
    companyType: string;
    address: {
        line_1: string;
        line_2: string;
        postCode: string;
    };
    accountsDue: string;
    accountingPeriodStartOn: string;
    accountingPeriodEndOn: string;
    accountsStatus: string;
    csDue: string;
    csStatus: string;
    incorporationDate: string;
    ptfRequested: string;
}
