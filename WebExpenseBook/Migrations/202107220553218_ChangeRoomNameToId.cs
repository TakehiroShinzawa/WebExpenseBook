namespace WebExpenseBook.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeRoomNameToId : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.ChatDetails", "RoomID", c => c.Int(nullable: false));
            DropColumn("dbo.ChatDetails", "RoomName");
        }
        
        public override void Down()
        {
            AddColumn("dbo.ChatDetails", "RoomName", c => c.String(nullable: false, maxLength: 64));
            DropColumn("dbo.ChatDetails", "RoomID");
        }
    }
}
