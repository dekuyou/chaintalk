var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  var response = 'Hello Node Ninja\n' + 'yes! its a test!!';
  
  res.end(response);
}).listen(80);

