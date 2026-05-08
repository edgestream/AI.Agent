---
name: github-issue
description: Use when creating or updating GitHub issues for AI.Agent, especially feature or task issues that must include assignees, labels, GitHub issue type, project #6 metadata, and issue dependency relationships through GitHub GraphQL APIs.
---

# GitHub Issue

## Overview

Create well-formed AI.Agent GitHub issues. Use GitHub GraphQL through `gh api graphql` for issue creation and metadata because the required fields go beyond the basic issue connector.

Repository context:

- Repository: `edgestream/AI.Agent`
- Organization: `edgestream`
- Project: organization project #6, `AI.Agent`
- Template issue example: `edgestream/AI.Agent#6`
- Default human assignee: `marioschmidtgreene`

## Required Metadata

Always set these fields when creating feature or task issues:

- Assignees: assign at least one human user. Use `marioschmidtgreene` unless the user names someone else.
- Labels: choose appropriate repository labels. Use `enhancement` for features/tasks unless a more specific existing label clearly applies; add `documentation`, `bug`, or others only when accurate.
- Issue type: use `Feature` for concept-level items and `Task` for concrete coding issues.
- Project: add feature and task issues to organization project #6. Do not add PRs to this project unless explicitly requested.
- Project fields: guess `Priority`, `Size`, and `Estimate` in human worker hours. Leave `Iteration`, `Start date`, and `Target date` empty.
- Relationships: search open issues before creating or immediately after creating. Add `Blocked by` when another open issue must finish first. Add `Blocking` when the new issue must finish before an existing open issue can start.

When enriching existing issues, preserve already-correct metadata such as assignee, labels, type, status, dates, and closed state unless the user asks to change them.

## Known IDs

Refresh these IDs with GraphQL if a mutation fails or the project schema changes.

- Repository id: `R_kgDOSUjXiA`
- Default assignee id: `U_kgDOB0JNfw`
- Project #6 id: `PVT_kwDOA0bEN84BXHPE`
- Issue type `Feature`: `IT_kwDOA0bEN84Aq_0J`
- Issue type `Task`: `IT_kwDOA0bEN84Aq_0F`
- Label `enhancement`: `LA_kwDOSUjXiM8AAAACh6tofg`
- Label `bug`: `LA_kwDOSUjXiM8AAAACh6toZA`
- Label `documentation`: `LA_kwDOSUjXiM8AAAACh6toaw`
- Project field `Status`: `PVTSSF_lADOA0bEN84BXHPEzhSWZf4`
- Project field `Priority`: `PVTSSF_lADOA0bEN84BXHPEzhSWZrc`
- Project field `Size`: `PVTSSF_lADOA0bEN84BXHPEzhSWZrg`
- Project field `Estimate`: `PVTF_lADOA0bEN84BXHPEzhSWZrk`
- Status `Todo`: `f75ad846`
- Priority `P0`: `d207b262`
- Priority `P1`: `f6badfa4`
- Priority `P2`: `2dd8d089`
- Size `XS`: `96a4b3bc`
- Size `S`: `4db1aaa8`
- Size `M`: `f81b3746`
- Size `L`: `f4d85e5f`
- Size `XL`: `3b713c75`

## Workflow

1. Resolve the issue scope from the user request. Decide whether the item is a concept-level `Feature` or a concrete coding `Task`.
2. Inspect existing open issues for dependencies and duplicates:

```bash
gh issue list --repo edgestream/AI.Agent --state open --limit 100
```

Use targeted search terms from the proposed title/body when the list is long:

```bash
gh issue list --repo edgestream/AI.Agent --state open --search "agent chooser"
```

3. Draft the issue body with the repo feature template shape when appropriate: `Goal`, `User-facing behavior`, `Architecture and implementation guidance`, `Acceptance criteria`, and `Verification`.
4. Create the issue with GraphQL and include assignee ids, label ids, issue type id, and `projectV2Ids` in the create mutation.
5. Confirm the issue has a project item. If `createIssue(projectV2Ids: ...)` returns no project item, add it explicitly with `addProjectV2ItemById`.
6. Set project fields on the project item: `Status=Todo` for new issues, guessed `Priority`, guessed `Size`, and guessed `Estimate`.
7. Add dependency relationships with `addBlockedBy`.
8. Verify the issue metadata, project fields, and relationships with a follow-up GraphQL query.

## Existing Issue Enrichment

Use this flow when the user asks to backfill or enrich already-created issues:

1. Read each issue body, comments, timeline, linked closing PR, and current project item fields before estimating.
2. Use closing PR history as an estimate signal when available:

```bash
gh pr view PR_NUMBER --repo edgestream/AI.Agent --json number,title,additions,deletions,changedFiles,files,commits,mergedAt,url
```

3. Keep `Status` as-is for closed issues, usually `Done`. Do not fill `Iteration`, `Start date`, or `Target date`.
4. Set only the missing requested fields unless the user asks for a broader cleanup.
5. Verify the final project field values with the verification query.

Useful estimating heuristics from past AI.Agent issues:

