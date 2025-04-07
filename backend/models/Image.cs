using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace App2.Models
{
    public class Image
    {
        [BsonId]
        public ObjectId Id { get; set; }
        
        public string Name { get; set; }
        public byte[] ImageData { get; set; }
        public string ContentType { get; set; }
        
        // Σχέση εικόνας με χρήστη - κάθε εικόνα ανήκει σε έναν χρήστη
        public ObjectId UserId { get; set; }
    }
}

