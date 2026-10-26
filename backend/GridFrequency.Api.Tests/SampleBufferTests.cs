namespace GridFrequency.Api.Tests;

public class SampleBufferTests
{
    private static readonly DateTimeOffset Start = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    private static FrequencySample At(int second) => new(Start.AddSeconds(second), 50);

    [Fact]
    public void Overwrites_oldest_samples_when_full()
    {
        var buffer = new SampleBuffer(capacity: 3);
        for (var i = 0; i < 5; i++) buffer.Add(At(i));

        var all = buffer.GetSince(DateTimeOffset.MinValue);

        Assert.Equal([At(2), At(3), At(4)], all);
    }

    [Fact]
    public void GetSince_filters_by_timestamp()
    {
        var buffer = new SampleBuffer(capacity: 10);
        for (var i = 0; i < 5; i++) buffer.Add(At(i));

        Assert.Equal([At(3), At(4)], buffer.GetSince(Start.AddSeconds(3)));
    }
}
