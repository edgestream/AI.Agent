using AI.Agent.Tool.Configuration;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;

namespace AI.Agent.Tool.Web;

public sealed partial class WebPageFetcher(
    IHttpClientFactory httpClientFactory,
    IOptions<WebFetchToolOptions> options) : IWebPageFetcher
{
    public const string HttpClientName = "AI.Agent.Tool.WebFetch";

    private static readonly HashSet<string> SupportedMediaTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "text/html",
        "text/plain",
        "text/markdown",
        "application/xhtml+xml",
        "application/json",
        "application/xml",
        "text/xml",
    };

    public async Task<string> FetchAsync(string url, CancellationToken cancellationToken = default)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            return "Fetch failed: provide an absolute http or https URL.";
        }

        var settings = options.Value;
        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(settings.Timeout);

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html"));
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/plain"));

            var client = httpClientFactory.CreateClient(HttpClientName);
            using var response = await client.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                timeoutCts.Token);

            if (!response.IsSuccessStatusCode)
            {
                return $"Fetch failed: HTTP {(int)response.StatusCode} {response.ReasonPhrase}.";
            }

            var mediaType = response.Content.Headers.ContentType?.MediaType;
            if (mediaType is not null && !SupportedMediaTypes.Contains(mediaType))
            {
                return $"Fetch failed: unsupported content type '{mediaType}'.";
            }

            var text = await ReadBoundedTextAsync(
                response.Content,
                Math.Max(1, settings.MaxContentCharacters),
                timeoutCts.Token);

            return ToTextContent(text, mediaType);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return $"Fetch failed: request timed out after {settings.Timeout.TotalSeconds:0.#} seconds.";
        }
        catch (HttpRequestException ex)
        {
            return $"Fetch failed: {ex.Message}";
        }
    }

    private static async Task<string> ReadBoundedTextAsync(
        HttpContent content,
        int maxCharacters,
        CancellationToken cancellationToken)
    {
        await using var stream = await content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);

        var buffer = new char[Math.Min(4096, maxCharacters)];
        var builder = new StringBuilder(maxCharacters);

        while (builder.Length < maxCharacters)
        {
            var charactersToRead = Math.Min(buffer.Length, maxCharacters - builder.Length);
            var read = await reader.ReadAsync(buffer.AsMemory(0, charactersToRead), cancellationToken);
            if (read == 0)
            {
                break;
            }

            builder.Append(buffer, 0, read);
        }

        if (builder.Length >= maxCharacters &&
            await reader.ReadAsync(buffer.AsMemory(0, 1), cancellationToken) > 0)
        {
            builder.Append("\n\n[Content truncated.]");
        }

        return builder.ToString();
    }

    private static string ToTextContent(string content, string? mediaType)
    {
        var text = mediaType is not null && mediaType.Contains("html", StringComparison.OrdinalIgnoreCase)
            ? HtmlToText(content)
            : content;

        text = WebUtility.HtmlDecode(text);
        text = WhitespaceRegex().Replace(text, " ").Trim();

        return text.Length == 0 ? "Fetch succeeded, but no readable text was found." : text;
    }

    private static string HtmlToText(string html)
    {
        var withoutScripts = ScriptStyleRegex().Replace(html, " ");
        var withLineBreaks = BlockBreakRegex().Replace(withoutScripts, "\n");
        return TagRegex().Replace(withLineBreaks, " ");
    }

    [GeneratedRegex(@"<\s*(script|style|noscript)[^>]*>.*?<\s*/\s*\1\s*>", RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex ScriptStyleRegex();

    [GeneratedRegex(@"<\s*/?\s*(p|div|section|article|header|footer|main|aside|h[1-6]|li|br|tr|td|th)\b[^>]*>", RegexOptions.IgnoreCase)]
    private static partial Regex BlockBreakRegex();

    [GeneratedRegex("<[^>]+>", RegexOptions.IgnoreCase)]
    private static partial Regex TagRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
