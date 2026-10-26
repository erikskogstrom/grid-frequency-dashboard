using GridFrequency.Api;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults(); // OpenTelemetry (logs, traces, metrics), health checks, service discovery

builder.Services.AddSignalR();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<FrequencySimulator>();
builder.Services.AddSingleton<SampleBuffer>();
builder.Services.AddHostedService<SimulationWorker>();

var app = builder.Build();

app.MapDefaultEndpoints();

app.MapHub<FrequencyHub>("/hubs/frequency");

app.MapGet("/api/history", (int? minutes, SampleBuffer buffer, TimeProvider time) =>
{
    var window = TimeSpan.FromMinutes(Math.Clamp(minutes ?? 5, 1, 15));
    return buffer.GetSince(time.GetUtcNow() - window);
});

app.MapPost("/api/disturbance", (FrequencySimulator simulator) =>
{
    simulator.TriggerDisturbance();
    return Results.Accepted();
});

app.Run();
