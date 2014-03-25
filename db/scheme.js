module.exports.mongoose            = require('mongoose');
module.exports.Schema;


/**
 * DB 初期化
 * ここにcollectionを書いていく
 */
exports.init = function(){
    
    
    this.Schema = this.mongoose.Schema;

    // ChatTest collection for test -------------------------------------------
    var ChatTestSchema = new this.Schema({
      message: String,
      date: Date
    });
    this.mongoose.model('ChatTest', ChatTestSchema);
    
    // User collection -------------------------------------------------------
    var UserSchema = new this.Schema({
      user_id:  String,
      sns_type: Number,
      pub_key: String,
      created_at: Date
    });
    this.mongoose.model('User', UserSchema);
    
    // Messages collection ----------------------------------------------------
    var MessageSchema = new this.Schema({
       user_id: String,
       message: String,
       geolocation: String,
       created_at: Date
    });
    this.mongoose.model('Message', MessageSchema);

    
    
    
    this.mongoose.connect('mongodb://'+ (process.env.IP || 'localhost') +'/chat_app');
    
    
    
};

