namespace AI.Agent.Tool.Web;

public interface IWebPageFetcher
{
    Task<string> FetchAsync(string url, CancellationToken cancellationToken = default);
}
