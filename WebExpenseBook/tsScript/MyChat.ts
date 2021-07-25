/// <reference path="./library.d.ts" />
interface MakeRoomInfo {
    OwnerName: string;
    RoomName: string;
}
interface ChatDetail {
    Name: string;
    IsStamp: boolean;
    Comment: string;
    UpdateTime: Date;
}
interface RoomInfomation {
    RoomName: string;
    chatDetail: ChatDetail[];
}
class ChatControll {
    myRoomId: number;
    myName: string;
    isEntering: boolean = false;
    constructor() {
        const me = this;
        $('#webChatSelectStamp').click(() => {
            $('#webChatModalShow').click();
        })
        $('.web-img-thumbnail').click((e) => {
            console.log(e.target);
            const picture = $(e.target).attr('src').toString();

        })
        $('#webMakeRoom').click(() => {
            let OwnerName = "";
            //バリデーション
            const RoomName = $('#webMakeRoomName').val().toString();
            if (RoomName == "") {
                alert("ルーム名は必須です");
                return;
            }
            const $ownerName = $('#webMakeOwnerName');
            if ($ownerName.val().toString() == "") {
                if ($('#webChatDisplayname').val().toString() == "")
                    OwnerName = $ownerName.attr('placeholder').toString();
                else
                    OwnerName = $('#webChatDisplayname').val().toString();
            } else {
                OwnerName = $ownerName.val().toString();
            }
            this.myName = OwnerName;
            $('#webChatDisplayname').val(OwnerName);
            //ルーム作成Ajax()
            const param: MakeRoomInfo = {
                OwnerName: OwnerName, RoomName: RoomName
            };
            $.ajax(
                {
                    url: '/Chat/MakeRoom',
                    type: 'POST',
                    data: JSON.stringify(param),   // JSONの文字列に変換,   // Depthを取得
                    contentType: 'application/json',    // content-typeをJSONに指定する
                    error: function () { alert('失敗しました'); },
                    complete: function (data) {
                        const result = eval('(' + data.responseText + ')');
                        //戻り値はId
                        const id: number = result;
                        me.MakeRoom(id,param);
                    }
                })
        });
        //入室
        $('.web-chat-enter').click((e) => {
            let name = $('#webChatDisplayname').val().toString();
            if (name == "") {
                name = prompt('お名前をどうぞ:', '');
                if (name == null) {
                    const seed = new Date();
                    name = '名無しさん' + seed.getSeconds().toString();
                }
            }
            $('#webChatDisplayname').val(name);
            //インプット要素からルーム名を取得しチャット画面を表示する
            const ss = $(e.target).prop('id');
            const roomNo = Number($(e.target).prop('id').substr(9));
            //クラスプロパティーに必要事項を設定
            this.myRoomId = roomNo;
            $('#webChatDisplayname').val(name);
            this.myName = name;
            //ajaxで過去のメッセージを取得
            const param = { roomId: roomNo };
            $.ajax(
                {
                    url: '/Chat/EnterRoom',
                    type: 'POST',
                    data: JSON.stringify(param),   // JSONの文字列に変換,   // Depthを取得
                    contentType: 'application/json',    // content-typeをJSONに指定する
                    error: function () { alert('失敗しました'); },
                    complete: function (data) {
                        const result = eval('(' + data.responseText + ')');
                        me.EnterRoom(roomNo, result);
                    }
                })
        })
    }
    //入室
    EnterRoom(roomNo: number, info: RoomInfomation) {
        this.myRoomId = roomNo;
        this.isEntering = true;
        let existStamp = false;
        info.chatDetail.forEach((data, index) => {
            this.AddMessage(roomNo, data.Name, data.Comment,
                new Date(parseInt(String(data.UpdateTime).substr(6))), data.IsStamp);
            existStamp = existStamp || data.IsStamp;
        });
        $('#webChatTitle').text(info.RoomName);
        $('#webSelectRoom').addClass('web-unvisible');
        $('#webMainChat').removeClass('web-unvisible');
        this.isEntering = false;
        const chatObj = document.getElementById('webChatContents');
        if (existStamp) {
            const tokenList = $('#webChatContents').find('.stamp');
            const pp = tokenList[tokenList.length - 1];
            $(pp).children('img').attr('onload', 'ChatStart.ScrollScreen();');
        }
//        const ss = $('#webChatContents > div:last-child').find('img').attr('onload', 'ChatStart.ScrollScreen();');
    }
    //ルーム作成
    MakeRoom(roomNo: number, info : MakeRoomInfo) {
        $('#webChatTitle').text(info.RoomName);
        $('#webSelectRoom').addClass('web-unvisible');                  
        $('#webMainChat').removeClass('web-unvisible');
        this.myRoomId = roomNo;
    }
    AddMessage(roomId: number, name: string, message: string, dtWriteTime: Date, isStamp: boolean): void {
        if (roomId != this.myRoomId)
            return;
        let messagePosition: string;
        let nameDiv: string = '';
        let iconDiv: string = '';
        if (this.myName == name)
            messagePosition = 'line__right';
        else {
            messagePosition = 'line__left';
            iconDiv = '<figure><img src="/stamp/icon.png" /></figure>';
            nameDiv = '<div class="name">' + name + '</div>';
        }
        let lineMessage = '<div class="' + messagePosition + ' webChatMessage">';
        if (isStamp) {
            let loadFunc = '';
            if (!this.isEntering)
                loadFunc = ' onload="ChatStart.ScrollScreen();"';
            lineMessage += '<div class="stamp"><img src="' + message + '"' + loadFunc + '/></div></div>';
        } else {
            lineMessage += iconDiv + '<div class="' + messagePosition + '-text">' + nameDiv + '<div class="text">' + message + '</div><span class="date">投稿:' +
                this.PlotTime(dtWriteTime) + '</span></div></div>';
        }
        const chatObj = document.getElementById('webChatContents');
        chatObj.insertAdjacentHTML('beforeend', lineMessage);
        if (!isStamp) {
            chatObj.scrollTop = chatObj.scrollHeight;
        }
    }
    ScrollScreen() {
        const chatObj = document.getElementById('webChatContents');
        chatObj.scrollTop = chatObj.scrollHeight;
    }
    PlotTime(writeDate: Date): string{
        const now = new Date();
        if (writeDate.getDate() == now.getDate() &&
            writeDate.getMonth() == now.getMonth() &&
            writeDate.getFullYear() == now.getFullYear()) {
            return ('0' + now.getHours().toString()).slice(-2) + ':' + ('0' + now.getSeconds().toString()).slice(-2);
        }
        return ('0' + (writeDate.getMonth() + 1).toString()).slice(-2) + '/' + ('0' + writeDate.getDate().toString()).slice(-2);
    }
}
let ChatStart = new ChatControll();

//最後のメッセージの取得
const ss = $('#webChatContents > div:last-child').html();

