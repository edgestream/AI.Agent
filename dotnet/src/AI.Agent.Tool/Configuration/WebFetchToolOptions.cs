namespace AI.Agent.Tool.Configuration;

public sealed class WebFetchToolOptions
{
    public const string SectionName = "WebFetchTool";

    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(10);

    public int MaxContentCharacters { get; set; } = 24_000;
}
