using System.ComponentModel;
using Microsoft.Extensions.AI;

namespace AI.Agent.Tool.Web;

public sealed class WebFetchTool(IWebPageFetcher fetcher)
{
    public AIFunction AsAIFunction() => AIFunctionFactory.Create(
        FetchWebPageAsync,
        name: "fetch_web_page",
        description: "Fetches a public HTTP or HTTPS web page and returns bounded text-only content for answering the user.");

    [Description("Fetches a public HTTP or HTTPS web page and returns bounded text-only content.")]
    public Task<string> FetchWebPageAsync(
        [Description("Absolute HTTP or HTTPS URL to fetch.")] string url,
        CancellationToken cancellationToken = default) =>
        fetcher.FetchAsync(url, cancellationToken);
}
