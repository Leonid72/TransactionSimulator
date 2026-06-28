using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TransactionSimulator.Core.Common;
using TransactionSimulator.Core.Entities;
using TransactionSimulator.Infrastructure.Data;

namespace TransactionSimulator.Api.Extensions;

public static class IdentityExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddIdentityCore<AppUser>(options =>
            {
                options.Password.RequiredLength        = 8;
                options.Password.RequireUppercase      = true;
                options.Password.RequireLowercase      = true;
                options.Password.RequireDigit          = false;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail        = true;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>>((bearerOptions, jwtOptions) =>
            {
                var opts       = jwtOptions.Value;
                var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Key));

                bearerOptions.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer           = true,
                    ValidIssuer              = opts.Issuer,
                    ValidateAudience         = true,
                    ValidAudience            = opts.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = signingKey,
                    ValidateLifetime         = true,
                    ClockSkew                = TimeSpan.FromSeconds(30)
                };
            });

        services.AddAuthorization();
        return services;
    }
}
