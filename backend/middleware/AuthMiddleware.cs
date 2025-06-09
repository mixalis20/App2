using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using Microsoft.IdentityModel.Tokens;

public class JwtHelper
{
    private readonly string _jwtSecret;

    public JwtHelper(string jwtSecret)
    {
        _jwtSecret = jwtSecret;
    }

    public string ValidateTokenAndGetUserId(string token)
    {
        if (string.IsNullOrEmpty(token))
            throw new ArgumentException("No token provided");

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var key = System.Text.Encoding.UTF8.GetBytes(_jwtSecret);

            // Validate token parameters
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),

                ValidateIssuer = false,   // set true if you want to validate issuer
                ValidateAudience = false, // set true if you want to validate audience

                ClockSkew = TimeSpan.Zero // optional: no clock skew allowed
            };

            // Validate token and get principal
            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

            // Extract userId claim
            var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "userId");

            if (userIdClaim == null)
                throw new SecurityTokenException("UserId claim not found");

            return userIdClaim.Value;
        }
        catch (Exception ex)
        {
            // You can catch specific exceptions if needed, e.g. SecurityTokenExpiredException
            throw new SecurityTokenException("Invalid or expired token", ex);
        }
    }
}
