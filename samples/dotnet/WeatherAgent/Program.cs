using AI.Agent.Client;
using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAIChatClient();
builder.Services.AddAIAgent("weather", (sp, key) =>
{
    var chatClient = sp.GetRequiredService<IChatClient>();
    return chatClient.AsAIAgent(
        name: key,
        description: "Weather forecast and weather Q&A assistant.",
        instructions: """
            You are a demo weather assistant. Answer weather questions clearly,
            explain when you are using general knowledge instead of live weather
            data, and keep forecasts practical and concise.
            """,
        services: sp);
});

var app = builder.Build();

app.MapAGUI("weather", "/");

app.Run();
