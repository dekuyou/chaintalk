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
    var userId = req.session.user_id;

    var userRecord  = db.User.find({user_id: userId });
    if (userRecord === undefined ) {
        return; // FIXME fail response
    }
    var pubKey      = userRecord.pub_key;

    // decrypt して 中から user 情報を取り出す
    var iv = new Buffer(req.body.data, 'base64');
    var decipher = crypto.createCipheriv('aes192', pubKey, iv);
    var params = JSON.parse(decipher.final('utf-8'));   // FIXME utf-8 の必要ある？


    
    
    
    
};
