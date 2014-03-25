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
            var msgObj = $("<div/>").text(value.message);
            $("div#chat-area").prepend(msgObj);
        });   
    }
});
 
socket.on('message:receive', function (data) {
    var msgObj = $("<div/>").text(data.message);
    $("div#chat-area").prepend(msgObj);
});

 
function send() {
  var msg = $("input#message").val();
  $("input#message").val("");
  socket.emit('message:send', { message: msg });
}



socket.on('message:deleted', function(){
    $('div#chat-area').empty();
});


function deleteMsgs() {
  socket.emit('message:delete');
    
}
