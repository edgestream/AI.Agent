using AI.Agent.Tool.Configuration;
using AI.Agent.Tool.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Net;

await TestHtmlIsCleanedAndBoundedAsync();
await TestHttpFailuresAreReturnedAsync();
await TestInvalidUrlIsReturnedAsync();

static async Task TestHtmlIsCleanedAndBoundedAsync()
{
    var htmlContent = new StringContent("""
        <html><head><style>.x{}</style><script>alert(1)</script></head>
        <body><h1>Headline</h1><p>First &amp; second paragraph.</p></body></html>
        """);
    htmlContent.Headers.ContentType = new("text/html");

    var fetcher = CreateFetcher(new HttpResponseMessage(HttpStatusCode.OK)
    {
        Content = htmlContent
    }, maxContentCharacters: 1_000);

    var result = await fetcher.FetchAsync("https://example.test/story");

    AssertContains("Headline", result);
    AssertContains("First & second paragraph.", result);
    AssertDoesNotContain("alert", result);
}

static async Task TestHttpFailuresAreReturnedAsync()
{
    var fetcher = CreateFetcher(new HttpResponseMessage(HttpStatusCode.NotFound)
    {
        ReasonPhrase = "Not Found"
    });

    var result = await fetcher.FetchAsync("https://example.test/missing");

    AssertContains("HTTP 404 Not Found", result);
}

static async Task TestInvalidUrlIsReturnedAsync()
{
    var fetcher = CreateFetcher(new HttpResponseMessage(HttpStatusCode.OK));

    var result = await fetcher.FetchAsync("file:///etc/passwd");

    AssertContains("absolute http or https URL", result);
}

static WebPageFetcher CreateFetcher(HttpResponseMessage response, int maxContentCharacters = 500)
{
    var services = new ServiceCollection();
    services.AddHttpClient(WebPageFetcher.HttpClientName)
        .ConfigurePrimaryHttpMessageHandler(() => new StubHttpMessageHandler(response));
    var provider = services.BuildServiceProvider();
    var options = Options.Create(new WebFetchToolOptions
    {
        Timeout = TimeSpan.FromSeconds(5),
        MaxContentCharacters = maxContentCharacters,
    });

    return new WebPageFetcher(provider.GetRequiredService<IHttpClientFactory>(), options);
}

static void AssertContains(string expected, string actual)
{
    if (!actual.Contains(expected, StringComparison.Ordinal))
    {
        throw new InvalidOperationException($"Expected '{actual}' to contain '{expected}'.");
    }
}

static void AssertDoesNotContain(string unexpected, string actual)
{
    if (actual.Contains(unexpected, StringComparison.Ordinal))
    {
        throw new InvalidOperationException($"Expected '{actual}' not to contain '{unexpected}'.");
    }
}

sealed class StubHttpMessageHandler(HttpResponseMessage response) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) =>
        Task.FromResult(response);
}
