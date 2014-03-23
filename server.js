var http = require('http');

// cloud9 settings 
var port = process.env.PORT;

if (port === undefined) {
    port = 80;   
}

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  
  var response = 'Hello Node Ninja\n' 
  　+ 'yes! its a test!!' + '\n' 
    + '' + '\n'
    + '-cloud9 support' + '\n'
    + '-auto sync ' + '\n'
    + '- set a webhooks' + '\n'
    + '日本語テスト';
  
  res.end(response);
}).listen(port);


// auto sync test


