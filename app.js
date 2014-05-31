
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
var store  = new MongoStore({
        db: 'session',
        host: 'localhost',
        clear_interval: 30 * 60
    });
var connect     = require('connect');
var i18next     = require('i18next');
var cookie_      = require('cookie');

var db          = require('./db/scheme');
var certify     = require('./routes/certify');
var connection  = require('./routes/connection');

// test
var crypto_  = require('./routes/crypto_');


var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('secretKey', 'com.node-ninja.c.chain-talk');    //セッションの署名に使われるキー
app.set('cookieSessionKey', 'sid');         //cookieにexpressのsessionIDを保存する際のキー
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
// app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser()); 
app.use(express.session({
    key: app.get('cookieSessionKey'),
    secret: app.get('secretKey'),
    store: store,
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 30 * 60 * 1000)
    }
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18next.handle);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}




// routing --------


app.get('/', routes.index);
app.get('/users', user.list);
app.get('/crypto', crypto_.index);

// -----------------------------------------------------------------------------
app.get('/certify/debug/:id/:sns_type/:token/:pub_key', certify.index);
app.post('/certify/index', certify.index);
app.post('/certify/auth', certify.loginCheck, certify.auth);
app.post('/connect/index', certify.loginCheck, connection.index);



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



io.configure(function () {
    io.set('authorization', function (handshakeData, callback) {
        if(handshakeData.headers.cookie) {
            
            //cookieを取得
            var cookie = cookie_.parse(decodeURIComponent(handshakeData.headers.cookie));
            cookie = connect.utils.parseSignedCookies(cookie,app.get('secretKey'));
            var sessionID = cookie[app.get('cookieSessionKey')];
            handshakeData.sessionID = sessionID;
    
            console.log('[authorization]Express   sessionID: ', sessionID);
            console.log('[authorization]handshakeData : ', handshakeData);
            
            store.load(sessionID, function (err, session) {
                console.log('[authorization]store.get session: ', session);
                console.log('[authorization]store.get err: ', err);
                
                if (err) {
                    callback(err.message, false);
                } else {
                    handshakeData.session = session;
                }
            });
    
        } else {
            return callback('Cookie が見つかりませんでした', false);
        }
        // 認証 OK
        callback(null, true);
    });
});

io.sockets.on('connection', function (socket) {
    console.log('[connection]sessionID: ', socket.handshake.sessionID + ' connected!');
    var sessionTuchIntervalID = setInterval(function () {
        socket.handshake.session.reload( function () { 
            console.log('[connection]session tuch: ' + socket.handshake.sessionID );
            socket.handshake.session.touch().save();
        });
    }, 60 * 1000);
  
  
  
    socket.on('disconnect', function() {
        console.log('[connection]disconnected');
        clearInterval(sessionTuchIntervalID);
    });
    
    
    
  // test ------------------------------------
  socket.on('message:update', function(){
    //接続したらDBのメッセージを表示
    ChatTest.find(function(err, docs){
      socket.emit('message:open', docs);
    });
  });

  console.log('connected');

  socket.on('message:send', function (msg) {
    msg.id = socket.id;
    socket.emit('message:receive', msg);
    socket.broadcast.emit('message:receive', msg);
    //DBに登録
    var chatTest = new ChatTest();
    chatTest.id = socket.id;
    chatTest.message  = msg.message;
    chatTest.date = new Date();
    chatTest.save(function(err) {
      if (err) { console.log(err); }
    });
  });
  socket.on('message:input', function (msg) {
    msg.id = socket.id;
    socket.emit('message:inputting', msg);
    socket.broadcast.emit('message:inputting', msg);
  });

  //DBにあるメッセージを削除
  socket.on('message:delete', function(){
    socket.emit('message:deleted');
    socket.broadcast.emit('message:deleted');
    ChatTest.remove(function(err) {
      if (err) { console.log(err); }
    });
  });


});

