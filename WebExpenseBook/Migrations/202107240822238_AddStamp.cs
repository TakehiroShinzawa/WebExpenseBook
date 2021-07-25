namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddStamp : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.ChatDetails", "IsStamp", c => c.Boolean(nullable: false));
            DropColumn("dbo.ChatDetails", "CommentNo");
        }
        
        public override void Down()
        {
            AddColumn("dbo.ChatDetails", "CommentNo", c => c.Int(nullable: false));
            DropColumn("dbo.ChatDetails", "IsStamp");
        }
    }
}
