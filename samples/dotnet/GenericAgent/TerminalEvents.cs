using System.Threading.Channels;

namespace GenericAgent;

public sealed record TerminalEvent(
    string Id,
    string Name,
    string Output,
    bool IsStreaming,
    bool IsError = false,
    int? ExitCode = null,
    string? Title = null);

public sealed class TerminalEventChannel
{
    private readonly AsyncLocal<Channel<TerminalEvent>?> _currentChannel = new();

    public TerminalEventScope CreateScope()
    {
        var previousChannel = _currentChannel.Value;
        var channel = Channel.CreateUnbounded<TerminalEvent>();
        _currentChannel.Value = channel;
        return new TerminalEventScope(channel, () => _currentChannel.Value = previousChannel);
    }

    public ValueTask WriteAsync(TerminalEvent terminalEvent, CancellationToken cancellationToken)
    {
        var channel = _currentChannel.Value;
        return channel is null
            ? ValueTask.CompletedTask
            : channel.Writer.WriteAsync(terminalEvent, cancellationToken);
    }
}

public sealed class TerminalEventScope(
    Channel<TerminalEvent> channel,
    Action restorePreviousChannel) : IDisposable
{
    public IAsyncEnumerable<TerminalEvent> ReadAllAsync(CancellationToken cancellationToken) =>
        channel.Reader.ReadAllAsync(cancellationToken);

    public void Dispose()
    {
        channel.Writer.TryComplete();
        restorePreviousChannel();
    }
}
