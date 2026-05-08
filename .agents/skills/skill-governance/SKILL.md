---
name: skill-governance
description: Use when creating, deleting, or editing repo-local skills, AGENTS.md, or other coding-agent instructions. Provides boundaries for where guidance belongs and prevents generic skills from accumulating project-specific architecture.
---

# Skill Governance

Use this skill whenever a task changes `AGENTS.md`, `.agents/skills/**`, `.codex/config.toml`, or other coding-agent instruction surfaces.

If this skill is invoked without a more specific task, treat it as a maintenance request: review recent coding-session takeaways and current codebase state, then update the appropriate repo instruction surfaces using the scope rules below.

## Purpose

Keep agent instructions useful, small, and correctly scoped. Avoid duplicating guidance across files, and avoid turning portable skills into project-specific memory dumps.

## Instruction Surfaces

- `AGENTS.md` is the repository entrypoint for coding agents. Keep it high-level: available skills, major architecture rules, and verification expectations.
- `project-baseline` is the source of truth for current repo structure, commands, file locations, conventions, and verification.
- `ai-web-architecture` is the source of truth for project-specific durable architecture decisions, boundaries, and tradeoffs.
- Generic/domain skills are portable guidance. They should not mention repo-specific file paths, current routes, sample names, or implementation details.
- Vendor/framework skills should describe official-doc workflows and framework patterns. Put project-specific usage in `project-baseline` or `ai-web-architecture`.
- `.codex/config.toml` owns repo MCP/tool configuration. Do not duplicate MCP dependency declarations in per-skill metadata.

## Scope Rules

- Put current file paths, commands, and concrete implementation state in `project-baseline`.
- Put cross-cutting design decisions in `ai-web-architecture`.
- Put framework-independent protocol guidance in protocol skills.
- Put framework-specific but project-portable guidance in framework skills.
- Do not add project-specific notes to generic skills unless the skill is explicitly named as repo-specific.
- Do not create parallel metadata files for the same instruction unless a tool requires them.
- Prefer updating one source of truth over copying the same rule into many places.

## Editing Checklist

1. Identify whether the guidance is repo-specific, architecture-specific, generic/domain, or vendor/framework-specific.
2. Edit the narrowest instruction surface that matches that scope.
3. Search for duplicates or stale conflicting guidance before adding new text.
4. Keep skill changes concise; remove obsolete guidance when architecture changes.
5. After editing generic skills, scan them for repo-specific terms such as project names, route paths, sample names, or concrete file paths.
6. If deleting instruction metadata, verify the remaining `SKILL.md` files still contain the real guidance.

## Maintenance Workflow

Use this workflow for a no-argument governance pass:

1. Inspect current changes and repo shape with `git status --short`, `git diff --stat`, and targeted file reads.
2. Identify durable takeaways from the session: new architecture boundaries, source-of-truth files, commands, naming conventions, removed patterns, or verification expectations.
3. Put repo-specific current state in `project-baseline`.
4. Put durable cross-cutting architecture decisions in `ai-web-architecture`.
5. Keep generic/domain/vendor skills portable. Do not add repo file paths, route names, sample names, or current implementation details to them.
6. Update `AGENTS.md` only for high-level rules, skill list changes, or repo-wide verification expectations.
7. Remove stale or conflicting guidance instead of adding another copy.
8. Run the verification scans below and any build/lint commands appropriate to code changes.

## Verification Scans

Use targeted scans after instruction edits:

```bash
find .agents/skills -path '*/agents/openai.yaml' -type f -print
```

The repository currently avoids duplicate per-skill metadata files. This command should usually print nothing.

```bash
rg -n 'agents\.json|/api/agents|AI\.Agent\.Client|NewsAgent|samples/|dotnet/|src/' \
  .agents/skills/ag-ui-protocol \
  .agents/skills/aspnet-core-project \
  .agents/skills/dependency-injection \
  .agents/skills/openai-api-project \
  .agents/skills/vercel-nextjs
```

Use this scan to catch repo-specific guidance leaking into generic/domain/vendor skills. Some framework-convention paths may be acceptable in framework skills, but project-specific routes, samples, and package names should live in `project-baseline` or `ai-web-architecture`.

```bash
rg -n 'agents\.json|/api/agents|AI\.Agent\.Client|NewsAgent|dotnet build' \
  AGENTS.md .agents/skills/project-baseline .agents/skills/ai-web-architecture
```

Use this scan to confirm project-specific guidance is concentrated in the repo-level/project-specific instruction surfaces.

## Red Flags

- A generic skill mentions a current route like `/api/...`.
- A protocol skill mentions a repo-local sample or package name.
- The same architecture rule appears in `AGENTS.md`, `project-baseline`, and multiple generic skills.
- A skill explains a one-off implementation instead of a durable workflow.
- Metadata files become a second instruction body instead of a discovery aid.
