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

describe("Chapter 4: API Tests", () => {
  test("Should return a 201-status code when adding a new book", async () => {
    const newBook = {
      id: 6,
      title: "The Silmarillion",
      author: "J.R.R. Tolkien"
    };

    const response = await request(app)
      .post("/api/books")
      .send(newBook);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", 6);
    expect(response.body).toHaveProperty("title", "The Silmarillion");
  });

  test("Should return a 400-status code when adding a new book with missing title", async () => {
    const incompleteBook = {
      id: 7,
      author: "Anonymous"
    };

    const response = await request(app)
      .post("/api/books")
      .send(incompleteBook);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Book title is required.");
  });

  test("Should return a 204-status code when deleting a book", async () => {
    const response = await request(app).delete("/api/books/6");
    expect(response.status).toBe(204);
  });
});