import app from '../../app';
import * as request from 'supertest';

describe("Basic URL Tests", () => {

  it("should find start page", async () => {
    const response = await request(app)
      .get("/promise-to-file");
    expect(response.status).toEqual(200);
  });

  it("should find company number page", async () => {
    const response = await request(app)
      .get("/promise-to-file/company-number")
      .set("Referer", "/")
     expect(response.status).toEqual(200);
  });

  it("should return 404 if page doesn't exist", async() => {
    const response = await request(app)
      .get("/gibberish");
    expect(response.status).toEqual(404);
  });
});
