# agent-memory-kit

**Give your AI a brain that doesn't reset every conversation.**

Build a typed memory + knowledge base your agents can read so they give smarter, more personal answers. Works with any LLM — ChatGPT, Claude, Gemini, your own. No vector DB. No embeddings. Just structured Markdown your AI reads in plain text.

---

## The problem

LLMs don't actually have memory. Each conversation starts blank.

You re-explain who you are. You restate your preferences. You paste the same context every time. Your AI doesn't know anything specific about you, your work, or your domain.

Most "memory" tools fix this with vector databases — fuzzy embeddings of your chat history. They work until they don't, and you can't read or audit what's actually in there.

This kit takes a different approach.

---

## How it works

Five typed entries, modeled on what a coworker would actually remember about you:

- **`user`** — who you are, your role, your expertise, what you care about
- **`feedback`** — preferences and corrections you want your AI to remember
- **`project`** — facts about ongoing work that don't live in your code
- **`reference`** — pointers to where information lives elsewhere (dashboards, tools, repos, docs)
- **`knowledge`** — domain facts your AI should know (product specs, API conventions, your team's jargon, research notes)

Each entry is a Markdown document with frontmatter. Each one is editable, searchable, audit-able. Your agent reads them in plain text as part of its system prompt — no embeddings, no fuzzy retrieval, no opaque vector blob.

When you want to know what your AI "knows," you open a folder and read it.

---

## Two ways to use it

### 1. Notion template (no-code, fastest)

If you don't want to write code, [start with the Notion template](./notion-template/).

You'll set up a Notion database with the five entry types pre-configured, fill in a few memories and knowledge items, and copy a prompt block into ChatGPT, Claude, or any other LLM. Two minutes start to finish.

### 2. TypeScript SDK (for builders)

```bash
npm install agent-memory-kit
```

```ts
import { Memory, FilesystemAdapter } from 'agent-memory-kit';

const memory = new Memory({
  adapter: new FilesystemAdapter({ path: './memory' }),
});

// Save who the user is
await memory.save({
  name: 'user_profile',
  description: 'User is a senior backend engineer at a fintech',
  type: 'user',
  content: 'User is a senior engineer at a Series B fintech. Writes Go and TypeScript. Prefers concise technical answers, no marketing fluff.',
});

// Save a domain fact
await memory.save({
  name: 'api_conventions',
  description: 'Internal API uses snake_case and returns RFC 7807 errors',
  type: 'knowledge',
  content: 'All endpoints under /api/v2 use snake_case for fields and return RFC 7807 problem-details JSON for errors. Auth is Bearer-token JWT, 1h expiry.',
});

// Inject memory + knowledge into your LLM call
const memoryBlock = await memory.prompt();
// memoryBlock is a Markdown string. Drop it into your system prompt.
```

See [`examples/claude.ts`](./examples/claude.ts) for a full working agent.

---

## Backends

### Filesystem (default)
Memory lives as `.md` files in a folder you choose. Version-control it. Edit it by hand. Diff it. Perfect for solo builders.

### Notion
Memory lives as pages in a Notion database. Your team can read and edit memories without touching code. See [the Notion setup guide](./notion-template/).

```ts
import { NotionAdapter } from 'agent-memory-kit';

const memory = new Memory({
  adapter: new NotionAdapter({
    token: process.env.NOTION_TOKEN!,
    databaseId: process.env.NOTION_DATABASE_ID!,
  }),
});
```

### Custom (Vercel KV, Supabase, your own)
Implement a four-method `Adapter` interface in roughly 30 lines. See [`src/adapters/filesystem.ts`](./src/adapters/filesystem.ts) as the reference implementation.

---

## How this compares

**vs. Mem0, Zep, Letta** — those are vector databases doing fuzzy retrieval over chat history. This is structured, legible memory you can read, edit, and reason about. Solve different problems. Use both if you want.

**vs. Cursor rules / Claude project memory** — those are tied to specific tools. This is provider-agnostic. Same memory, any LLM.

**vs. Notion or Obsidian alone** — those are great vaults but have no agent integration. This wires your existing knowledge base directly into your AI's context window.

---

## What you get out of it

A few of the things AI enthusiasts have built with this pattern:

- **Personal assistants** that actually remember your preferences across ChatGPT/Claude switches
- **Coding agents** that know your codebase conventions, internal libraries, and error patterns
- **Writing assistants** that know your voice, banned phrases, and stylistic preferences
- **Research agents** that build a structured knowledge base across long projects
- **Customer-support copilots** that know your product specs, edge cases, and escalation rules

Whatever you build, the agent reads memory the same way: Markdown injected into the system prompt. No magic.

---

## License

MIT. Use it however you want.
