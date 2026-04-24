import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Adapter } from './types.js';
import type { MemoryEntry, MemoryType } from '../types.js';

export class FilesystemAdapter implements Adapter {
  private root: string;

  constructor(opts: { path: string }) {
    this.root = opts.path;
  }

  private file(name: string): string {
    return path.join(this.root, `${name}.md`);
  }

  async list(): Promise<MemoryEntry[]> {
    await fs.mkdir(this.root, { recursive: true });
    const files = await fs.readdir(this.root);
    const entries: MemoryEntry[] = [];
    for (const f of files) {
      if (!f.endsWith('.md') || f === 'MEMORY.md') continue;
      const name = f.replace(/\.md$/, '');
      const e = await this.read(name);
      if (e) entries.push(e);
    }
    return entries;
  }

  async read(name: string): Promise<MemoryEntry | null> {
    try {
      const raw = await fs.readFile(this.file(name), 'utf8');
      return parseMarkdown(name, raw);
    } catch {
      return null;
    }
  }

  async write(entry: MemoryEntry): Promise<void> {
    await fs.mkdir(this.root, { recursive: true });
    await fs.writeFile(this.file(entry.name), serializeMarkdown(entry), 'utf8');
    await this.rebuildIndex();
  }

  async remove(name: string): Promise<void> {
    try {
      await fs.unlink(this.file(name));
    } catch {
      // ignore: file already gone
    }
    await this.rebuildIndex();
  }

  /** Rewrites MEMORY.md so humans browsing the folder see a clean index. */
  private async rebuildIndex(): Promise<void> {
    const entries = await this.list();
    let md = '# Memory Index\n\n';
    for (const e of entries) {
      md += `- [${e.name}](${e.name}.md) — ${e.description}\n`;
    }
    await fs.writeFile(path.join(this.root, 'MEMORY.md'), md, 'utf8');
  }
}

function parseMarkdown(name: string, raw: string): MemoryEntry {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return { name, description: '', type: 'project', content: raw.trim() };
  }
  const meta: Record<string, string> = {};
  for (const line of fmMatch[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return {
    name: meta.name ?? name,
    description: meta.description ?? '',
    type: (meta.type as MemoryType) ?? 'project',
    content: fmMatch[2].trim(),
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
  };
}

function serializeMarkdown(entry: MemoryEntry): string {
  const lines = [
    '---',
    `name: ${entry.name}`,
    `description: ${entry.description}`,
    `type: ${entry.type}`,
  ];
  if (entry.createdAt) lines.push(`createdAt: ${entry.createdAt}`);
  if (entry.updatedAt) lines.push(`updatedAt: ${entry.updatedAt}`);
  lines.push('---', '', entry.content, '');
  return lines.join('\n');
}
