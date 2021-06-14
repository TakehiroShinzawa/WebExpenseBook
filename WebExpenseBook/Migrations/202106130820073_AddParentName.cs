namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddParentName : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Categories",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        MainItemId = c.Int(nullable: false),
                        CategoryDepth = c.Int(nullable: false),
                        ParentId = c.Int(nullable: false),
                        ParentName = c.String(nullable: false, maxLength: 32),
                        CategoryName = c.String(nullable: false, maxLength: 32),
                        CreateAt = c.DateTime(nullable: false),
                        IsDeleted = c.Boolean(nullable: false),
                        UpdateAt = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.MainItems",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        ItemDate = c.DateTime(nullable: false),
                        OwnerName = c.String(nullable: false, maxLength: 64),
                        ItemName = c.String(nullable: false, maxLength: 128),
                        ItemPrice = c.Decimal(nullable: false, precision: 18, scale: 2),
                        CreateAt = c.DateTime(nullable: false),
                        IsDeleted = c.Boolean(nullable: false),
                        UpdateAt = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.MainItems");
            DropTable("dbo.Categories");
        }
    }
}
