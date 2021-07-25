namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Chat : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ChatDetails",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RoomName = c.String(nullable: false),
                        CommentNo = c.Int(nullable: false),
                        Name = c.String(nullable: false),
                        Comment = c.String(),
                        UpdateTime = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.RoomInfoes",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RoomName = c.String(nullable: false),
                        Name = c.String(nullable: false),
                        CreateTime = c.DateTime(nullable: false),
                        LastCommntTime = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.RoomInfoes");
            DropTable("dbo.ChatDetails");
        }
    }
}
