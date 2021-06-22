using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebExpenseBook.Models;

namespace WebExpenseBook.Controllers
{
    public class HomeController : Controller
    {
        private MainContext db = new MainContext();

        [HttpPost]
        public async Task< ActionResult> JsonUpdateItem(WebJsonItem webJsonItem)
        {
            bool IsOnlyName = true;
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    int i = 0;
                    bool IsUpdated = false;
                    bool IsItemUpdated = false;
                    foreach (var cate in webJsonItem.Category)
                    {
                        var dp = webJsonItem.Category[i++].Depth;
                        var category = db.Categories.Single(x => x.MainItemId == webJsonItem.ItemId && x.CategoryDepth == dp);
                        if (category.CategoryName != cate.CategoryName)
                        {
                            category.CategoryName = cate.CategoryName;
                            category.UpdateAt = DateTime.Now;
                            await db.SaveChangesAsync();
                            IsUpdated = true;
                            IsOnlyName = false;
                        }
                    }
                    var item = db.MainItems.Single(x => x.Id == webJsonItem.ItemId);
                    if (item.ItemName != webJsonItem.ItemName)
                    {
                        IsUpdated = true;
                        IsItemUpdated = true;
                        item.ItemName = webJsonItem.ItemName;
                    }
                    if (item.ItemPrice != webJsonItem.ItemPrice || item.ItemDate.ToShortDateString() != webJsonItem.ItemDate.ToShortDateString())
                    {
                        item.ItemPrice = webJsonItem.ItemPrice;
                        item.ItemDate = webJsonItem.ItemDate;
                        IsUpdated = true;
                        IsItemUpdated = true;
                        IsOnlyName = false;
                    }
                    if( IsItemUpdated)
                        await db.SaveChangesAsync();
                    if (IsUpdated)
                        transaction.Commit();
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e.Message);
                    transaction.Rollback();
                    return Json(false);
                }
            }
            return Json(IsOnlyName);

        }
        [HttpPost]
        public ActionResult JsonEditItem(int ItemId)
        {
            WebJsonItem webJsonItem = new WebJsonItem();

            string sql = "";
            sql = "select C.CategoryDepth Depth, C.CategoryName from Categories C " +
                    "where C.MainItemId = @ItemId order by C.CategoryDepth";
            var Items = db.Database.SqlQuery<WebJsonCategory>(sql, new SqlParameter("@ItemId", ItemId));
            var ItemsResult = Items.ToList();
            return Json(ItemsResult);
        }

        [HttpPost]
        public async Task<ActionResult> JsonDeleteItem(int ItemId)
        {
            string sql = "";
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    var Now = DateTime.Now;
                    sql = "update MainItems set IsDeleted = 1, UpdateAt = @Now where Id = @ItemId";
                    await db.Database.ExecuteSqlCommandAsync(sql, new SqlParameter("@Now", Now), new SqlParameter("@ItemId", ItemId));
                    sql = "update Categories set IsDeleted = 1, UpdateAt = @Now where MainItemId = @ItemId";
                    await db.Database.ExecuteSqlCommandAsync(sql, new SqlParameter("@Now", Now), new SqlParameter("@ItemId", ItemId));
                    transaction.Commit();
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e.Message);
                    transaction.Rollback();
                }
            }
            return Json(false);
        }
        [HttpPost]
        public ActionResult JsonGetCategoryPrice(int Depth, DateTime StartDate, DateTime EndDate, string TargetCategory)
        {
            var UserIp = Request.UserHostAddress;
            string sql = "";

            if (Depth == 0)
            {
                if (string.IsNullOrEmpty(TargetCategory))
                    TargetCategory = "NONE";
                //var sql = $"select distinct CategoryName from Categories C inner join MainItems M on M.OwnerName = @OwnerName and M.Id = C.MainItemId where C.CategoryDepth = @Depth";
                sql = "select C.CategoryName, sum( M.ItemPrice ) CategotyPrice " +
                         "from MainItems M left join Categories C on C.MainItemId = M.Id " +
                         "where /*M.OwnerName = @OwnerName and */ M.ItemDate between @StartDate and @EndDate and M.IsDeleted = 0 and " +
                         "C.CategoryDepth = @Depth " +
                         "group by C.CategoryName";
            }
            else
            {
                sql = "select C.CategoryName, sum( M.ItemPrice ) CategotyPrice " +
                          "from MainItems M left join Categories C on C.MainItemId = M.Id " +
                          "where /*M.OwnerName = @OwnerName and */ M.ItemDate between @StartDate and @EndDate and M.IsDeleted = 0 and " +
                          "C.CategoryDepth = @Depth and C.ParentName = @ParentCategory " +
                          "group by C.CategoryName";
            }
            var dat = db.Database.SqlQuery<WebJsonCategoryPrice>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@Depth", Depth),
               new SqlParameter("@StartDate", StartDate), new SqlParameter("@EndDate", EndDate), new SqlParameter("@ParentCategory", TargetCategory));
            var dd = dat.ToList();
            if (Depth == 0 || dd.Count != 0)
                return Json(dd);    //カテゴリーがあったら返す
            //残りはアイテムのはずなので、アイテムを返す
            sql = "select M.Id ItemId, CONVERT(VARCHAR, M.ItemDate,111) as ItemDate,  M.ItemName, M.ItemPrice from MainItems M left join Categories C on C.MainItemId = M.Id " +
                    "where /*M.OwnerName = @OwnerName and */ C.CategoryDepth = @Depth and M.ItemDate between @StartDate and @EndDate and M.IsDeleted = 0 and C.CategoryName = @Category order by  M.ItemDate";
            var Items = db.Database.SqlQuery<WebJsonItemList>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@Depth", --Depth),
                new SqlParameter("@StartDate", StartDate), new SqlParameter("@EndDate", EndDate), new SqlParameter("@Category", TargetCategory));
            var ItemsResult = Items.ToList();
            return Json(ItemsResult);
        }


        [HttpPost]
        public async Task<ActionResult> JsonRegster(WebJsonItem mainitem)
        {
            var UserIp = Request.UserHostAddress;
            //メインアイテムを登録する
            //時間の指定が午前０時だと何かと都合が悪いので12時に変更
            mainitem.ItemDate = mainitem.ItemDate.AddHours(12);
            var MainItem = new MainItem()
            {
                ItemDate = mainitem.ItemDate,
                ItemName = mainitem.ItemName,
                ItemPrice = mainitem.ItemPrice,
                OwnerName = UserIp,
                IsDeleted = false,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    db.MainItems.Add(MainItem);
                    // メインアイテムを登録する
                    await db.SaveChangesAsync();
                    var Result = MainItem.Id;
                    int Count = mainitem.Category.Length;
                    int ParentId = 0;
                    string ParentName = "NONE";
                    //var Cotegory = new Category[Count]; 
                    for(var i = 0;i < Count;i++)
                    {
                        if (!string.IsNullOrEmpty( mainitem.Category[i].CategoryName))
                        {
                            var Category = new Category();
                            Category.CategoryDepth = mainitem.Category[i].Depth;
                            Category.CategoryName = mainitem.Category[i].CategoryName;
                            Category.MainItemId = Result;
                            Category.ParentId = ParentId;
                            Category.ParentName = ParentName;
                            Category.IsDeleted = false;
                            Category.CreateAt = DateTime.Now;
                            Category.UpdateAt = DateTime.Now;
                            db.Categories.Add(Category);
                            ParentId = Category.Id;
                            ParentName = Category.CategoryName;
                        }
                    }
                    await db.SaveChangesAsync();
                    transaction.Commit();
                }
                catch (Exception e)
                {
                    //データベースのエラーを確実にフックするべき
                    Debug.WriteLine(e.Message);
                    transaction.Rollback();
                }
            }

            return Json(db.Categories.Where(x => x.CategoryDepth == 0).Select((d) => new { CategoryName = d.CategoryName }).Distinct());
        }


        [HttpPost]
        public ActionResult JsonItem(string[] items)
        {
            var UserIp = Request.UserHostAddress;
            int Count = items.Length;
            if( items[Count - 1] == "")
                Count -=2;
            var ItemName = items[Count];
            var sql = $"select distinct ItemName from Categories C inner join MainItems M on M.OwnerName = @OwnerName and M.Id = C.MainItemId where CategoryName = @ItemName and c.CategoryDepth = @Depth";
            var dat = db.Database.SqlQuery<WebJsonItemOnly>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@ItemName", ItemName), new SqlParameter("@Depth", Count));
            var dd = dat.ToList();
            return Json(dd);
        }

        [HttpPost]
        public ActionResult JsonCategory(WebJsonCategory category)
        {
            //db.Categories.ToList();
            //WebJsonCategory[] Catregories;
            var Depth = category.Depth +1;
            var Catregories = db.Categories.Where((x) => x.ParentName == category.CategoryName && x.CategoryDepth == Depth)
                .Select(x => new WebJsonCategory { CategoryName = x.CategoryName, Depth = x.CategoryDepth }).Distinct();

            //var i = category.Depth;
            //var k = category.CategoryName;
            //var sss = new List<WebJsonCategory>();
            //if (k == "交通費")
            //{
            //    sss.Add(new WebJsonCategory { Depth = 1, CategoryName = "JR線" });
            //    sss.Add(new WebJsonCategory { Depth = 1, CategoryName = "京王線" });
            //}

            return Json(Catregories);
        }

        public ActionResult Index()
        {
            ViewBag.BackImage = $"~/Images/jumbo{DateTime.Now.Second % 5 + 1}.jpg";
            return View();
        }

        public ActionResult Input()
        {
            string[] result;

            //result = new string[]
            //{   "消耗品",
            //    "交通費",
            //    "公租公課費",
            //    "交際費"
            //};
            var sss = db.Categories.Where(x => x.CategoryDepth == 0).Select((d) => new WebJsonCategory { CategoryName = d.CategoryName, Depth = 0 }).Distinct();

            return View(sss);
        }

        public ActionResult Monthly()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}