namespace AI.Agent.Client.Configuration;

/// <summary>
/// Represents the settings for configuring the OpenAI client, including API key, endpoint, and model information.
/// </summary>
public sealed class OpenAISettings
{
    /// <summary>
    /// The name of the configuration section for OpenAI settings, used for binding configuration values.
    /// </summary>
    public const string SectionName = "OpenAI";
    /// <summary>
    /// Gets or sets the API key for authenticating with the OpenAI service. This key is required to access the OpenAI API and should be kept secure.
    /// </summary>
    public string? ApiKey { get; set; }
    /// <summary>
    /// Gets or sets the endpoint URL for the OpenAI API. This is the base URL where the OpenAI service is hosted. If not specified, it will default to the standard OpenAI API endpoint.
    /// </summary>
    public string? Endpoint { get; set; }
    /// <summary>
    /// Gets or sets the model name to be used for generating responses from the OpenAI API. This specifies which version of the language model to use, such as "gpt-5.4". If not specified, it will default to "gpt-5.4".
    /// </summary>
    public string Model { get; set; } = "gpt-5.4";
}
