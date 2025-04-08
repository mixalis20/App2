using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;  
using MongoDB.Driver;
using Microsoft.Extensions.Hosting; 
using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace App2
{
    public class MongoDBContext
    {
        private readonly IMongoDatabase _database;

        public MongoDBContext(string connectionString)
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("ImageDatabase");
        }

        public IMongoCollection<Image> Images => _database.GetCollection<Image>("Images");
        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    }

    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MongoDBContext _context;

        public UserController(MongoDBContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto userDto)
        {
            if (userDto == null || string.IsNullOrEmpty(userDto.Username) || string.IsNullOrEmpty(userDto.Password))
                return BadRequest("Invalid user data.");

            var existingUser = await _context.Users.Find(u => u.Username == userDto.Username).FirstOrDefaultAsync();
            if (existingUser != null)
                return BadRequest("User already exists.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);

            var user = new User
            {
                Username = userDto.Username,
                PasswordHash = hashedPassword,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(user);

            return CreatedAtAction(nameof(GetUser), new { id = user.Id.ToString() }, user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            if (loginDto == null || string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
                return BadRequest("Invalid login data.");

            var user = await _context.Users.Find(u => u.Username == loginDto.Username).FirstOrDefaultAsync();
            if (user == null)
                return Unauthorized("Invalid username or password.");

            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            return Ok("Login successful.");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var objectId = new ObjectId(id);
            var user = await _context.Users.Find(u => u.Id == objectId).FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost("{userId}/images")]
        public async Task<IActionResult> UploadImageForUser(string userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var userObjectId = new ObjectId(userId);

            var imageData = new byte[file.Length];
            using (var stream = file.OpenReadStream())
            {
                await stream.ReadAsync(imageData, 0, (int)file.Length);
            }

            var image = new Image
            {
                Name = file.FileName,
                ImageData = imageData,
                ContentType = file.ContentType,
                UserId = userObjectId
            };

            await _context.Images.InsertOneAsync(image);

            var update = Builders<User>.Update.Push(u => u.ImageIds, image.Id);
            await _context.Users.UpdateOneAsync(u => u.Id == userObjectId, update);

            return CreatedAtAction(nameof(GetImage), new { id = image.Id.ToString() }, image);
        }

        [HttpGet("images/{id}")]
        public async Task<IActionResult> GetImage(string id)
        {
            var objectId = new ObjectId(id);
            var image = await _context.Images.Find(img => img.Id == objectId).FirstOrDefaultAsync();

            if (image == null)
                return NotFound();

            return File(image.ImageData, image.ContentType, image.Name);
        }
    }

    // DTOs for User Register and Login
    public class UserRegisterDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class UserLoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    // Example of Image and User classes
    public class Image
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public byte[] ImageData { get; set; }
        public string ContentType { get; set; }
        public ObjectId UserId { get; set; }
    }

    public class User
    {
        public ObjectId Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ObjectId> ImageIds { get; set; } = new List<ObjectId>();
    }

    // Startup class to configure the app
    public class Startup
    {
        public void ConfigureServices(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "App2",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}