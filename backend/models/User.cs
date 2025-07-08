using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace App2.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<Image> Images { get; set; } = new List<Image>();
    }
}