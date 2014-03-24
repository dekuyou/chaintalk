var socket = io.connect();

socket.on('connect', function() {
    socket.emit('message:update');
});

socket.on('message:open', function(msg){
    //DBが空っぽだったら
    if(msg.length === 0){
        return;
    } else {
      $('#list').empty();
      $.each(msg, function(key, value){
        $("div#chat-area").prepend("<div>" + value.message + "</div>");
      });   
    }
});
 
socket.on('message:receive', function (data) {
  $("div#chat-area").prepend("<div>" + data.message + "</div>");
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
