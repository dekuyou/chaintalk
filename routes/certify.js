/**
 * certify 
 */
var crypto  = require('crypto');
var ursa    = require('ursa');
var FB      = require('fb');
var db      = require('../db/scheme');

var encoding = 'base64';

/**
 * init 
 */
exports.index = function(req, res){
    // Native側の 仮 public key を受け取る （認証用使い捨て
    var tmp_pub_key = req.body.tmp_pub_key;
    
    
    // server側の public private key を作成
    var keys = ursa.generatePrivateKey();
    
    var privPem = keys.toPrivatePem(encoding);
    var tmp_server_pri_key = ursa.createPrivateKey(privPem, '', encoding);

    
    var pubPem = keys.toPublicPem(encoding);
    var tmp_server_pub_key = ursa.createPublicKey(pubPem, encoding);


    // private key はSession に保存し、Authで利用
    req.session.key = tmp_server_pri_key;
    
    // 返却用 Server側 public key 
    var jsonKey = JSON.stringify( { 'key': tmp_server_pub_key } );
    var data = new Buffer(jsonKey, 'utf8');
    // Native側 public key で暗号化
    var encrypted = tmp_pub_key.encrypt(data, encoding);


    res.contentType('application/json');
    res.send(JSON.stringify( { 'data': encrypted.toString('utf8') } ));

};


/**
 * auth
 * <li> user_id
 * <li> sns_type
 * <li> token
 * <li> pub_key
 */
exports.auth = function(req, res){
    // Sessionから server 認証用 private key を取得
    var tmp_server_pri_key = req.session.key;
    
    var data = req.body.data;
    
    // decrypt して 中から user 情報を取り出す
    var bData = new Buffer(data, 'base64');
    var decrypted = tmp_server_pri_key.decrypt(bData, encoding);
    var params = JSON.parse(decrypted.toString('utf-8'));   

    // 
    var userId          = params.user_id;
    var snsType         = params.sns_type;
    var access_token    = params.token;
    var pubKey          = params.pub_key;
    
    
    var isAuth = false;
    
    // token の有効性を確認
    FB.setAccessToken(access_token);
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // アプリ認証あり
            
            // 存在していたら更新 なければ登録
            var userRecord = db.User.find({user_id: userId });
            console.log(userRecord);
            if (userRecord === undefined ) {
                var user = new db.User();
                user.user_id = userId;
                user.sns_type = snsType;
                user.token = access_token;
                user.pub_key = pubKey;
                user.is_master = false;
                user.created_at = new Date();
                user.save(function(err) {
                    if (err) { console.log(err); }
                });
                
            } else {
                db.user.update(
                    { _id : userRecord._id },
                    { token : access_token },
                    { pub_key : pubKey },
                    { updated_at: new Date() }
                );
                
            }
            
            // session に id を登録
            req.session.user_id = userId;
            
            isAuth = true;
            
            
        } else if (response.status === 'not_authorized') {
            // アプリの認証なし．
        } else {
            // 
        }
    });
    
    
    res.contentType('application/json');
    res.send(JSON.stringify( { 'state': isAuth } ));
    
    
};



/**
 * Login チェック
 */
exports.loginCheck = function(req, res, next) {
    if(req.session.key || req.session.user_id){
      next();
    }else{
      res.redirect('/');
    }
};




// debug -------------------------------------------------------

/**
 * debug 用アクセス
 */
exports.debug = function(req, res){
    
    // FIXME debug
    var id      = req.params.id;
    var snsType = req.params.sns_type;
    var token   = req.params.token;
    var pubKey  = req.params.pub_key;
};

