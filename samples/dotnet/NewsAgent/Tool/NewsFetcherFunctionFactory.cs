using System.ComponentModel;
using System.Net;
using System.Text.Json;
using System.Xml.Linq;
using Microsoft.Extensions.AI;

namespace NewsAgent.Tool;

/// <summary>
/// Factory for creating the news fetching function. This function fetches the latest news from an RSS feed and returns it as JSON-formatted output.
/// </summary>
public static class NewsFetcherFunctionFactory
{
    private sealed class RssNewsFetcher(HttpClient httpClient)
    {
        private const string RSS_FEED_URL = "https://www.tagesschau.de/index~rss2.xml";

        [Description("Fetches the latest news")]
        public async Task<string> FetchNewsAsync()
        {
            using var response = await httpClient.GetAsync(RSS_FEED_URL);
            response.EnsureSuccessStatusCode();
            var rss = await response.Content.ReadAsStringAsync();
            var document = XDocument.Parse(rss);
            return JsonSerializer.Serialize(
                document.Descendants("item")
                        .Take(10)
                        .Select(item => new
                        {
                            title = Text(item, "title"),
                            summary = Text(item, "description"),
                            link = Text(item, "link"),
                        })
            );
        }
        private static string Text(XElement item, string name)
        {
            var value = item.Element(name)?.Value ?? "";
            return WebUtility.HtmlDecode(value).ReplaceLineEndings(" ").Trim();
        }
    }

    /// <summary>
    /// Creates the AI function for fetching news. This function will be registered in the agent's tool registry and can be called by the agent to fetch news when needed.
    /// </summary>
    /// <param name="sp">The service provider</param>
    /// <returns>The AI function</returns>
    public static AIFunction CreateAIFunction(IServiceProvider sp)
    {
        var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("news");
        var newsFetcher = new RssNewsFetcher(httpClient);
        return AIFunctionFactory.Create(
            newsFetcher.FetchNewsAsync,
            name: "fetch_news",
            description: "Fetches the latest news"
        );
    }
}
