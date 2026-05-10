using AI.Agent.Tool.Configuration;
using AI.Agent.Tool.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace AI.Agent.Tool;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWebFetchTool(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddOptions<WebFetchToolOptions>();
        services.AddHttpClient(WebPageFetcher.HttpClientName, client =>
        {
            client.Timeout = Timeout.InfiniteTimeSpan;
            client.DefaultRequestHeaders.UserAgent.ParseAdd("AI.Agent.NewsAgent/1.0");
        });
        services.TryAddSingleton<IWebPageFetcher, WebPageFetcher>();
        services.TryAddSingleton<WebFetchTool>();

        return services;
    }
}
