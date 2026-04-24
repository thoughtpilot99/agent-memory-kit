# agent-memory-kit

**A point of view on how AI agents should remember things — packaged so you can use it.**

Most "AI memory" tools are vector databases doing fuzzy retrieval over chat history. They work until they don't, and you can't read or audit what your agent actually thinks it knows.

We think there's a better way.

---

## How to think about agent memory

An AI agent should remember things the way a thoughtful coworker would. Not as a vector blob. Not as a giant search index over your chat history.

As **typed, structured notes you could write on an index card and read back in plain text**.

Five categories cover almost everything you'd want an agent to remember:

- **`user`** — who the person is, their role, their expertise, what they care about
- **`feedback`** — preferences and corrections they've explicitly given
- **`project`** — facts about ongoing work that don't live in code
- **`reference`** — pointers to where information lives elsewhere (dashboards, repos, tools)
- **`knowledge`** — domain facts the agent should treat as ground truth (product specs, conventions, jargon, research notes)

If something you want to save doesn't fit one of these five, you probably don't need to save it. That constraint is the feature, not the limit.

---

## Why typed memory beats vector memory

- **Legible.** Open the folder. Read what your agent "knows."
- **Editable.** When the agent learns something wrong, you fix one file.
- **Auditable.** No mystery embedding-space drift. The memory is exactly what it looks like.
- **Portable.** The same memory works across ChatGPT, Claude, Gemini, or your own model.
- **Version-controllable.** Memory in `.md` files diffs cleanly. Roll it back, branch it, share it.

Vector memory is great for fuzzy recall over conversation history. This is for the durable, structured stuff you'd write down on purpose.

Use both if you want. They aren't competitors.

---

## The kit

This repo turns the point of view above into code. Two ways to use it.

### 1. Notion template (no-code, fastest)

If you don't want to write code, [start with the Notion template](./notion-template/).

You'll set up a Notion database with the five entry types pre-configured, fill in a few entries, and copy a prompt block into ChatGPT, Claude, or any other LLM. Two minutes start to finish.

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
  description: 'Senior backend engineer at a Series B fintech',
  type: 'user',
  content: 'Writes Go and TypeScript. 7 years of experience. Prefers concise technical answers with code, not marketing fluff.',
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

## What people build with this

A few patterns worth stealing:

- **Personal assistants** that remember you across ChatGPT/Claude switches
- **Coding agents** that know your codebase conventions, internal libraries, and error patterns
- **Writing assistants** that know your voice, banned phrases, and stylistic preferences
- **Research agents** that build a structured knowledge base over long projects
- **Customer-support copilots** that know your product specs, edge cases, and escalation rules

Whatever you build, the agent reads memory the same way: structured Markdown injected into the system prompt. No magic.

---

## License

MIT. Use it however you want.
