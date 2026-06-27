using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using TransactionSimulator.Api.Common;
using TransactionSimulator.Api.Features.Transactions;

namespace TransactionSimulator.Api.Extensions;

public class SubmitTransactionSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type != typeof(SubmitTransactionRequest)) return;

        if (schema.Properties.TryGetValue("region", out var region))
            region.Enum = RegionTimezones.SupportedRegions
                .Select(r => (IOpenApiAny)new OpenApiString(r))
                .ToList();
    }
}
