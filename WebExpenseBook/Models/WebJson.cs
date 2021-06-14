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
        public string ItemName { get; set; }
        public int ItemPrice { get; set; }
        public DateTime ItemDate { get; set; }
        public WebJsonCategory[] Category { get; set; }
    }
    public class WebJsonItemOnly
    {
        public string ItemName { get; set; }
    }

}