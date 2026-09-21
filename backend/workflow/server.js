const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4242;
const FILE = path.join(__dirname, 'index.html');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(FILE).pipe(res);
}).listen(PORT, () => console.log(`Workflow: http://localhost:${PORT}`));
