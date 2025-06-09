using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using App2;

namespace App2.Models
{
    public class Image
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ImageUrl { get; set; }

        public List<Annotation> Annotations { get; set; } = new();
        public List<ImageTag> Tags { get; set; } = new();
        public List<ImageCategory> Categories { get; set; } = new();

        public bool Deleted { get; set; } = false;

        public int UserId { get; set; }
        public User User { get; set; }
    }

    public class Annotation
    {
        [Key]
        public int Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }

        public int ImageId { get; set; }
        public Image Image { get; set; }
    }
    
    public class ImageTag
    {
        [Key]
        public int Id { get; set; }
        public string Value { get; set; }

        public int ImageId { get; set; }
        public Image Image { get; set; }
    }

    public class ImageCategory
    {
        [Key]
        public int Id { get; set; }
        public string Value { get; set; }

        public int ImageId { get; set; }
        public Image Image { get; set; }
    }
}



