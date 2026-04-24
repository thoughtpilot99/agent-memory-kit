/**
 * The four memory types, modeled on what a coworker would remember about you.
 * Same taxonomy used internally at MetadataONE.
 */
export type MemoryType = 'user' | 'feedback' | 'project' | 'reference';

export interface MemoryEntry {
  /** Unique slug, used as the filename and as the lookup key. */
  name: string;

  /** One-line summary, shown in the index. */
  description: string;

  /** Memory category. */
  type: MemoryType;

  /** Markdown body. The agent reads this verbatim. */
  content: string;

  createdAt?: string;
  updatedAt?: string;
}
