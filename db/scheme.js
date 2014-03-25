module.exports.mongoose            = require('mongoose');
module.exports.Schema;


exports.init = function(){
    
    
this.Schema = this.mongoose.Schema;

var ChatTestSchema = new this.Schema({
  message: String,
  date: Date
});
this.mongoose.model('ChatTest', ChatTestSchema);
this.mongoose.connect('mongodb://'+ (process.env.IP || 'localhost') +'/chat_app');
    
    
    
}

/*
module.exports.UserSchema = new module.exports.Schema({
  user_id: String,
  sns_type: Number,
  pub_key: String,
  date: Date
});

module.exports.MessagesSchema = new module.exports.Schema({
   user_id: String,
   message: String,
});

*/