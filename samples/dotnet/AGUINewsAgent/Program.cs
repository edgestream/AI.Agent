using Microsoft.Agents.AI.Hosting;
using Microsoft.Agents.AI.Hosting.AGUI.AspNetCore;
using Microsoft.Extensions.AI;
using OpenAI;
using OpenAI.Responses;
using System.ClientModel;

#pragma warning disable OPENAI001 // OpenAIClient.GetResponsesClient() is experimental and may change or be removed in a future release
#pragma warning disable MAAI001 // OpenAIResponsesClient.AsIChatClientWithStoredOutputDisabled() is experimental and may change or be removed in a future release

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin());
});
builder.Services.AddTransient(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var apiKey = configuration["OpenAI:ApiKey"];
    if (string.IsNullOrEmpty(apiKey)) throw new InvalidOperationException("OpenAI:ApiKey is required.");
    var credential = new ApiKeyCredential(apiKey);
    var openAIOptions = new OpenAIClientOptions();
    var endpoint = configuration["OpenAI:Endpoint"];
    if (!string.IsNullOrWhiteSpace(endpoint)) openAIOptions.Endpoint = new Uri(endpoint);
    var openAIClient = new OpenAIClient(credential, openAIOptions);
    var model = configuration["OpenAI:Model"] ?? "gpt-5.4";
    return openAIClient.GetResponsesClient().AsIChatClientWithStoredOutputDisabled(model);
});
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

app.UseCors();
app.MapAGUI("news", "/");
app.Run();
