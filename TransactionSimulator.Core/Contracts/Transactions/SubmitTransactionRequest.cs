namespace TransactionSimulator.Core.Contracts.Transactions;

public record SubmitTransactionRequest(string Region, int Hour, int Minute);
