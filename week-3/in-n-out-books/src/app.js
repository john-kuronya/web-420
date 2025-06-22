/**
 * Name: John Kuronya
 * Date: June 9, 2025
 * File Name: app.js
 * Description: Express app for "In-N-Out-Books" with static files, API routes, and error handling.
 */

const express = require('express');
const path = require('path');
const app = express();
const books = require('../database/books'); // Add this line to import the books collection

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Route: Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ✅ API: GET all books
app.get('/api/books', async (req, res) => {
  try {
    const allBooks = await books.find();
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ API: GET book by ID
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



