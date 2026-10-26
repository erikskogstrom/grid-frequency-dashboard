using GridFrequency.Api;

namespace GridFrequency.Api.Tests;

public class FrequencySimulatorTests
{
    private static readonly TimeSpan Tick = TimeSpan.FromMilliseconds(500);

    // A fixed seed makes the "random" walk reproducible, so the tests are not flaky.
    private static FrequencySimulator CreateSimulator(int seed = 42) => new(new Random(seed));

    private static List<double> Run(FrequencySimulator simulator, int ticks) =>
        Enumerable.Range(0, ticks).Select(_ => simulator.Step(Tick)).ToList();

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    public void Without_disturbance_stays_in_a_sane_band(int seed)
    {
        var values = Run(CreateSimulator(seed), ticks: 7200); // one hour

        Assert.All(values, hz => Assert.InRange(hz, 49.8, 50.2));
        Assert.InRange(values.Average(), 49.97, 50.03);
    }

    [Fact]
    public void Disturbance_dips_towards_49_6_and_recovers()
    {
        var simulator = CreateSimulator();
        Run(simulator, 20); // let the random walk settle first

        simulator.TriggerDisturbance();
        var during = Run(simulator, 60); // 30 s, longer than the 28 s disturbance
        var after = Run(simulator, 60);

        Assert.InRange(during.Min(), 49.5, 49.7);
        Assert.All(after.TakeLast(20), hz => Assert.InRange(hz, 49.8, 50.2));
    }

    [Fact]
    public void Recovery_takes_20_to_30_seconds()
    {
        var simulator = CreateSimulator();
        simulator.TriggerDisturbance();
        var values = Run(simulator, 120);

        var lastLow = values.FindLastIndex(hz => hz < 49.9);
        var recoverySeconds = (lastLow + 1) * Tick.TotalSeconds;

        Assert.InRange(recoverySeconds, 20, 30);
    }
}
