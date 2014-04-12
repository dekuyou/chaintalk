/**
 * mongoose
 */
var mongoose = require('mongoose');
var url = 'mongodb://'+ (process.env.IP || 'localhost') +'/chat_app';
var db  = mongoose.createConnection(url, function(err, res){
    if(err){
        console.log('Error connected: ' + url + ' - ' + err);
    }else{
        console.log('Success connected: ' + url);
    }
});
//     this.mongoose.connect('mongodb://'+ (process.env.IP || 'localhost') +'/chat_app');


/*
 * Collections 
 */
// ChatTest collection for test -------------------------------------------
var ChatTestSchema = new mongoose.Schema({
  id: String,
  message: String,
  date: Date
});
module.exports.ChatTest = db.model('ChatTest', ChatTestSchema);




// SystemConst collection -------------------------------------------------
var SystemConstSchema = new mongoose.Schema({
   key: String,
   value: String
});
module.exports.SystemConst = db.model('SystemConst', SystemConstSchema);

// User collection -------------------------------------------------------
var UserSchema = new mongoose.Schema({
  user_id: String,
  sns_type: Number,     // 1:Facebook, 2:Twitter
  token: String,
  pub_key: String,
  socket_id: String,
  is_master: Boolean,
  created_at: Date,
  updated_at: Date
});
module.exports.User = db.model('User', UserSchema);

// Messages collection ----------------------------------------------------
var MessageSchema = new mongoose.Schema({
   user_id: String,
   message: String,
   geolocation: String,
   is_encrypted: Boolean,
   created_at: Date
});
module.exports.Message = db.model('Message', MessageSchema);




