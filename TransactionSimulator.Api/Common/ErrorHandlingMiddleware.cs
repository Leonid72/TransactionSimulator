using System.Diagnostics;
using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TransactionSimulator.Core.Common;
using TransactionSimulator.Core.Entities;
using TransactionSimulator.Infrastructure.Data;

namespace TransactionSimulator.Api.Common;

public class ErrorHandlingMiddleware(
    RequestDelegate next,
    IServiceScopeFactory scopeFactory,
    ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await HandleAsync(context, HttpStatusCode.UnprocessableEntity, "Validation", ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            await HandleAsync(context, HttpStatusCode.Unauthorized, "Warning", ex.Message);
        }
        catch (SecurityTokenException ex)
        {
            await HandleAsync(context, HttpStatusCode.Unauthorized, "Warning", ex.Message);
        }
        catch (DbUpdateException ex)
        {
            await HandleAsync(context, HttpStatusCode.BadRequest, "Error", ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            await HandleAsync(context, HttpStatusCode.BadRequest, "Error", ex.Message);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, HttpStatusCode.InternalServerError, "Critical", ex.Message);
        }
    }

    private async Task HandleAsync(HttpContext context, HttpStatusCode statusCode, string level, string message)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.ApplicationLogs.Add(new ApplicationLog { Level = level, Message = message, TraceId = traceId });
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Failed to write to ApplicationLogs. TraceId={TraceId} Level={Level} Message={Message}",
                    traceId, level, message);
            }
        });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)statusCode;

        var response = new ApiResponse<object> { IsSuccessful = false, Message = message, TraceId = traceId };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
