/**
 * certify 
 */
var crypto  = require('crypto');
var FB      = require('fb');
var db      = require('../db/scheme');


/**
 * init 
 */
exports.index = function(req, res){
    // Native側の 仮 public key を受け取る （認証用使い捨て
    var tmp_pub_key = req.body.tmp_pub_key;
    
    
    // server側の public private key を作成
    var tmp_server_key = crypto.getDiffieHellman('modp5');  // (defined in RFC 2412)
    var tmp_server_pub_key = tmp_server_key.generateKeys('hex');
    var tmp_server_pri_key = tmp_server_key.getPrivateKey('hex');
    
    // private key はSession に保存し、Authで利用
    req.session.key = tmp_server_pri_key;
    
    // public key は Nativeからもらった public key で encrypt して返却
    var hmac = crypto.createHmac('aes192', tmp_pub_key);
    hmac.update(JSON.stringify( { 'key': tmp_server_pub_key } ));

    res.contentType('application/json');
    res.send(JSON.stringify( { 'data': hmac.digest('base64') } ));

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
    var iv = new Buffer(data, 'base64');
    var decipher = crypto.createCipheriv('aes192', tmp_server_pri_key, iv);
    var params = JSON.parse(decipher.final('utf-8'));   // FIXME utf-8 の必要ある？

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

