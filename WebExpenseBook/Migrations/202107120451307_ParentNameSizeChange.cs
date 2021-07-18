namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ParentNameSizeChange : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Categories", "ParentName", c => c.String(nullable: false, maxLength: 256));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Categories", "ParentName", c => c.String(nullable: false, maxLength: 128));
        }
    }
}
