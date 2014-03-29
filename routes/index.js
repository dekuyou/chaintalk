
/*
 * GET home page.
 */

exports.index = function(req, res){
    
  req.session.userID = 'hoge';
  res.render('index', { title: 'Express Yes!!' });
};