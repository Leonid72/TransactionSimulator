namespace TransactionSimulator.Api.Features.Transactions;

public record SubmitTransactionRequest(string Region, int Hour, int Minute);
