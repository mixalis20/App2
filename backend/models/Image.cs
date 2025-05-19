using App2;
using MongoDB.Bson;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class Image
{
    public ObjectId Id { get; set; }

    [Required]
    public string ImageUrl { get; set; }

    public List<Annotation> Annotations { get; set; } = new();

    public List<string> Tags { get; set; } = new();

    public List<string> Category { get; set; }

    public bool Deleted { get; set; } = false;
}
