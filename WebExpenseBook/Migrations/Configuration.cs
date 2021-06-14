namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using WebExpenseBook.Models;

    internal sealed class Configuration : DbMigrationsConfiguration<MainContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(MainContext context)
        {
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method
            //  to avoid creating duplicate seed data.
            using (var dataContext = new MainContext())
            {
                // Entity インスタンスを作成
                var Cotegory = dataContext.Categories.Create();

                // Entity に、データを設定
                Cotegory.CategoryDepth = 0;
                Cotegory.CategoryName = "交通費";
                Cotegory.MainItemId = 0;
                Cotegory.ParentId = 0;
                Cotegory.IsDeleted = false;
                Cotegory.CreateAt = DateTime.Today;
                Cotegory.UpdateAt = DateTime.Today;
                Cotegory.ParentName = "Top";
                // ここまで次でも可
                // var entity = new Prefecture() { Code = "01", Name = "北海道", Kana = "ホッカイドウ" };

                // 追加
                //dataContext.Categories.Add(Cotegory);

                //// 変更内容をデータソース（データベース）に保存
                //dataContext.SaveChanges();
            }
        }
    }
}
