/**
 * Name: John Kuronya
 * Date: June 9, 2025
 * File Name: app.js
 * Description: Express app for "In-N-Out-Books" with static files and error handling.
 */

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
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


