using AI.Agent.Client;
using AI.Agent.Tool;
using AI.Agent.Tool.Web;
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAIChatClient();
builder.Services.AddWebFetchTool();
builder.Services.AddAIAgent("news", (sp, key) =>
{
    var chatClient = sp.GetRequiredService<IChatClient>();
    var webFetchTool = sp.GetRequiredService<WebFetchTool>().AsAIFunction();

    return chatClient.AsAIAgent(
        new ChatClientAgentOptions
        {
            Name = key,
            Description = "Fictional satirical news story writer with a web fetch tool.",
            ChatOptions = new ChatOptions
            {
                Instructions = """
                    You are a demo writer for clearly fictional satirical news.
                    When the user asks about a web page, URL, or source text that you cannot know from the
                    conversation, call the fetch_web_page tool before answering. Use fetched page text only
                    as background context, and keep the final output clearly fictional and satirical.
                    Create a maximum of three playful fake news headlines and news briefs on request.
                    """,
                Tools = [webFetchTool],
            },
        },
        loggerFactory: sp.GetService<ILoggerFactory>(),
        services: sp);
});

var app = builder.Build();

app.MapAGUI("news", "/");

app.Run();
