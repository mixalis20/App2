using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Image
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string ImageUrl { get; set; }

    public List<Annotation> Annotations { get; set; } = new();

    public List<string> Tags { get; set; } = new();

    public List<string> Category { get; set; }

    public bool Deleted { get; set; } = false;
}

public class Annotation
{
    public string Title { get; set; }
    public string Description { get; set; }
}
