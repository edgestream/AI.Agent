using System.ComponentModel;
using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.AI;

namespace GenericAgent;

public static class TerminalFunctionFactory
{
    private sealed class TerminalRunner(TerminalEventChannel events)
    {
        [Description("Runs a local terminal command and streams its output to the user.")]
        public async Task<string> RunTerminalAsync(
            [Description("Executable to run, for example dotnet, npm, or git.")]
            string command,
            [Description("Arguments passed to the executable as one plain string.")]
            string? arguments = null,
            CancellationToken cancellationToken = default)
        {
            var terminalId = $"terminal-{Guid.NewGuid():N}";
            var title = string.IsNullOrWhiteSpace(arguments)
                ? command
                : $"{command} {arguments}";
            var stdoutText = new StringBuilder();
            var stderrText = new StringBuilder();

            await events.WriteAsync(
                new TerminalEvent(terminalId, "terminal.start", "", true, Title: title),
                cancellationToken);

            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = command,
                    Arguments = arguments ?? "",
                    RedirectStandardError = true,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WorkingDirectory = Directory.GetCurrentDirectory(),
                },
                EnableRaisingEvents = true,
            };

            try
            {
                process.Start();
            }
            catch (Exception ex)
            {
                await events.WriteAsync(
                    new TerminalEvent(terminalId, "terminal.exit", $"{ex.Message}{Environment.NewLine}", false, IsError: true, Title: title),
                    cancellationToken);
                return $"Failed to start `{title}`: {ex.Message}";
            }

            var stdout = DrainAsync(process.StandardOutput, stdoutText, terminalId, "terminal.output", title, false, cancellationToken);
            var stderr = DrainAsync(process.StandardError, stderrText, terminalId, "terminal.output", title, true, cancellationToken);

            await process.WaitForExitAsync(cancellationToken);
            await Task.WhenAll(stdout, stderr);

            await events.WriteAsync(
                new TerminalEvent(terminalId, "terminal.exit", "", false, ExitCode: process.ExitCode, Title: title),
                cancellationToken);

            var result = new StringBuilder();
            result.Append(stdoutText);
            result.Append(stderrText);

            return result.ToString();
        }

        private async Task DrainAsync(
            StreamReader reader,
            StringBuilder output,
            string terminalId,
            string eventName,
            string title,
            bool isError,
            CancellationToken cancellationToken)
        {
            while (await reader.ReadLineAsync(cancellationToken) is { } line)
            {
                output.AppendLine(AnsiEscapePattern.Replace(line, ""));
                await events.WriteAsync(
                    new TerminalEvent(terminalId, eventName, $"{line}{Environment.NewLine}", true, IsError: isError, Title: title),
                    cancellationToken);
            }
        }

        private static readonly Regex AnsiEscapePattern = new(
            @"\x1B(?:\[[0-?]*[ -/]*[@-~]|\][^\a]*(?:\a|\x1B\\))",
            RegexOptions.Compiled);
    }

    public static AIFunction CreateAIFunction(IServiceProvider sp)
    {
        var terminalEvents = sp.GetRequiredService<TerminalEventChannel>();
        var runner = new TerminalRunner(terminalEvents);

        return AIFunctionFactory.Create(
            runner.RunTerminalAsync,
            name: "run_terminal",
            description: "Runs a local terminal command and streams stdout and stderr to the user.");
    }
}
