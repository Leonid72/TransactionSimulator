using FluentValidation;
using TransactionSimulator.Api.Common;

namespace TransactionSimulator.Api.Features.Transactions;

public class SubmitTransactionRequestValidator : AbstractValidator<SubmitTransactionRequest>
{
    public SubmitTransactionRequestValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .LessThanOrEqualTo(1_000_000);

        RuleFor(x => x.Currency)
            .NotEmpty()
            .Length(3)
            .Matches("^[A-Za-z]{3}$");

        RuleFor(x => x.Region)
            .NotEmpty()
            .Must(r => RegionTimezones.Resolve(r) is not null)
            .WithMessage($"Region must be one of: {string.Join(", ", RegionTimezones.SupportedRegions)}.");
    }
}
