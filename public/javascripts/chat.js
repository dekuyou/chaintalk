$(function(){
   $('.btn.sendBtn').click(function(){
       send();
   }); 
   $('.btn.deleteBtn').click(function(){
       deleteMsgs();
   });
   $('#message').keydown(function(){
       input();
   });
});


var socket = io.connect();


socket.on('connect', function() {
    socket.emit('message:update');
});

socket.on('message:open', function(msg){
    //DBが空っぽだったら
    if(msg.length === 0){
        return;
    } else {
        $("div#chat-area").empty();
        $.each(msg, function(key, value){
            writeMsg(value);
        });   
    }
});
 
 
function send() {
  var msg = $("input#message").val();
  $("input#message").val("");
  socket.emit('message:send', { message: msg });
  $('#message').focus();
}

socket.on('message:receive', function (data) { 
    if ( $('div#input-in div[_id="'+data.id+'"]').val()!==undefined){
        $('div#input-in div[_id="'+data.id+'"]').remove();
    }
    writeMsg(data);
});



function input() {
    var msg = $("input#message").val();
    socket.emit('message:input', { message: msg });
}
socket.on('message:inputting', function (data) {
    console.log($('div#input-in div[_id="'+data.id+'"]').val());
    if ( $('div#input-in div[_id="'+data.id+'"]').val()===undefined){
        var $msgObj = $("<div/>").text(data.message);
        $msgObj.attr('_id', data.id);
        $("div#input-in").prepend($msgObj);
    } else {
        $('div#input-in div[_id="'+data.id+'"]').text(data.message);
    }
});


socket.on('message:deleted', function(){
    $('div#chat-area').empty();
});


function deleteMsgs() {
  socket.emit('message:delete');
    
}

function writeMsg(data){
    var $msgObj = $("<div/>").text(data.message);
    $msgObj.attr('_id', data.id);
    $("div#chat-area").prepend($msgObj);
    
    setTimeout(function(){
		$msgObj.fadeOut(countByte(data.message)*100, function(){$(this).remove();});
	},1000 + (Math.ceil(countByte(data.message)/10)*1500 )  );

}

function countByte(str) {
    var count = 0;
    for(var i = 0; i < str.length; i++) {
       if (escape(str.charAt(i)).length < 4) {
          count++;
       }
       else {
          count += 2;
       }
    }
    return count;
}
