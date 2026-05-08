using AI.Agent.Client.Configuration;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Responses;
using System.ClientModel;

#pragma warning disable OPENAI001 // OpenAIClient.GetResponsesClient() is experimental and may change or be removed in a future release
#pragma warning disable MAAI001 // OpenAIResponsesClient.AsIChatClientWithStoredOutputDisabled() is experimental and may change or be removed in a future release

namespace AI.Agent.Client;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds an IChatClient implementation to the service collection.
    /// </summary>
    /// <param name="services">The service collection to which to add the IChatClient.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddAIChatClient(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddOptions<OpenAISettings>().BindConfiguration(OpenAISettings.SectionName);

        return services.AddOpenAIChatClient(sp => sp.GetRequiredService<IOptions<OpenAISettings>>().Value);
    }

    /// <summary>
    /// Adds an IChatClient implementation that uses OpenAI's API to the service collection, using the provided OpenAISettings instance for configuration.
    /// </summary>
    /// <param name="services">The service collection to which to add the IChatClient.</param>
    /// <param name="settings">The OpenAISettings instance to use for configuration.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddOpenAIChatClient(this IServiceCollection services, OpenAISettings settings)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(settings);

        return services.AddOpenAIChatClient(_ => settings);
    }

    public static IServiceCollection AddOpenAIChatClient(
        this IServiceCollection services,
        Func<IServiceProvider, OpenAISettings> settingsFactory)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(settingsFactory);

        services.TryAddSingleton(sp => CreateOpenAIChatClient(settingsFactory(sp)));

        return services;
    }

    private static IChatClient CreateOpenAIChatClient(OpenAISettings settings)
    {
        if (string.IsNullOrWhiteSpace(settings.ApiKey)) throw new InvalidOperationException("OpenAI:ApiKey is required");
        var credential = new ApiKeyCredential(settings.ApiKey);
        var options = new OpenAIClientOptions();
        if (!string.IsNullOrEmpty(settings.Endpoint))
        {
            options.Endpoint = new Uri(settings.Endpoint);
        }
        var client = new OpenAIClient(new ApiKeyCredential(settings.ApiKey), options);
        return client.GetResponsesClient().AsIChatClientWithStoredOutputDisabled(settings.Model);
    }
}
