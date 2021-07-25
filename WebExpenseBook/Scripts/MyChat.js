/// <reference path="./library.d.ts" />
var ChatControll = /** @class */ (function () {
    function ChatControll() {
        var _this = this;
        this.isEntering = false;
        var me = this;
        $('#webChatSelectStamp').click(function () {
            $('#webChatModalShow').click();
        });
        $('.web-img-thumbnail').click(function (e) {
            console.log(e.target);
            var picture = $(e.target).attr('src').toString();
        });
        $('#webMakeRoom').click(function () {
            var OwnerName = "";
            //バリデーション
            var RoomName = $('#webMakeRoomName').val().toString();
            if (RoomName == "") {
                alert("ルーム名は必須です");
                return;
            }
            var $ownerName = $('#webMakeOwnerName');
            if ($ownerName.val().toString() == "") {
                if ($('#webChatDisplayname').val().toString() == "")
                    OwnerName = $ownerName.attr('placeholder').toString();
                else
                    OwnerName = $('#webChatDisplayname').val().toString();
            }
            else {
                OwnerName = $ownerName.val().toString();
            }
            _this.myName = OwnerName;
            $('#webChatDisplayname').val(OwnerName);
            //ルーム作成Ajax()
            var param = {
                OwnerName: OwnerName, RoomName: RoomName
            };
            $.ajax({
                url: '/Chat/MakeRoom',
                type: 'POST',
                data: JSON.stringify(param),
                contentType: 'application/json',
                error: function () { alert('失敗しました'); },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    //戻り値はId
                    var id = result;
                    me.MakeRoom(id, param);
                }
            });
        });
        //入室
        $('.web-chat-enter').click(function (e) {
            var name = $('#webChatDisplayname').val().toString();
            if (name == "") {
                name = prompt('お名前をどうぞ:', '');
                if (name == null) {
                    var seed = new Date();
                    name = '名無しさん' + seed.getSeconds().toString();
                }
            }
            $('#webChatDisplayname').val(name);
            //インプット要素からルーム名を取得しチャット画面を表示する
            var ss = $(e.target).prop('id');
            var roomNo = Number($(e.target).prop('id').substr(9));
            //クラスプロパティーに必要事項を設定
            _this.myRoomId = roomNo;
            $('#webChatDisplayname').val(name);
            _this.myName = name;
            //ajaxで過去のメッセージを取得
            var param = { roomId: roomNo };
            $.ajax({
                url: '/Chat/EnterRoom',
                type: 'POST',
                data: JSON.stringify(param),
                contentType: 'application/json',
                error: function () { alert('失敗しました'); },
                complete: function (data) {
                    var result = eval('(' + data.responseText + ')');
                    me.EnterRoom(roomNo, result);
                }
            });
        });
    }
    //入室
    ChatControll.prototype.EnterRoom = function (roomNo, info) {
        var _this = this;
        this.myRoomId = roomNo;
        this.isEntering = true;
        var existStamp = false;
        info.chatDetail.forEach(function (data, index) {
            _this.AddMessage(roomNo, data.Name, data.Comment, new Date(parseInt(String(data.UpdateTime).substr(6))), data.IsStamp);
            existStamp = existStamp || data.IsStamp;
        });
        $('#webChatTitle').text(info.RoomName);
        $('#webSelectRoom').addClass('web-unvisible');
        $('#webMainChat').removeClass('web-unvisible');
        this.isEntering = false;
        var chatObj = document.getElementById('webChatContents');
        if (existStamp) {
            var tokenList = $('#webChatContents').find('.stamp');
            var pp = tokenList[tokenList.length - 1];
            $(pp).children('img').attr('onload', 'ChatStart.ScrollScreen();');
        }
        //        const ss = $('#webChatContents > div:last-child').find('img').attr('onload', 'ChatStart.ScrollScreen();');
    };
    //ルーム作成
    ChatControll.prototype.MakeRoom = function (roomNo, info) {
        $('#webChatTitle').text(info.RoomName);
        $('#webSelectRoom').addClass('web-unvisible');
        $('#webMainChat').removeClass('web-unvisible');
        this.myRoomId = roomNo;
    };
    ChatControll.prototype.AddMessage = function (roomId, name, message, dtWriteTime, isStamp) {
        if (roomId != this.myRoomId)
            return;
        var messagePosition;
        var nameDiv = '';
        var iconDiv = '';
        if (this.myName == name)
            messagePosition = 'line__right';
        else {
            messagePosition = 'line__left';
            iconDiv = '<figure><img src="/stamp/icon.png" /></figure>';
            nameDiv = '<div class="name">' + name + '</div>';
        }
        var lineMessage = '<div class="' + messagePosition + ' webChatMessage">';
        if (isStamp) {
            var loadFunc = '';
            if (!this.isEntering)
                loadFunc = ' onload="ChatStart.ScrollScreen();"';
            lineMessage += '<div class="stamp"><img src="' + message + '"' + loadFunc + '/></div></div>';
        }
        else {
            lineMessage += iconDiv + '<div class="' + messagePosition + '-text">' + nameDiv + '<div class="text">' + message + '</div><span class="date">投稿:' +
                this.PlotTime(dtWriteTime) + '</span></div></div>';
        }
        var chatObj = document.getElementById('webChatContents');
        chatObj.insertAdjacentHTML('beforeend', lineMessage);
        if (!isStamp) {
            chatObj.scrollTop = chatObj.scrollHeight;
        }
    };
    ChatControll.prototype.ScrollScreen = function () {
        var chatObj = document.getElementById('webChatContents');
        chatObj.scrollTop = chatObj.scrollHeight;
    };
    ChatControll.prototype.PlotTime = function (writeDate) {
        var now = new Date();
        if (writeDate.getDate() == now.getDate() &&
            writeDate.getMonth() == now.getMonth() &&
            writeDate.getFullYear() == now.getFullYear()) {
            return ('0' + now.getHours().toString()).slice(-2) + ':' + ('0' + now.getSeconds().toString()).slice(-2);
        }
        return ('0' + (writeDate.getMonth() + 1).toString()).slice(-2) + '/' + ('0' + writeDate.getDate().toString()).slice(-2);
    };
    return ChatControll;
}());
var ChatStart = new ChatControll();
//最後のメッセージの取得
var ss = $('#webChatContents > div:last-child').html();
//# sourceMappingURL=MyChat.js.map