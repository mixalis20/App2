using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System.IO;
using System.Text;
using System;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;

namespace App2
{
    // MongoDB context
    public class MongoDBContext
    {
        private readonly IMongoDatabase _database;

        public MongoDBContext(string connectionString)
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("ImageDatabase");
            _database = client.GetDatabase("UserDatabase");
        }

        public IMongoCollection<Image> Images => _database.GetCollection<Image>("Images");
        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    }

    // Models
    public class User
    {
        public ObjectId Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ObjectId> ImageIds { get; set; } = new List<ObjectId>();
    }

    public class Image
    {
        [Key]
        public ObjectId Id { get; set; }

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

    // DTOs
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

    // Controller
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

            return CreatedAtAction(nameof(GetUser), new { id = user.Id.ToString() }, new
            {
                user.Id,
                user.Username,
                user.PasswordHash,
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
        [Authorize]
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

        [HttpPost("api/images")]
        [Authorize]
        public async Task<IActionResult> UploadImageForAuthenticatedUser([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!ObjectId.TryParse(userId, out var userObjectId))
                return Unauthorized("Invalid user ID in token.");

            var user = await _context.Users.Find(u => u.Id == userObjectId).FirstOrDefaultAsync();
            if (user == null)
                return NotFound("User not found.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/{uniqueFileName}";

            var image = new Image
            {
                ImageUrl = imageUrl,
                Category = new List<string>(),
                Tags = new List<string>(),
                Annotations = new List<Annotation>()
            };

            await _context.Images.InsertOneAsync(image);

            user.ImageIds.Add(image.Id);
            var update = Builders<User>.Update.Set(u => u.ImageIds, user.ImageIds);
            await _context.Users.UpdateOneAsync(u => u.Id == userObjectId, update);

            return CreatedAtAction(nameof(GetImage), new { id = image.Id.ToString() }, new
            {
                image.Id,
                image.ImageUrl
            });
        }

        [HttpGet("images/{id}")]
        public async Task<IActionResult> GetImage(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid image ID format.");

            var image = await _context.Images.Find(i => i.Id == objectId).FirstOrDefaultAsync();
            if (image == null)
                return NotFound();

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", image.ImageUrl.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
                return NotFound("Image file not found on server.");

            var contentType = GetContentType(fullPath);
            var imageData = await System.IO.File.ReadAllBytesAsync(fullPath);
            return File(imageData, contentType, Path.GetFileName(fullPath));
        }

        private string GetContentType(string path)
        {
            var types = new Dictionary<string, string>
            {
                { ".jpg", "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".png", "image/png" },
                { ".gif", "image/gif" }
            };

            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types.ContainsKey(ext) ? types[ext] : "application/octet-stream";
        }

        private string GenerateJwtToken(string userId)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, userId)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    // Startup
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public string ConnectionString { get; private set; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

           var mongoConnectionString = Configuration["MongoDB:ConnectionString"];
           services.AddSingleton(new MongoDBContext(mongoConnectionString));


            var key = Encoding.ASCII.GetBytes(Configuration["Jwt:Secret"]);
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();
            else
                app.UseExceptionHandler("/Home/Error");

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
