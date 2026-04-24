import type { Adapter } from './adapters/types.js';
import type { MemoryEntry, MemoryType } from './types.js';

export class Memory {
  private adapter: Adapter;

  constructor(opts: { adapter: Adapter }) {
    this.adapter = opts.adapter;
  }

  async save(entry: MemoryEntry): Promise<void> {
    const now = new Date().toISOString();
    const existing = await this.adapter.read(entry.name);
    await this.adapter.write({
      ...entry,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  }

  async recall(query: string): Promise<MemoryEntry[]> {
    if (this.adapter.search) {
      return this.adapter.search(query);
    }
    const all = await this.adapter.list();
    const q = query.toLowerCase();
    return all.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
    );
  }

  async list(opts: { type?: MemoryType } = {}): Promise<MemoryEntry[]> {
    const all = await this.adapter.list();
    if (opts.type) return all.filter((m) => m.type === opts.type);
    return all;
  }

  async forget(name: string): Promise<void> {
    await this.adapter.remove(name);
  }

  /**
   * Build a Markdown system-prompt block listing all memories, grouped by type.
   * Drop this into the system message of any LLM call.
   */
  async prompt(): Promise<string> {
    const all = await this.adapter.list();
    if (all.length === 0) return '';

    const sections: Record<MemoryType, MemoryEntry[]> = {
      user: [],
      feedback: [],
      project: [],
      reference: [],
      knowledge: [],
    };
    for (const m of all) sections[m.type].push(m);

    let out =
      '# Memory & Knowledge\n\nThe following are facts, preferences, and domain knowledge from prior conversations and stored references. Use them like notes from a colleague who already knows the user and the domain.\n';

    const order: MemoryType[] = [
      'user',
      'feedback',
      'project',
      'reference',
      'knowledge',
    ];
    for (const type of order) {
      const entries = sections[type];
      if (entries.length === 0) continue;
      out += `\n## ${type.toUpperCase()}\n`;
      for (const m of entries) {
        out += `\n**${m.name}** — ${m.description}\n${m.content}\n`;
      }
    }
    return out;
  }
}
