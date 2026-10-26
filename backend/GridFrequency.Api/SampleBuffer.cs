namespace GridFrequency.Api;

/// <summary>Thread-safe in-memory ring buffer: once full, the oldest sample is overwritten.</summary>
public class SampleBuffer(int capacity = 1800) // 15 min at one sample per 500 ms
{
    private readonly FrequencySample[] _items = new FrequencySample[capacity];
    private readonly Lock _lock = new();
    private int _next;  // index the next sample is written to
    private int _count;

    public void Add(FrequencySample sample)
    {
        lock (_lock)
        {
            _items[_next] = sample;
            _next = (_next + 1) % _items.Length;
            _count = Math.Min(_count + 1, _items.Length);
        }
    }

    /// <summary>Samples at or after <paramref name="since"/>, oldest first.</summary>
    public IReadOnlyList<FrequencySample> GetSince(DateTimeOffset since)
    {
        lock (_lock)
        {
            var result = new List<FrequencySample>(_count);
            var start = (_next - _count + _items.Length) % _items.Length;
            for (var i = 0; i < _count; i++)
            {
                var sample = _items[(start + i) % _items.Length];
                if (sample.Timestamp >= since) result.Add(sample);
            }
            return result;
        }
    }
}
