using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebExpenseBook.Models
{
    public class ChatDetail
    {
        public int Id { get; set; }

        [DisplayName("ルーム名")]
        [Required]
        public int RoomID { get; set; }


        [DisplayName("氏名")]
        [Required]
        [StringLength(32)]
        public string Name { get; set; }

        public bool IsStamp { get; set; }

        [DisplayName("コメント")]
        [StringLength(1024)]
        public string Comment { get; set; }

        [Required]
        public DateTime UpdateTime { get; set; }
    }
    public class RoomInfo
    {
        public int Id { get; set; }

        [DisplayName("ルーム名")]
        [Required]
        [StringLength(32)]
        public string RoomName { get; set; }

        [DisplayName("開設者")]
        [Required]
        [StringLength(32)]
        public string Name { get; set; }

        [DisplayName("開設日時")]
        [Required]
        public DateTime CreateTime { get; set; }

        [DisplayName("最終コメント日時")]
        [Required]
        public DateTime LastCommntTime { get; set; }
    }
}