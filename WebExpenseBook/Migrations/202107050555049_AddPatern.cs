namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddPatern : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.MainItems", "Pattern", c => c.String(maxLength: 16));
            AlterColumn("dbo.Categories", "ParentName", c => c.String(nullable: false, maxLength: 128));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Categories", "ParentName", c => c.String(nullable: false, maxLength: 32));
            DropColumn("dbo.MainItems", "Pattern");
        }
    }
}
