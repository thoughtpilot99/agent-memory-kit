# agent-memory-kit

**The open-source memory pattern behind [MetadataONE](https://metadataone.com)'s AI agents.**

MetadataONE runs paid campaigns at Zoom, IBM, Notion, Cisco, and 200+ other enterprises using six AI specialists that share one persistent memory. Their agents don't forget — across 263,000+ experiments and $1B+ in sourced pipeline, every campaign builds on every prior result.

This kit is the structured-memory pattern behind that system, stripped down and packaged so you can plug it into any agent you build.

---

## The problem with most "agent memory"

Most "agent memory" libraries are vector databases doing fuzzy search on chat history. They work until they don't. You can't read what's in there. You can't audit what your agent thinks it knows. You can't fix it when it gets something wrong about your user.

When Charisse, Zoom's Digital Marketing Lead, said *"It's the most set-it-and-forget-it thing out there. Except the agent doesn't forget"* — she meant something specific. The agent has structured, durable memory of every campaign decision, every experiment outcome, every preference she's ever expressed. Not a vector blob. Real, legible memory.

That's what this kit gives you.

---

## How it works

Four memory types, modeled on what an actual coworker would remember about you:

- **`user`** — who the person is, their role, expertise, what they care about
- **`feedback`** — corrections and preferences they've given you
- **`project`** — facts about ongoing work that don't live in code
- **`reference`** — pointers to where information lives in external systems

Each memory is a Markdown document with frontmatter. Each one is editable, searchable, audit-able. Your agent reads them in plain text as part of its system prompt.

---

## Two ways to use it

### 1. Notion template (no-code, fastest)

If you don't want to write code, [start with the Notion template](./notion-template/). You'll get:

- A Notion database with the four memory types pre-configured
- A copy-paste prompt block to drop into ChatGPT, Claude, or any other LLM
- Two minutes to first memory

That's the same architectural idea MetadataONE productizes, in a form you can use tonight.

### 2. TypeScript SDK (for builders)

```bash
npm install agent-memory-kit
```

```ts
import { Memory, FilesystemAdapter } from 'agent-memory-kit';

const memory = new Memory({
  adapter: new FilesystemAdapter({ path: './memory' }),
});

await memory.save({
  name: 'tone_preference',
  description: 'User prefers concise responses, no bullets',
  type: 'feedback',
  content: 'User has corrected me twice for bulleted answers. Prefers prose. Why: easier to skim on mobile.',
});

// Inject memory into your LLM call
const memoryBlock = await memory.prompt();
// memoryBlock is a Markdown string. Drop it into your system prompt.
```

See [`examples/claude.ts`](./examples/claude.ts) for a full working agent.

---

## Backends

### Filesystem (default)
Memory lives as `.md` files in a folder you choose. Version-control it. Edit it by hand. Diff it. Perfect for solo developers.

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
Implement the four-method `Adapter` interface in roughly 30 lines. See [`src/adapters/filesystem.ts`](./src/adapters/filesystem.ts) as the reference implementation.

---

## How this compares to Mem0, Zep, and Letta

Those tools are great for fuzzy retrieval over conversation history. They store everything, embed it, and let you query against semantic similarity.

This kit solves a different problem: **legible, structured memory you can read, edit, and reason about**. Memory you can show your CMO. Memory you can audit. Memory you can fix when it's wrong.

Use both if you want. They aren't competitors.

---

## What MetadataONE adds on top

This kit handles the memory pattern. MetadataONE is the full system — six AI specialists (Sophia, Aria, Maya, Elena, Kai, and Jordan) that use this kind of structured memory to run paid campaigns end-to-end across LinkedIn, Google, Meta, X, Reddit, Bing, Facebook, and Instagram. They share context, hand work to each other, and never lose track of what worked last quarter.

If you want the productized version that 200+ enterprises already use, [book a demo at metadataone.com](https://metadataone.com).

If you want to build your own thing on the same memory foundation — that's what this repo is for.

---

## License

MIT. Use it however you want.

---

Built as a companion to [MetadataONE](https://metadataone.com). Questions, ideas, or feedback: [open an issue](https://github.com/thoughtpilot99/agent-memory-kit/issues).
