
/**
 * Module dependencies.
 */

var express     = require('express');
var routes      = require('./routes');
var user        = require('./routes/user');
var http        = require('http');
var path        = require('path');
var sio         = require('socket.io');
var mongoose    = require('mongoose');
var db          = require('./db/scheme');

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// ----------------------------------------------------------------------------
//mongoose
/*
var Schema = mongoose.Schema;
var ChatTestSchema = new Schema({
  message: String,
  date: Date
});
mongoose.model('ChatTest', ChatTestSchema);
mongoose.connect('mongodb://'+ (process.env.IP || 'localhost') +'/chat_app');

var ChatTest = mongoose.model('ChatTest');
*/
db.init();
var ChatTest = db.mongoose.model('ChatTest');


// ----------------------------------------------------------------------------
//socket
var io = sio.listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('message:update', function(){
    //接続したらDBのメッセージを表示
    ChatTest.find(function(err, docs){
      socket.emit('message:open', docs);
    });
  });

  console.log('connected');

  socket.on('message:send', function (msg) {
    socket.emit('message:receive', msg);
    socket.broadcast.emit('message:receive', msg);
    //DBに登録
    var chatTest = new ChatTest();
    chatTest.message  = msg.message;
    chatTest.date = new Date();
    chatTest.save(function(err) {
      if (err) { console.log(err); }
    });
  });

  //DBにあるメッセージを削除
  socket.on('message:delete', function(){
    socket.emit('message:deleted');
    socket.broadcast.emit('message:deleted');
    ChatTest.remove(function(err) {
      if (err) { console.log(err); }
    });
  });

  socket.on('disconnect', function() {
    console.log('disconnected');
  });

});

