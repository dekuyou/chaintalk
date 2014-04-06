/**
 * certify 
 */
 var crypto             = require('crypto');
 var passport           = require('passport');
 var facebookStrategy   = require('passport-facebook').Strategy;

 var db         = require('../db/scheme');


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
    var hmac = crypto.createHmac('aes192', tmp_server_pri_key);
    hmac.update(JSON.stringify( { 'key': tmp_server_pub_key } ));

    res.send(JSON.stringify( { 'data': hmac.digest('base64') } ));

};


/**
 * auth
 */
exports.auth = function(req, res){
    // Sessionから server 認証用 private key を取得
    var tmp_server_pri_key = req.session.key;
    
    // decrypt して 中から user 情報を取り出す
    var iv = new Buffer(req.body.data, 'base64');
    var decipher = crypto.createCipheriv('aes192', tmp_server_pri_key, iv);
    var params = JSON.parse(decipher.final('utf-8'));   // FIXME utf-8 の必要ある？

    // 
    var id      = params.id;
    var snsType = params.sns_type;
    var token   = params.token;
    var pubKey  = params.pub_key;
    
    // token の有効性を確認
    
    
    // 存在していたら更新 なければ登録
    
    
    
    
};


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


/**
 * Login チェック
 */
exports.loginCheck = function(req, res, next) {
    if(req.session.key){
      next();
    }else{
      res.redirect('/');
    }
};
