/**
 * connect
 */
var crypto  = require('crypto');
var db      = require('../db/scheme');


/**
 * index
 * <li> target_user_id
 * <li> sns_type
 */
exports.index = function(req, res){
    // Sessionから server 認証用 private key を取得
    var tmp_server_pri_key = req.session.key;
    
    var data = req.body.data;


    // decrypt して 中から user 情報を取り出す
    var iv = new Buffer(data, 'base64');
    var decipher = crypto.createCipheriv('aes192', tmp_server_pri_key, iv);
    var params = JSON.parse(decipher.final('utf-8'));   // FIXME utf-8 の必要ある？
    
    var targetUserId    = params.target_user_id;
    var snsType         = params.sns_type;
    

    var userRecord  = db.User.find({user_id: targetUserId });
    console.log(userRecord);
    if (userRecord !== undefined ) {
        /* ---------------------------------------
         * target が存在したら、pubkey を返却する
         *  対象の会話が暗号化される旨の通知
         */
         
        var pubKey      = userRecord.pub_key;
        
        
    } else {
        /* ---------------------------------------
         * taget が存在しない場合、 
         *  Client側から対象SNSへアプリとメッセージがあることの通知
         *  対象の会話は暗号化されない旨の通知
         *  target がアプリを利用すれば暗号化した状態での会話ができる旨の通知
         *
         */
        
    }

    
    


    
    
    
    
};
