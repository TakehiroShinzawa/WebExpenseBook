/// <reference path="MyChat.js" />

$(function () {
    // Reference the auto-generated proxy for the hub.
    var chat = $.connection.chatHub;

    // Create a function that the hub can call back to display messages.
    chat.client.addNewMessageToPage = function (roomId, name, message, isStamp) {
        ChatStart.AddMessage(roomId, name, message, new Date(), isStamp);
    };
    // Get the user name and store it to prepend to messages.
    //入力者の名前をプロンプトで取得するだけ
    $('#webChatDisplayname').val(prompt('お名前をどうぞ:', ''));
    // Set initial focus to message input box.
    $('#webChatMessage').focus();

    // Start the connection.
    $.connection.hub.start().done(function () {
        $('#webChatSendMessage').click(function () {
            //送信前に自分のメッセージを書き込む
            const message = htmlEncode($('#webChatMessage').val());
            if (message == "")
                return;
            //ChatStart.myLastMessage = message;
            // Call the Send method on the hub.
            const name = $('#webChatDisplayname').val();
            chat.server.send(ChatStart.myRoomId, name, message, false);
            // Clear text box and reset focus for next comment.
            $('#webChatMessage').val('').focus();
        });
        $('.web-img-thumbnail').click((e) => {
            const stamp = $(e.target).attr('src');
            const name = $('#webChatDisplayname').val();
            chat.server.send(ChatStart.myRoomId, name, stamp, true);
       });
    });
});
// This optional function html-encodes messages for display in the page.
function htmlEncode(value) {
    return $('<div />').text(value).html();
}
