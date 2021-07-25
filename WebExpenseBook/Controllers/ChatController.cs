using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebExpenseBook.Models;

namespace WebExpenseBook.Controllers
{
    public class ChatController : Controller
    {
        private MainContext db = new MainContext();
        [HttpPost]
        public async Task<ActionResult> EnterRoom(int roomId)
        {
            //バリデーション
            //ルーム名取得
            var roomName = await db.RoomInfos.Where(d => d.Id == roomId).FirstAsync();
            //コメント取得
            var comments = await db.ChatDetails.Where(t => t.RoomID == roomId).OrderBy(t => t.UpdateTime)
                .Select( d => new ChatEssence { Name = d.Name, IsStamp = d.IsStamp, Comment = d.Comment, UpdateTime = d.UpdateTime }).ToListAsync();
            var data = new JsonRoomInfomation()
            {
                RoomName = roomName.RoomName,
                chatDetail = comments.ToArray()
            };

            //送信
            return Json(data);
        }

        [HttpPost]
        public async Task<ActionResult> MakeRoom(JsonMakeRoomInfo roomInfo)
        {
            //バリデーション
            //    ・同一ネーム&&オーナー名違い　→　確認メッセージ
            //    ・同一ネーム&&同一オーナー　→　入室を促す
            //ルーム作成
            var dbRoom = new RoomInfo()
            {
                RoomName = roomInfo.RoomName,
                Name = roomInfo.OwnerName,
                CreateTime = DateTime.Now,
                LastCommntTime = DateTime.Now
            };
            db.RoomInfos.Add(dbRoom);
            await db.SaveChangesAsync();
            return Json(dbRoom.Id);
        }

        // GET: Chat
        public ActionResult Room()
        {
            Console.WriteLine(HttpRuntime.AppDomainAppVirtualPath);
            var aa = System.IO.Directory.GetFiles(Request.PhysicalApplicationPath + "Stamp", "*.png");
            int i, m, pathLength;
            pathLength = Request.PhysicalApplicationPath.Length - 1;
            m = aa.Length;
            for( i = 0;i < m; i++)
            {
                aa[i] = aa[i].Substring(pathLength).Replace('\\', '/');
            }
            //var sql = $"select Id, RoomName, Name, LastCommntTime, CreateTime from RoomInfoes order by RoomName";
            //var dat = db.Database.SqlQuery<RoomInfo>(sql);
            var dat = db.RoomInfos.OrderBy(t => t.RoomName);
            ViewBag.DefaulCreatorName = "ルームオーナー";
            ViewBag.PictPath = aa;
            return View(dat.ToList());
        }
    }
}