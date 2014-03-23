var http = require('http');

var port = process.env.PORT;

if (port === undefined) {
    port = 80;   
}

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  var response = 'Hello Node Ninja\n' + 'yes! its a test!!' + '<br>' 
    + '<ui>'
    + '<li>cloud9 support'
    + '<li>auto sync ' 
    + '<li> set a webhooks'
    + '</ui>';
  
  res.end(response);
}).listen(port);


// auto sync test


