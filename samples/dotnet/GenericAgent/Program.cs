using AI.Agent.Client;
using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAIChatClient();
builder.Services.AddAIAgent("generic", (sp, key) =>
{
    var chatClient = sp.GetRequiredService<IChatClient>();
    return chatClient.AsAIAgent(
        name: key,
        description: "Helpful assistant",
        instructions: "You are a helpful assistant.",
        services: sp);
});

var app = builder.Build();

app.MapAGUI("generic", "/");

app.Run();
