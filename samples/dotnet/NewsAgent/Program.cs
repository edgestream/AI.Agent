using AI.Agent.Client;
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;
using NewsAgent.Tool;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAIChatClient();
builder.Services.AddHttpClient("news");
builder.Services.AddAIAgent("news", (sp, key) =>
{
    var chatClient = sp.GetRequiredService<IChatClient>();
    return chatClient.AsAIAgent(
        new ChatClientAgentOptions
        {
            Name = key,
            Description = "News and information agent",
            ChatOptions = new ChatOptions
            {
                Instructions = "Gather news only by calling tools. Format output as Markdown.",
                Tools = [NewsFetcherFunctionFactory.CreateAIFunction(sp)],
            },
        },
        loggerFactory: sp.GetService<ILoggerFactory>(),
        services: sp);
});

var app = builder.Build();

app.MapAGUI("news", "/");

app.Run();
