using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebExpenseBook.Models
{
    public class MainItem
    {
        public int Id { get; set; }

        public DateTime ItemDate { get; set; }

        [Required]
        [StringLength(64)]
        public string OwnerName { get; set; }

        [Required]
        [StringLength(128)]
        public string ItemName { get; set; }

        [Required]
        public decimal ItemPrice { get; set; }

        [StringLength(16)]
        public string Pattern { get; set; }

        public DateTime CreateAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime UpdateAt { get; set; }

    }
    public class Category
    {
        public int Id { get; set; }

        [Required]
        public int MainItemId { get; set; }

        [Required]
        public int CategoryDepth { get; set; }

        [Required]
        public int ParentId { get; set; }

        [Required]
        [StringLength(128)]
        public string ParentName { get; set; }


        [Required]
        [StringLength(32)]
        public string CategoryName { get; set; }

        public DateTime CreateAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime UpdateAt { get; set; }


    }
}