# Notion Template (no-code path)

If you don't want to write code, this is the fastest way to give any LLM a real memory + knowledge base.

You'll set up a Notion database, fill in a few entries, and copy a prompt block into ChatGPT, Claude, Gemini, or any other LLM. Two minutes start to finish.

---

## Step 1 — Create the database

In Notion, create a new database with these properties:

| Property | Type | Notes |
|---|---|---|
| **Name** | Title | A short slug, e.g. `response_style`. Must be unique. |
| **Description** | Rich text | One-line summary of the entry. |
| **Type** | Select | Five options: `user`, `feedback`, `project`, `reference`, `knowledge`. |

The body of each entry goes in the page content (just open the page and type).

---

## Step 2 — Add your first entries

Add one row per entry. Pick the right type:

- **`user`** — who you are, your role, what you care about.
  *Example:* `user_profile` → "Senior backend engineer at a fintech, writes Go and TypeScript"
- **`feedback`** — preferences and corrections you want the LLM to remember.
  *Example:* `response_style` → "Prefers code first, prose second, no bullet lists"
- **`project`** — facts about ongoing work.
  *Example:* `q4_priority` → "Migrating auth from cookies to JWT this quarter"
- **`reference`** — pointers to tools, repos, dashboards, or docs.
  *Example:* `monorepo_layout` → "Backend in /services, shared in /packages"
- **`knowledge`** — domain facts your AI should treat as ground truth.
  *Example:* `api_conventions` → "All /api/v2 endpoints use snake_case and RFC 7807 errors"

Add three to five to start. You'll add more as you go.

---

## Step 3 — Copy this prompt block into your LLM

Open ChatGPT, Claude, Gemini, or any LLM. Paste this at the top of your conversation, then copy your entries from Notion into the placeholder section:

```
You have access to my persistent memory and knowledge base. The entries below were saved across prior conversations and from my own notes. Use them like notes from a colleague who already knows me and my domain.

# Memory & Knowledge

## USER (who I am)
[paste from your Notion database, type=user]

## FEEDBACK (preferences and corrections to remember)
[paste from your Notion database, type=feedback]

## PROJECT (current work)
[paste from your Notion database, type=project]

## REFERENCE (where to find things)
[paste from your Notion database, type=reference]

## KNOWLEDGE (domain facts to treat as ground truth)
[paste from your Notion database, type=knowledge]

If you learn something new about me that should be remembered, suggest a new entry I can save. If an entry looks stale or contradicts something I just said, flag it.
```

That's it. The LLM now has structured, durable memory and a queryable knowledge base.

---

## Step 4 (optional) — Wire it programmatically

If you want the LLM to read and write to Notion automatically (instead of you copy-pasting), use the [TypeScript SDK](../README.md):

```ts
import { Memory, NotionAdapter } from 'agent-memory-kit';

const memory = new Memory({
  adapter: new NotionAdapter({
    token: process.env.NOTION_TOKEN!,
    databaseId: process.env.NOTION_DATABASE_ID!,
  }),
});
```

You'll need:
1. A Notion integration token: https://www.notion.so/my-integrations
2. The integration shared with your database
3. The database ID from your Notion URL (the part between the workspace name and `?v=`)

---

## Why this works

LLMs don't actually have memory. Each conversation starts blank. Most "memory" features either dump your entire chat history back into the prompt (wasteful and unreadable) or use vector embeddings (fuzzy and hard to audit).

This pattern is different. Memory is structured, typed, and human-readable. You can edit it. Your team can edit it. You can reason about what your LLM "knows" because you can see it in plain text.

Build a personal assistant that actually remembers you. Build a coding agent that knows your codebase conventions. Build a research agent that builds a structured knowledge base over months. Same kit, different inputs.
