using AI.Agent.Client;
using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAIChatClient();
builder.Services.AddAIAgent("news", (sp, key) =>
{
    var chatClient = sp.GetRequiredService<IChatClient>();
    return chatClient.AsAIAgent(
        name: key,
        description: "Fictional satirical news story writer.",
        instructions: """
            You are a demo writer for clearly fictional satirical news and you create
            a maximum of three playful fake news headlines and news briefs on request.
            """,
        services: sp);
});

var app = builder.Build();

app.MapAGUI("news", "/");

app.Run();
