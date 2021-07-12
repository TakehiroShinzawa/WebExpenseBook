using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebExpenseBook.Models
{
    public class WebJsonCategory
    {
        public int Depth { get; set; }
        public string CategoryName { get; set; }
    }
    public class WebJsonItem
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int ItemPrice { get; set; }
        public DateTime ItemDate { get; set; }
        public string Pattern { get; set; }
        public WebJsonCategory[] Category { get; set; }
    }
    public class WebJsonItemOnly
    {
        public string ItemName { get; set; }
    }
    public class WebJsonCategoryPrice
    {
        public string ParentName { get; set; }
        public string CategoryName { get; set; }
        public decimal CategotyPrice { get; set; }
    }
    public class WebJsonItemList
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public decimal ItemPrice { get; set; }
        public string ItemDate { get; set; }
    }

}