namespace GridFrequency.Api;

/// <summary>One frequency measurement.</summary>
public record FrequencySample(DateTimeOffset Timestamp, double Hz);
