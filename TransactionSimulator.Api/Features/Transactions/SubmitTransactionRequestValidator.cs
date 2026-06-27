using FluentValidation;
using TransactionSimulator.Api.Common;

namespace TransactionSimulator.Api.Features.Transactions;

public class SubmitTransactionRequestValidator : AbstractValidator<SubmitTransactionRequest>
{
    public SubmitTransactionRequestValidator()
    {
        RuleFor(x => x.Region)
            .NotEmpty()
            .Must(r => RegionTimezones.Resolve(r) is not null)
            .WithMessage($"Region must be one of: {string.Join(", ", RegionTimezones.SupportedRegions)}.");

        RuleFor(x => x.Hour)
            .InclusiveBetween(0, 23)
            .WithMessage("Hour must be between 0 and 23.");

        RuleFor(x => x.Minute)
            .InclusiveBetween(0, 59)
            .WithMessage("Minute must be between 0 and 59.");
    }
}
