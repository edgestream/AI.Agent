using System.Threading.Channels;
using System.Text;
using System.Text.Json;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;

namespace GenericAgent;

public sealed class TerminalStreamingAgent(AIAgent innerAgent, TerminalEventChannel terminalEvents) : AIAgent
{
    protected override string IdCore => innerAgent.Id;

    public override string Name => innerAgent.Name ?? "";

    public override string Description => innerAgent.Description ?? "";

    public override object? GetService(Type serviceType, object? serviceKey = null) =>
        innerAgent.GetService(serviceType, serviceKey);

    protected override ValueTask<AgentSession> CreateSessionCoreAsync(CancellationToken cancellationToken) =>
        innerAgent.CreateSessionAsync(cancellationToken);

    protected override ValueTask<System.Text.Json.JsonElement> SerializeSessionCoreAsync(
        AgentSession session,
        System.Text.Json.JsonSerializerOptions? jsonSerializerOptions,
        CancellationToken cancellationToken) =>
        innerAgent.SerializeSessionAsync(session, jsonSerializerOptions, cancellationToken);

    protected override ValueTask<AgentSession> DeserializeSessionCoreAsync(
        System.Text.Json.JsonElement serializedSession,
        System.Text.Json.JsonSerializerOptions? jsonSerializerOptions,
        CancellationToken cancellationToken) =>
        innerAgent.DeserializeSessionAsync(serializedSession, jsonSerializerOptions, cancellationToken);

    protected override Task<AgentResponse> RunCoreAsync(
        IEnumerable<ChatMessage> messages,
        AgentSession? session,
        AgentRunOptions? options,
        CancellationToken cancellationToken) =>
        innerAgent.RunAsync(messages, session, options, cancellationToken);

    protected override async IAsyncEnumerable<AgentResponseUpdate> RunCoreStreamingAsync(
        IEnumerable<ChatMessage> messages,
        AgentSession? session,
        AgentRunOptions? options,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var updates = Channel.CreateUnbounded<AgentResponseUpdate>();
        using var terminalScope = terminalEvents.CreateScope();
        using var terminalCancellation = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

        var terminalTask = Task.Run(async () =>
        {
            try
            {
                await foreach (var terminalEvent in terminalScope.ReadAllAsync(terminalCancellation.Token))
                {
                    await updates.Writer.WriteAsync(
                        new AgentResponseUpdate
                        {
                            RawRepresentation = new ChatResponseUpdate(
                                ChatRole.Assistant,
                                [new DataContent(ToJsonPatch(terminalEvent), "application/json-patch+json")]),
                        },
                        terminalCancellation.Token);
                }
            }
            catch (OperationCanceledException)
            {
            }
        }, CancellationToken.None);

        var innerTask = Task.Run(async () =>
        {
            try
            {
                await foreach (var update in innerAgent.RunStreamingAsync(messages, session, options, cancellationToken))
                {
                    await updates.Writer.WriteAsync(update, cancellationToken);
                }
            }
            finally
            {
                await terminalCancellation.CancelAsync();
                await terminalTask;
                updates.Writer.TryComplete();
            }
        }, CancellationToken.None);

        await foreach (var update in updates.Reader.ReadAllAsync(cancellationToken))
        {
            yield return update;
        }

        await innerTask;
    }

    private static byte[] ToJsonPatch(TerminalEvent terminalEvent) =>
        Encoding.UTF8.GetBytes(JsonSerializer.Serialize(
            new[]
            {
                new
                {
                    op = "add",
                    path = "/terminalEvents/-",
                    value = new
                    {
                        id = terminalEvent.Id,
                        output = terminalEvent.Output,
                        isStreaming = terminalEvent.IsStreaming,
                        isError = terminalEvent.IsError,
                        exitCode = terminalEvent.ExitCode,
                        title = terminalEvent.Title,
                    },
                },
            },
            JsonSerializerOptions.Web));
}
