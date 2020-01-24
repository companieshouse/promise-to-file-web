import moment = require("moment");

const DISPLAY_DATE_FORMAT: string = "D MMMM YYYY";
const REASON_DATE_FORMAT: string = "YYYY-MM-DD";

export const formatDateForDisplay = (inputDate: string): string => {
    return moment(inputDate).format(DISPLAY_DATE_FORMAT);
};

export const formatDateForReason = (day: string, month: string, year: string): string => {
    return moment(`${day}-${month}-${year}`, "DD-MM-YYYY").format(REASON_DATE_FORMAT);
};
