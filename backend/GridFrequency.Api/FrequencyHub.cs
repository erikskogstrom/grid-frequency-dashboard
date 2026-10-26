using Microsoft.AspNetCore.SignalR;

namespace GridFrequency.Api;

/// <summary>Server-to-client only: the worker pushes "sample" messages, clients send nothing.</summary>
public class FrequencyHub : Hub
{
    public const string SampleMethod = "sample";
}
