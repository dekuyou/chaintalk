var express = require('express'),
    app = express();

app.use(express.logger());

// cloud9 settings 
var port = process.env.PORT;

if (port === undefined) {
    port = 80;   
}


app.get('/', function(req, res){
    
    var response = '<h1>Hello Node Ninja in Express</h1>' 
  　    + 'yes! its a test!!' 
        + '<ul>' 
        + '<li>cloud9 support</li>'
        + '<li>auto sync</li>'
        + '<li>set a webhooks</li>'
        + '<li>日本語テスト</li>'
        + '</ul>';
    
    res.send(response);
});

app.listen(port);
console.log('Express server started on port %s', process.env.PORT);

// auto sync test


