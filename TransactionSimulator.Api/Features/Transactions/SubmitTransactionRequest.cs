namespace TransactionSimulator.Api.Features.Transactions;

public record SubmitTransactionRequest(decimal Amount, string Currency = "USD", string Region = "");
