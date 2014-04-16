var crypto = require('crypto');

/**
 * init 
 */
exports.index = function(req, res){

    var uncipheredText = 'chaintalk';
    var password ='passowrd';
    

    // server側の public private key を作成
    var tmp_server_key = crypto.getDiffieHellman('modp5');  // (defined in RFC 2412)
    var tmp_server_pub_key = tmp_server_key.generateKeys('base64')  ;
    // var tmp_server_pub_key = tmp_server_key.getPublicKey('hex');
    var tmp_server_pri_key = tmp_server_key.getPrivateKey('base64');
    
    console.log(tmp_server_pub_key);
    console.log(tmp_server_pri_key);
    
     var cipertext = _encrypt(uncipheredText, tmp_server_pri_key);

     // verification
     var result = _verify(uncipheredText, cipertext, tmp_server_pub_key); 
     if (result === false) {
       console.log("encryption failed!!!");
     }
    
    // sync
    // try {
    //   var buf = crypto.randomBytes(192);
    //   console.log('Have %d bytes of random data: %s', buf.length, buf);
    // } catch (ex) {
    //   // handle error
    //   // most likely, entropy sources are drained
    // }
    // var iv = new Buffer(new Array(16));
    // var iv = new Buffer(8);
    // iv.fill(0);
    // var key = new Buffer( '5B5A57676A56676E', 'hex' );

    // 暗号化
    // var cipher = crypto.createCipher('aes192', password);
    var cipher = crypto.createCipher('aes-128-cbc', new Buffer(tmp_server_pub_key, 'hex'));
    cipher.update(uncipheredText);
    var cipheredText = cipher.final('binary');
    console.log(cipheredText);

    
    // 復号
    var decipher = crypto.createDecipher('aes-128-cbc', new Buffer(tmp_server_pri_key, 'hex'));
    decipher.update(cipheredText);
    console.log(decipher.final('utf8'));
    
    
    // res.contentType('application/json');
    // res.send(JSON.stringify( { 'state': true } ));
    res.render('crypto_', { title: 'Express Yes!!' });

    
};

/********************************************************************
                      IMPLEMENTING FUNCTIONS...
********************************************************************/

function _encrypt(plaintext, privateKey)
{
  var signer = crypto.createSign("RSA-SHA256");
  signer.update(plaintext);
  var sign = signer.sign(privateKey, "hex");

 return (sign);
}

function _verify(plaintext, cipertext, publicKey)
{
  var verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(plaintext);
  var result = verifier.verify(publicKey, cipertext, "hex");
  
 return (result);
}

