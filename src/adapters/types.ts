import type { MemoryEntry } from '../types.js';

/**
 * Backend interface. Implement these four methods (plus optional search) for any
 * storage layer: filesystem, Notion, Vercel KV, Supabase, your own DB.
 */
export interface Adapter {
  list(): Promise<MemoryEntry[]>;
  read(name: string): Promise<MemoryEntry | null>;
  write(entry: MemoryEntry): Promise<void>;
  remove(name: string): Promise<void>;
  search?(query: string): Promise<MemoryEntry[]>;
}
