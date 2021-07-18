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
                    bool IsParentChanged = false;
                    string ParentName = "";
                    foreach (var cate in webJsonItem.Category)
                    {
                        var dp = webJsonItem.Category[i++].Depth;
                        var category = db.Categories.Single(x => x.MainItemId == webJsonItem.ItemId && x.CategoryDepth == dp);
                        if (category.CategoryName != cate.CategoryName || IsParentChanged)
                        {
                            if (IsParentChanged)
                            {
                                category.ParentName = ParentName;
                                ParentName += cate.CategoryName;
                            }
                            category.CategoryName = cate.CategoryName;
                            category.UpdateAt = DateTime.Now;
                            var asyncGuard = category.ParentName;   //非同期処理で更新処理を追い越した時の保険
                            await db.SaveChangesAsync();
                            if (!IsParentChanged)
                            {
                                ParentName = (dp == 0 ? cate.CategoryName : asyncGuard + cate.CategoryName);
                            }
                            IsUpdated = true;
                            IsOnlyName = false;
                            IsParentChanged = true;
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
        public ActionResult JsonGetCategoryPrice(int Depth, string ParentName, DateTime StartDate, DateTime EndDate, string TargetCategory , string Pattern)
        {
            var UserIp = Request.UserHostAddress;
            string sql = "";

            //if (string.IsNullOrEmpty(ParentName))
            //    TargetCategory = "";
            if (Depth == 0)
            {
                //var sql = $"select distinct CategoryName from Categories C inner join MainItems M on M.OwnerName = @OwnerName and M.Id = C.MainItemId where C.CategoryDepth = @Depth";
                sql = "select '' ParentName,C.CategoryName, sum( M.ItemPrice ) CategotyPrice " +
                         "from MainItems M left join Categories C on C.MainItemId = M.Id " +
                         "where /*M.OwnerName = @OwnerName and */ M.ItemDate between @StartDate and @EndDate and M.IsDeleted = 0 and " +
                         "M.Pattern = @Pattern and C.CategoryDepth = @Depth " +
                         "group by C.CategoryName";
            }
            else
            {
                sql = "select C.ParentName, C.CategoryName, sum( M.ItemPrice ) CategotyPrice " +
                          "from MainItems M left join Categories C on C.MainItemId = M.Id " +
                          "where /*M.OwnerName = @OwnerName and */ M.ItemDate between @StartDate and @EndDate and M.IsDeleted = 0 and " +
                          "C.CategoryDepth = @Depth and C.ParentName = @ParentCategory " +
                          "group by C.ParentName, C.CategoryName";
            }
            var dat = db.Database.SqlQuery<WebJsonCategoryPrice>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@Depth", Depth),
               new SqlParameter("@StartDate", StartDate), new SqlParameter("@EndDate", EndDate), new SqlParameter("@ParentCategory", ParentName + TargetCategory), new SqlParameter("@Pattern", Pattern));
            var dd = dat.ToList();
            if (Depth == 0 || dd.Count != 0)
                return Json(dd);    //カテゴリーがあったら返す
            //残りはアイテムのはずなので、アイテムを返す
            sql = "select M.Id ItemId, CONVERT(VARCHAR, M.ItemDate,111) as ItemDate,  M.ItemName, M.ItemPrice from MainItems M left join Categories C on C.MainItemId = M.Id " +
                    "where /*M.OwnerName = @OwnerName and */ C.CategoryDepth = @Depth and C.CategoryName = @CategoryName and M.ItemDate between @StartDate and @EndDate and M.IsDeleted = 0 and C.ParentName = @ParentName order by  M.ItemDate";
            var Items = db.Database.SqlQuery<WebJsonItemList>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@Depth", Depth - 1),
                new SqlParameter("@StartDate", StartDate), new SqlParameter("@EndDate", EndDate), new SqlParameter("@ParentName", ParentName), new SqlParameter("@CategoryName", TargetCategory));
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
                Pattern = mainitem.Pattern,
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
                    bool IsTop = true;
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
                            if (IsTop)
                            {
                                ParentName = Category.CategoryName;
                                IsTop = false;
                            }
                            else
                                ParentName += Category.CategoryName;
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
            var sql = $"select distinct CategoryName, CategoryDepth from Categories C inner join MainItems M on /* M.OwnerName = @OwnerName and */ M.Id = C.MainItemId where  c.CategoryDepth = 0 and M.Pattern = @Pattern";
            var Catregories = db.Database.SqlQuery<WebJsonCategory>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@Pattern", mainitem.Pattern));
            return Json(Catregories.ToList());
        }


        [HttpPost]
        public ActionResult JsonItem(string[] items)
        {
            var UserIp = Request.UserHostAddress;
            int Count = items.Length - 1;
            if( items[Count] == "")
                Count --;
            var CategoryName = items[Count];
            items[Count] = null;
            var ParentName = string.Join(null, items);
            var sql = $"select distinct M.ItemName from Categories C inner join MainItems M on /* M.OwnerName = @OwnerName and */ M.Id = C.MainItemId where  c.CategoryDepth = @Depth and C.ParentName = @ParentName and C.CategoryName = @CategoryName";
            var dat = db.Database.SqlQuery<WebJsonItemOnly>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@ParentName", ParentName), new SqlParameter("@CategoryName", CategoryName), new SqlParameter("@Depth", Count));
            var dd = dat.ToList();
            return Json(dd);
        }

        [HttpPost]
        public ActionResult JsonCategory(WebGetChildCategory category)
        {
            var iDepth = category.Depth + 1;
            var UserIp = Request.UserHostAddress;
            if (string.IsNullOrEmpty(category.ParentName))
                category.ParentName = "";
            var sql = $"select distinct CategoryName, CategoryDepth from Categories C inner join MainItems M on /* M.OwnerName = @OwnerName and */ M.Id = C.MainItemId where  c.CategoryDepth = @Depth and C.ParentName = @ParentName　and M.Pattern = @Pattern";
            var Catregories = db.Database.SqlQuery<WebJsonCategory>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@ParentName", category.ParentName + category.CategoryName), new SqlParameter("@Depth", iDepth), new SqlParameter("@Pattern", category.Pattern));

            var NameList = Catregories.ToArray();
            bool IsItemExist = false;
            if ( NameList.Length == 0)
            {
                var ParentName = category.ParentName;
                sql = $"select top 1 M.ItemName from Categories C inner join MainItems M on /* M.OwnerName = @OwnerName and */ M.Id = C.MainItemId where  c.CategoryDepth = @Depth and C.ParentName = @ParentName and C.CategoryName = @CategoryName";
                var dat = db.Database.SqlQuery<WebJsonItemOnly>(sql, new SqlParameter("@OwnerName", UserIp), new SqlParameter("@ParentName", category.ParentName), new SqlParameter("@CategoryName", category.CategoryName), new SqlParameter("@Depth", category.Depth));
                var dd = dat.ToList();
                IsItemExist = (dd.Count == 1);

            }
            var Result = new WebCategoryListWithItemInfo { Category = NameList, IsItemExist = IsItemExist };
            return Json(Result);
        }

        public ActionResult Index()
        {
            ViewBag.BackImage = $"~/Images/jumbo{DateTime.Now.Second % 5 + 1}.jpg";
            return View();
        }

        public ActionResult Income()
        {
            var UserIp = Request.UserHostAddress;
            var sql = $"select distinct CategoryName, CategoryDepth from Categories C inner join MainItems M on /* M.OwnerName = @OwnerName and */ M.Id = C.MainItemId where  c.CategoryDepth = 0 and M.Pattern = '収入'";
            var dat = db.Database.SqlQuery<WebJsonCategory>(sql, new SqlParameter("@OwnerName", UserIp));

            return View(dat.ToList());
        }

        public ActionResult Input()
        {
            var UserIp = Request.UserHostAddress;
            var sql = $"select distinct CategoryName, CategoryDepth from Categories C inner join MainItems M on /* M.OwnerName = @OwnerName and */ M.Id = C.MainItemId where  c.CategoryDepth = 0 and M.Pattern = '支出'";
            var dat = db.Database.SqlQuery<WebJsonCategory>(sql, new SqlParameter("@OwnerName", UserIp));

            var sss = db.Categories.Where(x => x.CategoryDepth == 0 ).Select((d) => new WebJsonCategory { CategoryName = d.CategoryName, Depth = 0 }).Distinct();

            return View(dat.ToList());
        }

        public ActionResult Monthly()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}