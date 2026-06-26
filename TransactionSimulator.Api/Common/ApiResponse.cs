namespace TransactionSimulator.Api.Common;

public class ApiResponse<T>
{
    public bool IsSuccessful { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string? TraceId { get; set; }

    public static ApiResponse<T> Success(T data, string? message = null) => new()
    {
        IsSuccessful = true,
        Data = data,
        Message = message
    };
}
