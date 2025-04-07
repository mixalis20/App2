using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using System.Threading.Tasks;
using System.Linq;
using MongoDB.Driver;

namespace App2.Models
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public AuthenticationMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue("Authorization", out StringValues authorizationHeader))
            {
                var token = authorizationHeader.ToString().Split(" ")[1];

                if (string.IsNullOrEmpty(token))
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("{\"error\": \"No token provided\"}");
                    return;
                }

                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var key = _configuration["JWT_SECRET"];

                    var tokenS = handler.ReadJwtToken(token);
                    if (tokenS == null)
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("{\"error\": \"Invalid or expired token\"}");
                        return;
                    }

                    context.Items["UserId"] = tokenS.Claims.First(c => c.Type == "userId").Value;
                    await _next(context);
                }
                catch (Exception)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("{\"error\": \"Invalid or expired token\"}");
                }
            }
            else
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("{\"error\": \"No token provided\"}");
            }
        }
    }
}
