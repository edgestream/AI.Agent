using AI.Agent.Client;
using GenericAgent;
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAIChatClient();
builder.Services.AddSingleton<TerminalEventChannel>();
builder.Services.AddAIAgent("generic", (sp, key) =>
{
    var chatClient = sp.GetRequiredService<IChatClient>();
    var terminalEvents = sp.GetRequiredService<TerminalEventChannel>();
    var innerAgent = chatClient.AsAIAgent(
        new ChatClientAgentOptions
        {
            Name = key,
            Description = "Helpful assistant",
            ChatOptions = new ChatOptions
            {
                Instructions = """
                You are a helpful assistant.
                When asked to run a terminal command, call run_terminal.
                Terminal output is already visible to the user in the UI,
                so use it to answer but do not repeat the raw output unless
                the user explicitly asks.
                """,
                Tools = [TerminalFunctionFactory.CreateAIFunction(sp)],
            },
        },
        loggerFactory: sp.GetService<ILoggerFactory>(),
        services: sp);

    return new TerminalStreamingAgent(innerAgent, terminalEvents);
});

var app = builder.Build();

app.MapAGUI("generic", "/");

app.Run();
