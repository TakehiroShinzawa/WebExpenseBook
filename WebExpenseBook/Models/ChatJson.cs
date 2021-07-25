using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebExpenseBook.Models
{
    public class JsonMakeRoomInfo
    {
        public string OwnerName { get; set; }
        public string RoomName { get; set; }
    }
    public class JsonRoomInfomation
    {
        public string RoomName { get; set; }
        public ChatEssence[] chatDetail { get; set; }
    }
    public class ChatEssence
    {
        public string Name { get; set; }
        public bool IsStamp { get; set; }
        public string Comment { get; set; }
        public DateTime UpdateTime { get; set; }
    }
}