using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;


namespace App2.Models
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; }
        
        public string Username { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Σχέση χρήστη με εικόνες - ο χρήστης μπορεί να έχει πολλές εικόνες
        public List<ObjectId> ImageIds { get; set; } = new List<ObjectId>();
    }

}
