using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using WebExpenseBook.Models;

namespace WebExpenseBook
{
    public class ChatHub : Hub
    {
        private MainContext db = new MainContext();
        public async Task<string> Send(int roomId, string name, string message, bool isStamp)
        {
            //メッセージレコードを作成する
            var data = new ChatDetail()
            {
                RoomID = roomId,
                Name = name,
                IsStamp = isStamp,
                Comment = message,
                UpdateTime = DateTime.Now
            };
            //メッセージをレコードに書き込む
            db.ChatDetails.Add(data);
            await db.SaveChangesAsync();
            // Call the addNewMessageToPage method to update clients.
            Clients.All.addNewMessageToPage(roomId, name, message, isStamp);
            return ("");
        }
    }
}