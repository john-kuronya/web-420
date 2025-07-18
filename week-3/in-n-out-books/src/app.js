/**
 * Name: John Kuronya
 * Date: June 9, 2025
 * File Name: app.js
 * Description: Express app for "In-N-Out-Books" with static files, API routes, and error handling.
 */

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const Ajv = require('ajv');
const app = express();
const books = require('../database/books');
const users = require('../database/users');

const ajv = new Ajv();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Route: Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ✅ GET all books
app.get('/api/books', async (req, res) => {
  try {
    const allBooks = await books.find();
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Input must be a number' });
    }

    const book = await books.findOne({ id });
    res.status(200).json(book);
  } catch (err) {
    if (err.message === 'No matching item found') {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST a new book
app.post('/api/books', async (req, res) => {
  try {
    const newBook = req.body;

    if (!newBook.title) {
      return res.status(400).json({ error: 'Book title is required.' });
    }

    await books.insertOne(newBook);
    res.status(201).json(newBook);
  } catch (err) {
    console.error("POST error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ PUT update book by ID
app.put('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updatedBook = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Input must be a number' });
    }

    if (!updatedBook.title) {
      return res.status(400).json({ error: 'Book title is required.' });
    }

    await books.updateOne({ id }, updatedBook);
    res.sendStatus(204);
  } catch (err) {
    if (err.message === 'No matching item found') {
      return res.status(404).json({ error: 'Book not found' });
    }
    console.error("PUT error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ DELETE a book by ID
app.delete('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await books.deleteOne({ id });
    res.sendStatus(204);
  } catch (err) {
    if (err.message === 'No matching item found') {
      return res.status(404).json({ error: 'Book not found' });
    }
    console.error("DELETE error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Bad Request' });
    }

    const user = await users.findOne({ email });
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({ message: 'Authentication successful' });
  } catch (err) {
    if (err.message === 'No matching item found') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error("LOGIN error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST verify security questions
const securityQuestionsSchema = {
  type: "object",
  properties: {
    securityQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" }
        },
        required: ["question", "answer"],
        additionalProperties: false
      }
    }
  },
  required: ["securityQuestions"],
  additionalProperties: false
};

app.post("/api/users/:email/verify-security-question", async (req, res) => {
  try {
    const validate = ajv.compile(securityQuestionsSchema);
    const isValid = validate(req.body);

    if (!isValid) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const { email } = req.params;
    const { securityQuestions } = req.body;
    const user = await users.findOne({ email });

    const savedQuestions = user.securityQuestions;

    const answersMatch = savedQuestions.every((saved, index) => {
      return (
        saved.question === securityQuestions[index].question &&
        saved.answer === securityQuestions[index].answer
      );
    });

    if (!answersMatch) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ message: "Security questions successfully answered" });
  } catch (err) {
    if (err.message === "No matching item found") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 404 Middleware
app.use((req, res, next) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

// 500 Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(req.app.get('env') === 'development' && { stack: err.stack }),
  });
});

module.exports = app;







