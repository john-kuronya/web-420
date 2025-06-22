const request = require("supertest");
const app = require("../src/app");

describe("Chapter 3: API Tests", () => {
  test("Should return an array of books", async () => {
    const response = await request(app).get("/api/books");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("title");
  });

  test("Should return a single book", async () => {
    const response = await request(app).get("/api/books/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("title");
  });

  test("Should return a 400 error if the id is not a number", async () => {
    const response = await request(app).get("/api/books/abc");
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Input must be a number");
  });

  test("Should return a 404 error if book is not found", async () => {
    const response = await request(app).get("/api/books/999");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Book not found");
  });
});
