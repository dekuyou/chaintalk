var crypto = require('crypto');
var ursa   = require('ursa');

/**
 * init 
 */
exports.index = function(req, res){

    // 共通鍵
    var uncipheredText = 'chaintalk';
    var password ='passowrd';
    

    // 暗号化
    var cipher = crypto.createCipher('aes192', password);
    cipher.update(uncipheredText);
    var cipheredText = cipher.final('binary');
    console.log(cipheredText);

    
    // 復号
    var decipher = crypto.createDecipher('aes192', password);
    decipher.update(cipheredText);
    console.log(decipher.final('utf8'));
    
    
    // 公開鍵
    var encoding = 'base64';
    
    // private
    var keys = ursa.generatePrivateKey();
    
    var privPem = keys.toPrivatePem(encoding);
    var priv = ursa.createPrivateKey(privPem, '', encoding);
    console.log('Private Key:', privPem);
    
    // public
    var pubPem = keys.toPublicPem(encoding);
    var pub = ursa.createPublicKey(pubPem, encoding);
    console.log('\nPublic Key:', pubPem);
    
    var data = new Buffer(uncipheredText, 'utf8');
    console.log('\n\nMessage:', uncipheredText);
    console.log('Data:', data);
    
    
    // Encrypting (with the public key)
    var encrypted = pub.encrypt(data, encoding);
    console.log('Encrypted Data: ', encrypted);
    console.log('Encrypted Message: ', encrypted.toString('utf8'));
    
    // Decrypting (with the private key)
    var decrypted = priv.decrypt(encrypted, encoding);
    console.log('Decrypted Data: ', decrypted);
    console.log('Decrypted Message: ', decrypted.toString('utf8'));

    
    
    
    
    
    
    
    
    // res.contentType('application/json');
    // res.send(JSON.stringify( { 'state': true } ));
    res.render('crypto_', { title: 'Express Yes!!' });

    
};


