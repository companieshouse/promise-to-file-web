import {formatDateForDisplay} from "../../src/client/date.formatter";

describe("date formatter tests", () => {
    it("should return a formatted date for displaying when given a date", () => {
        const formattedDate: string = formatDateForDisplay("1906-11-03");
        expect(formattedDate).toEqual("3 November 1906");
    });
});
