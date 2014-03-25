
/**
 * Module dependencies.
 */

var express     = require('express');
var routes      = require('./routes');
var user        = require('./routes/user');
var http        = require('http');
var path        = require('path');
var sio         = require('socket.io');
var MongoStore  = require('connect-mongo')(express);

var db          = require('./db/scheme');
var certify     = require('./routes/certify');


var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser()); //追加
app.use(express.session({
    secret: 'secret',
    store: new MongoStore({
        db: 'session',
        host: 'localhost',
        clear_interval: 30 * 60
    }),
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 30 * 60 * 1000)
    }
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var loginCheck = function(req, res, next) {
    if(req.session.key){
      next();
    }else{
      res.redirect('/');
    }
};

// routing --------


app.get('/', routes.index);
app.get('/users', user.list);

// -----------------------------------------------------------------------------
app.get('/certify/debug/:id/:sns_type/:token/:pub_key', certify.index);
app.post('/certify/index', certify.index);
app.post('/certify/auth', loginCheck, certify.auth);



// -----------------------------------------------------------------------------


var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// ----------------------------------------------------------------------------
//mongoose

var ChatTest = db.ChatTest;


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

