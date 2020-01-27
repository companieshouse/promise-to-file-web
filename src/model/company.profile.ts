export interface PTFCompanyProfile {
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
    isAccountsOverdue: boolean;
    isCSOverdue: boolean;
    csDue: string;
    incorporationDate: string;
    ptfRequested: string;
}