- Small package/config/docs integration, around 5 files and under 75 changed lines: usually `Size=S`, `Estimate=3-4`.
- Cross-cutting repo setup with many new instruction/config files, around 20 files or hundreds of documentation lines: usually `Size=L`, `Estimate=8-16`.
- Security or local-development hardening touching shared .NET configuration and docs: often `Priority=P1`, `Size=S`, `Estimate=4`.

## GraphQL Commands

Create an issue:

```bash
gh api graphql \
  -f query='mutation($repositoryId:ID!, $title:String!, $body:String!, $assigneeIds:[ID!], $labelIds:[ID!], $projectV2Ids:[ID!], $issueTypeId:ID!) {
    createIssue(input: {
      repositoryId: $repositoryId,
      title: $title,
      body: $body,
      assigneeIds: $assigneeIds,
      labelIds: $labelIds,
      projectV2Ids: $projectV2Ids,
      issueTypeId: $issueTypeId
    }) {
      issue {
        id
        number
        url
        projectItems(first: 10) {
          nodes { id project { id number title } }
        }
      }
    }
  }' \
  -f repositoryId='R_kgDOSUjXiA' \
  -f title='Issue title' \
  -f body='Issue body' \
  -F assigneeIds[]='U_kgDOB0JNfw' \
  -F labelIds[]='LA_kwDOSUjXiM8AAAACh6tofg' \
  -F projectV2Ids[]='PVT_kwDOA0bEN84BXHPE' \
  -f issueTypeId='IT_kwDOA0bEN84Aq_0J'
```

Add an existing issue to project #6 when no project item exists:

```bash
gh api graphql \
  -f query='mutation($projectId:ID!, $contentId:ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item { id project { id number title } }
    }
  }' \
  -f projectId='PVT_kwDOA0bEN84BXHPE' \
  -f contentId='ISSUE_ID'
```

The `projectV2Ids` argument on `createIssue` is still worth passing, but do not assume it returned a usable `projectItems.nodes[0].id`. Query or add the project item before setting fields.

Set a project single-select field:

```bash
gh api graphql \
  -f query='mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $optionId:String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value: { singleSelectOptionId: $optionId }
    }) { projectV2Item { id } }
  }' \
  -f projectId='PVT_kwDOA0bEN84BXHPE' \
  -f itemId='PROJECT_ITEM_ID' \
  -f fieldId='PVTSSF_lADOA0bEN84BXHPEzhSWZrc' \
  -f optionId='f6badfa4'
```

Set the estimate number:

```bash
gh api graphql \
  -f query='mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $estimate:Float!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value: { number: $estimate }
    }) { projectV2Item { id } }
  }' \
  -f projectId='PVT_kwDOA0bEN84BXHPE' \
  -f itemId='PROJECT_ITEM_ID' \
  -f fieldId='PVTF_lADOA0bEN84BXHPEzhSWZrk' \
  -F estimate=8
```

Add a dependency:

```bash
gh api graphql \
  -f query='mutation($issueId:ID!, $blockingIssueId:ID!) {
    addBlockedBy(input: { issueId: $issueId, blockingIssueId: $blockingIssueId }) {
      issue { id number }
      blockingIssue { id number }
    }
  }' \
  -f issueId='BLOCKED_ISSUE_ID' \
  -f blockingIssueId='BLOCKING_ISSUE_ID'
```

Use the same `addBlockedBy` mutation for both relationship directions:

- `Blocked by`: set `issueId` to the new issue and `blockingIssueId` to the prerequisite issue.
- `Blocking`: set `issueId` to the existing issue that is blocked and `blockingIssueId` to the new issue.

## Field Guessing

Choose project fields conservatively:

- Priority `P0`: blocking active work, security/data-loss risk, broken mainline, or urgent release path.
- Priority `P1`: important product work, architecture enabler, or likely near-term implementation.
- Priority `P2`: useful cleanup, polish, documentation, or exploratory work.
- Size `XS`: under 2 hours.
- Size `S`: 2-4 hours.
- Size `M`: 4-8 hours.
- Size `L`: 8-16 hours.
- Size `XL`: more than 16 hours or should be split.
- Estimate: use a realistic human worker hour estimate, not model execution time.

## Verification Query

After creating or updating an issue, verify the complete shape:

```bash
gh api graphql \
  -f query='query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      issue(number:$number) {
        id
        number
        title
        issueType { name }
        assignees(first: 10) { nodes { login } }
        labels(first: 20) { nodes { name } }
        blockedBy(first: 20) { nodes { number title } }
        blocking(first: 20) { nodes { number title } }
        projectItems(first: 10) {
          nodes {
            id
            project { number title }
            fieldValues(first: 30) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  field { ... on ProjectV2FieldCommon { name } }
                  name
                }
                ... on ProjectV2ItemFieldNumberValue {
                  field { ... on ProjectV2FieldCommon { name } }
                  number
                }
              }
            }
          }
        }
      }
    }
  }' \
  -F owner=edgestream \
  -F repo=AI.Agent \
  -F number=ISSUE_NUMBER
```
