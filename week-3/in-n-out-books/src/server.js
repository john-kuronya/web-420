/**
 * Name: John Kuronya
 * Date: June 9, 2025
 * File Name: server.js
 * Description: Launches the Express server for the "in-n-out-books" project.
 */

const app = require('./app'); // assumes app.js is in the same folder
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
