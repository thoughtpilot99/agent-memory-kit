import { Client } from '@notionhq/client';
import type { Adapter } from './types.js';
import type { MemoryEntry, MemoryType } from '../types.js';

/**
 * Notion adapter. Expects a database with these properties:
 *   - Name (Title)
 *   - Description (Rich text)
 *   - Type (Select: user | feedback | project | reference)
 *
 * The memory body lives in the page content. See notion-template/ for setup.
 */
export class NotionAdapter implements Adapter {
  private notion: Client;
  private databaseId: string;

  constructor(opts: { token: string; databaseId: string }) {
    this.notion = new Client({ auth: opts.token });
    this.databaseId = opts.databaseId;
  }

  async list(): Promise<MemoryEntry[]> {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      page_size: 100,
    });
    const entries: MemoryEntry[] = [];
    for (const page of res.results) {
      const e = await this.pageToEntry(page);
      if (e) entries.push(e);
    }
    return entries;
  }

  async read(name: string): Promise<MemoryEntry | null> {
    const page = await this.findPage(name);
    return page ? this.pageToEntry(page) : null;
  }

  async write(entry: MemoryEntry): Promise<void> {
    const props = {
      Name: { title: [{ text: { content: entry.name } }] },
      Description: { rich_text: [{ text: { content: entry.description } }] },
      Type: { select: { name: entry.type } },
    };

    const existing = await this.findPage(entry.name);
    if (existing) {
      await this.notion.pages.update({
        page_id: existing.id,
        properties: props as never,
      });
      await this.replaceContent(existing.id, entry.content);
    } else {
      await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: props as never,
        children: contentToBlocks(entry.content),
      });
    }
  }

  async remove(name: string): Promise<void> {
    const page = await this.findPage(name);
    if (!page) return;
    await this.notion.pages.update({ page_id: page.id, archived: true });
  }

  private async findPage(name: string): Promise<{ id: string } | null> {
    const res = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: { property: 'Name', title: { equals: name } },
      page_size: 1,
    });
    return res.results[0] ? { id: res.results[0].id } : null;
  }

  private async pageToEntry(page: unknown): Promise<MemoryEntry | null> {
    try {
      const p = page as {
        id: string;
        created_time: string;
        last_edited_time: string;
        properties: Record<string, unknown>;
      };
      const props = p.properties as {
        Name?: { title?: Array<{ plain_text: string }> };
        Description?: { rich_text?: Array<{ plain_text: string }> };
        Type?: { select?: { name: string } };
      };

      const name = props.Name?.title?.[0]?.plain_text ?? '';
      const description = props.Description?.rich_text?.[0]?.plain_text ?? '';
      const type = (props.Type?.select?.name ?? 'project') as MemoryType;

      const blocks = await this.notion.blocks.children.list({ block_id: p.id });
      const content = blocks.results
        .map(blockToMarkdown)
        .filter(Boolean)
        .join('\n');

      return {
        name,
        description,
        type,
        content,
        createdAt: p.created_time,
        updatedAt: p.last_edited_time,
      };
    } catch {
      return null;
    }
  }

  private async replaceContent(pageId: string, content: string): Promise<void> {
    const existing = await this.notion.blocks.children.list({ block_id: pageId });
    for (const block of existing.results) {
      try {
        await this.notion.blocks.delete({ block_id: (block as { id: string }).id });
      } catch {
        // ignore: block may already be archived
      }
    }
    await this.notion.blocks.children.append({
      block_id: pageId,
      children: contentToBlocks(content),
    });
  }
}

function contentToBlocks(content: string): never[] {
  return content
    .split('\n\n')
    .filter(Boolean)
    .map((para) => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: para.slice(0, 2000) } }],
      },
    })) as never[];
}

function blockToMarkdown(block: unknown): string {
  const b = block as {
    type: string;
    paragraph?: { rich_text: Array<{ plain_text: string }> };
    heading_1?: { rich_text: Array<{ plain_text: string }> };
    heading_2?: { rich_text: Array<{ plain_text: string }> };
    bulleted_list_item?: { rich_text: Array<{ plain_text: string }> };
  };
  const text = (rich: Array<{ plain_text: string }> = []) =>
    rich.map((t) => t.plain_text).join('');
  switch (b.type) {
    case 'paragraph':
      return text(b.paragraph?.rich_text);
    case 'heading_1':
      return '# ' + text(b.heading_1?.rich_text);
    case 'heading_2':
      return '## ' + text(b.heading_2?.rich_text);
    case 'bulleted_list_item':
      return '- ' + text(b.bulleted_list_item?.rich_text);
    default:
      return '';
  }
}
