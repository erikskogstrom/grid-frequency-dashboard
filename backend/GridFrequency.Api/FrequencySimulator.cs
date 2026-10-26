namespace GridFrequency.Api;

/// <summary>
/// Simulated grid frequency. Pure logic: no clock, no SignalR, so it is easy to test.
/// The value is a mean-reverting random walk (Ornstein-Uhlenbeck) around 50 Hz,
/// plus an optional disturbance offset (sudden generation loss) on top.
/// </summary>
public class FrequencySimulator(Random? random = null)
{
    public const double Nominal = 50.0;

    // Mean reversion strength per second. Together with Sigma this gives a stationary
    // standard deviation of Sigma / sqrt(2 * Theta) = about 0.03 Hz, so the value
    // normally stays inside 49.9-50.1 Hz.
    private const double Theta = 0.1;
    private const double Sigma = 0.0134;

    // Disturbance profile: fast fall to the nadir, then a linear recovery.
    private const double DisturbanceDepthHz = 0.4; // nadir is about 49.6 Hz
    private const double FallSeconds = 3;
    private const double RecoverySeconds = 25;     // 28 s in total

    private readonly Random _random = random ?? new Random();
    private readonly Lock _lock = new();
    private double _deviation; // random-walk part, Hz relative to nominal
    private double? _disturbanceAge; // seconds since the disturbance began, null = none

    public void TriggerDisturbance()
    {
        lock (_lock) _disturbanceAge = 0;
    }

    /// <summary>Advances the simulation by <paramref name="dt"/> and returns the new frequency in Hz.</summary>
    public double Step(TimeSpan dt)
    {
        var seconds = dt.TotalSeconds;
        lock (_lock)
        {
            _deviation += -Theta * _deviation * seconds
                          + Sigma * Math.Sqrt(seconds) * NextGaussian();

            var offset = 0.0;
            if (_disturbanceAge is { } age)
            {
                _disturbanceAge = age + seconds;
                offset = DisturbanceOffset(_disturbanceAge.Value);
                if (_disturbanceAge >= FallSeconds + RecoverySeconds) _disturbanceAge = null;
            }

            return Nominal + _deviation + offset;
        }
    }

    private static double DisturbanceOffset(double age) =>
        age < FallSeconds
            ? -DisturbanceDepthHz * age / FallSeconds
            : -DisturbanceDepthHz * Math.Max(0, 1 - (age - FallSeconds) / RecoverySeconds);

    // Box-Muller transform: turns two uniform numbers into one standard normal number.
    private double NextGaussian()
    {
        var u1 = 1.0 - _random.NextDouble(); // (0, 1], avoids log(0)
        var u2 = _random.NextDouble();
        return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Cos(2.0 * Math.PI * u2);
    }
}
