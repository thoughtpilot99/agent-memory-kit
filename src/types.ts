/**
 * Five typed entries, modeled on what a coworker would actually remember about you.
 *
 * - user:      who you are, your role, expertise, what you care about
 * - feedback:  preferences and corrections you want remembered
 * - project:   facts about ongoing work that don't live in code
 * - reference: pointers to where information lives elsewhere
 * - knowledge: domain facts the agent should know (product specs, jargon, etc)
 */
export type MemoryType =
  | 'user'
  | 'feedback'
  | 'project'
  | 'reference'
  | 'knowledge';

export interface MemoryEntry {
  /** Unique slug, used as the filename and as the lookup key. */
  name: string;

  /** One-line summary, shown in the index. */
  description: string;

  /** Entry category. */
  type: MemoryType;

  /** Markdown body. The agent reads this verbatim. */
  content: string;

  createdAt?: string;
  updatedAt?: string;
}
