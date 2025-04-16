using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text;
using System;

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
        private readonly IConfiguration _configuration;

        public UserController(MongoDBContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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

            return CreatedAtAction(nameof(GetUser), new { id = user.Id.ToString() }, new {
                user.Id,
                user.Username,
                user.CreatedAt
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            if (loginDto == null || string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
                return BadRequest("Invalid login data.");

            var user = await _context.Users.Find(u => u.Username == loginDto.Username).FirstOrDefaultAsync();
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            var token = GenerateJwtToken(user.Id.ToString());
            return Ok(new { Token = token });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid user ID format.");

            var user = await _context.Users.Find(u => u.Id == objectId).FirstOrDefaultAsync();
            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.Id,
                user.Username,
                user.CreatedAt,
                user.ImageIds
            });
        }

        [HttpPost("{userId}/images")]
        public async Task<IActionResult> UploadImageForUser(string userId, [FromForm] IFormFile file)
        {
            if (!ObjectId.TryParse(userId, out var userObjectId))
                return BadRequest("Invalid user ID format.");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

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

            return CreatedAtAction(nameof(GetImage), new { id = image.Id.ToString() }, new
            {
                image.Id,
                image.Name,
                image.ContentType
            });
        }

        [HttpGet("images/{id}")]
        public async Task<IActionResult> GetImage(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid image ID format.");

            var image = await _context.Images.Find(img => img.Id == objectId).FirstOrDefaultAsync();
            if (image == null)
                return NotFound();

            return File(image.ImageData, image.ContentType, image.Name);
        }

        private string GenerateJwtToken(string userId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim("userId", userId)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
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

    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSingleton(new MongoDBContext(Configuration["MongoDB:ConnectionString"]));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
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
                endpoints.MapControllers(); // Using attribute routing
            });
        }
    }
}
