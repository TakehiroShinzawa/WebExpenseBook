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
        public async Task<ActionResult> JsonRegster(WebJsonItem mainitem)
        {
            var UserIp = Request.UserHostAddress;
            //メインアイテムを登録する
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
                            await db.SaveChangesAsync();
                            ParentId = Category.Id;
                            ParentName = Category.CategoryName;
                        }
                    }
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
            //var result = new List<WebJsonItemOnly>();
            //result.Add(new WebJsonItemOnly { ItemName = "新宿⇔高尾山口"});
            //result.Add(new WebJsonItemOnly { ItemName = "新宿⇔明大前" });

            //{ ItemName = "新宿⇔高尾山口"},
            // ItemName = "新宿⇔明大前"

            return Json(dd);


            var Candidate = db.Categories.Where(
                    x => x.CategoryName == ItemName && x.CategoryDepth == Count);
            var ParentId = 0;

            for (var j = 0; j < Count; j++)
            {
                var ItenNames = items[j];
                var Candidates= db.Categories.Where(
                    x => x.CategoryName == ItemName && x.CategoryDepth == j && x.ParentId == ParentId).FirstOrDefault();
                //ParentId = Candidate.Id;
                //foreach( var s in Candidate)
                //{
                //    ParentId = s.Id;
                //}


            }

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