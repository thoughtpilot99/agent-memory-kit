# Notion Template (no-code path)

If you don't want to write code, this is the fastest way to give any LLM real memory.

You'll set up a Notion database, fill in a few memories, and copy a prompt block into ChatGPT, Claude, or any other LLM. Two minutes start to finish. Same structured-memory pattern that powers [MetadataONE](https://metadataone.com)'s six-agent system at Zoom, IBM, and Notion.

---

## Step 1 — Create the database

In Notion, create a new database with these properties:

| Property | Type | Notes |
|---|---|---|
| **Name** | Title | A short slug, e.g. `tone_preference`. Must be unique. |
| **Description** | Rich text | One-line summary of the memory. |
| **Type** | Select | Four options: `user`, `feedback`, `project`, `reference`. |

The memory body itself goes in the page content (just open the page and type).

---

## Step 2 — Add your first memories

Add one row per memory. Pick the right type:

- **`user`** — who you are, your role, what you care about.
  *Example:* `user_role` → "Senior demand gen leader at a $50M ARR B2B SaaS"
- **`feedback`** — preferences and corrections you want the LLM to remember.
  *Example:* `tone_preference` → "Prefers concise, data-led responses, no fluff"
- **`project`** — facts about ongoing work.
  *Example:* `q4_priority` → "Cut blended CAC by 20% without dropping pipeline"
- **`reference`** — pointers to tools, dashboards, or docs.
  *Example:* `crm_url` → "Pipeline lives in HubSpot, not Salesforce"

Add 3 to 5 to start. You'll add more as you go.

---

## Step 3 — Copy this prompt block into your LLM

Open ChatGPT, Claude, or any LLM. Paste this at the top of your conversation, then copy your memories from Notion into the placeholder section:

```
You have access to my persistent memory. The memories below were saved from prior conversations. Use them like notes from a colleague who already knows me.

# Memory

## USER (who I am)
[paste from your Notion database, type=user]

## FEEDBACK (preferences and corrections to remember)
[paste from your Notion database, type=feedback]

## PROJECT (current work)
[paste from your Notion database, type=project]

## REFERENCE (where to find things)
[paste from your Notion database, type=reference]

If you learn something new about me that should be remembered, suggest a new memory entry I can save. If a memory looks stale, flag it.
```

That's it. The LLM now has structured, durable memory of who you are.

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

The pattern in this template is different. Memory is structured, typed, and human-readable. You can edit it. Your team can edit it. You can reason about what your LLM "knows" because you can see it in plain text.

This is the same architectural idea MetadataONE productizes for paid marketing. Their six AI agents share one structured-memory store, which is why they can run campaigns at Zoom, IBM, and Notion without losing the thread between conversations. The memory layer is the unlock.

If you want the productized version, [book a demo at metadataone.com](https://metadataone.com).

If you want to build your own thing with the same memory foundation, you're already started.
