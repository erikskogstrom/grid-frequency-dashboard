using Microsoft.AspNetCore.SignalR;

namespace GridFrequency.Api;

/// <summary>Produces one sample every 500 ms, stores it and pushes it to all connected clients.</summary>
public class SimulationWorker(
    FrequencySimulator simulator,
    SampleBuffer buffer,
    IHubContext<FrequencyHub> hub,
    TimeProvider time) : BackgroundService
{
    public static readonly TimeSpan Interval = TimeSpan.FromMilliseconds(500);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval, time);
        do
        {
            var sample = new FrequencySample(time.GetUtcNow(), simulator.Step(Interval));
            buffer.Add(sample);
            await hub.Clients.All.SendAsync(FrequencyHub.SampleMethod, sample, stoppingToken);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
