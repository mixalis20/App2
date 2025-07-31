using System;
using System.IO;
using System.Threading.Tasks;
using Minio;

namespace App2
{
    public class MinioService
    {
        private readonly IMinioClient _client;
        private const string _endpoint = "minio:9000";
        private const string _accessKey = "George";
        private const string _secretKey = "George123";

        public MinioService(string endpoint, string accessKey, string secretKey)
        {
            _client = new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(accessKey, secretKey)
                .Build();
        }

        public async Task<bool> BucketExistsAsync(string bucketName)
        {
            var bucketExistsArgs = new Minio.DataModel.Args.BucketExistsArgs()
                .WithBucket(bucketName);
            return await _client.BucketExistsAsync(bucketExistsArgs);
        }

        public async Task MakeBucketAsync(string bucketName)
        {
            var makeBucketArgs = new Minio.DataModel.Args.MakeBucketArgs()
                .WithBucket(bucketName);
            await _client.MakeBucketAsync(makeBucketArgs);
        }

        public async Task PutObjectAsync(string bucketName, string objectName, Stream data, long objectSize, string contentType)
        {
            try
            {
                var putObjectArgs = new Minio.DataModel.Args.PutObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithStreamData(data)
                    .WithObjectSize(objectSize)
                    .WithContentType(contentType);
                await _client.PutObjectAsync(putObjectArgs);
            }
            catch (Exception ex)
            {
                // Log the error (use your preferred logging method)
                Console.WriteLine($"MinIO upload error: {ex.Message}");
                throw;
            }
        }

        internal async Task PutObjectAsync(string bucketName, string uniqueFileName, Stream stream, string contentType)
        {
            var putObjectArgs = new Minio.DataModel.Args.PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(uniqueFileName)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(contentType);
            await _client.PutObjectAsync(putObjectArgs);
        }
    }
}