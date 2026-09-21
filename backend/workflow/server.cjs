const http = require('http');
const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(FILE).pipe(res);
}).listen(4242, () => console.log('Workflow: http://localhost:4242'));
