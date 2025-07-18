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

describe("Chapter 5: API Tests", () => {
  test("Should update a book and return a 204-status code", async () => {
    const updatedBook = {
      title: "The Fellowship of the Ring - Revised",
      author: "J.R.R. Tolkien"
    };

    const response = await request(app)
      .put("/api/books/1")
      .send(updatedBook);

    expect(response.status).toBe(204);
  });

  test("Should return a 400-status code when using a non-numeric id", async () => {
    const updatedBook = {
      title: "Invalid Update",
      author: "Someone"
    };

    const response = await request(app)
      .put("/api/books/foo")
      .send(updatedBook);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Input must be a number");
  });

  test("Should return a 400-status code when updating a book with a missing title", async () => {
    const incompleteBook = {
      author: "J.R.R. Tolkien"
    };

    const response = await request(app)
      .put("/api/books/1")
      .send(incompleteBook);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Book title is required.");
  });
});

describe("Chapter 6: API Tests", () => {
  test("It should log a user in and return a 200-status with 'Authentication successful' message", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "harry@hogwarts.edu", password: "potter" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Authentication successful" });
  });

  test("It should return a 401-status code with 'Unauthorized' message when logging in with incorrect credentials", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "harry@hogwarts.edu", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  test("It should return a 400-status code with 'Bad Request' when missing email or password", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "harry@hogwarts.edu" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Bad Request" });
  });
});

describe("Chapter 7: API Tests", () => {
  test("It should return a 200 status with 'Security questions successfully answered' message", async () => {
    const response = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send({
        securityQuestions: [
          { question: "What is your pet's name?", answer: "Hedwig" },
          { question: "What is your favorite book?", answer: "Quidditch Through the Ages" },
          { question: "What is your mother's maiden name?", answer: "Evans" },
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Security questions successfully answered" });
  });

  test("It should return a 400 status code with 'Bad Request' message when the request body fails ajv validation", async () => {
    const response = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send({
        // Missing required 'answer' fields
        securityQuestions: [
          { question: "What is your pet's name?" }
        ]
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Bad Request" });
  });

  test("It should return a 401 status code with 'Unauthorized' message when the security questions are incorrect", async () => {
    const response = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send({
        securityQuestions: [
          { question: "What is your pet's name?", answer: "Fluffy" },
          { question: "What is your favorite book?", answer: "The Hobbit" },
          { question: "What is your mother's maiden name?", answer: "Smith" },
        ]
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});
