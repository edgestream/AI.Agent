namespace AI.Agent.Client.Configuration;

public sealed class OpenAISettings
{
    public const string SectionName = "OpenAI";

    public string? ApiKey { get; set; }

    public string? Endpoint { get; set; }

    public string Model { get; set; } = "gpt-5.4";
}
