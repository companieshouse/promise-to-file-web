import app from "../../src/app";
import * as request from "supertest";

describe("Basic URL Tests", () => {

  it("should find start page", async () => {
    const response = await request(app)
      .get("/promise-to-file");

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/Use this service to stop us from removing a company/);
  });

  it("should find company number page", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/What is the company number/);
  });

  it("should return 404 if page doesn't exist", async() => {
    const response = await request(app)
      .get("/gibberish");

    expect(response.status).toEqual(404);
    expect(response.text).toMatch(/Sorry, there is a problem with the service/);
  });
});
