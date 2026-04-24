/**
 * Example: a Claude-powered assistant with persistent memory + knowledge.
 *
 * Run with:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx examples/claude.ts
 *
 * After install via npm, swap the import to:
 *   import { Memory, FilesystemAdapter } from 'agent-memory-kit';
 */
import Anthropic from '@anthropic-ai/sdk';
import { Memory, FilesystemAdapter } from '../src/index.js';

const memory = new Memory({
  adapter: new FilesystemAdapter({ path: './memory' }),
});

const client = new Anthropic();

async function chat(userMessage: string): Promise<string> {
  const memoryBlock = await memory.prompt();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a helpful assistant.\n\n${memoryBlock}`,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

async function main() {
  // Seed a few entries. In a real agent, these get written by the model
  // as it learns about the user across conversations, or by you when you
  // import a knowledge base.

  // Who the user is
  await memory.save({
    name: 'user_profile',
    description: 'Senior backend engineer at a Series B fintech',
    type: 'user',
    content:
      'User is a senior backend engineer at a Series B fintech. Writes Go and TypeScript. 7 years of experience. Prefers concise technical answers with code, no marketing fluff.',
  });

  // A preference the model should remember
  await memory.save({
    name: 'response_style',
    description: 'No bullet points. Code first, prose second.',
    type: 'feedback',
    content:
      'User has corrected me twice for leading with bullet lists. Prefers code blocks first, then short prose explanations underneath. Skip preambles.',
  });

  // Domain knowledge the model should treat as ground truth
  await memory.save({
    name: 'api_conventions',
    description: 'Internal API: snake_case, RFC 7807 errors, Bearer JWT',
    type: 'knowledge',
    content:
      'All endpoints under /api/v2 use snake_case for JSON fields and return RFC 7807 problem-details JSON for errors. Auth is Bearer-token JWT with 1h expiry. Rate limit headers follow draft-ietf-httpapi-ratelimit-headers.',
  });

  // A pointer to where things live
  await memory.save({
    name: 'monorepo_layout',
    description: 'Where backend services and shared packages live',
    type: 'reference',
    content:
      'Backend services in /services/<name>. Shared packages in /packages/. Migrations live alongside each service in /services/<name>/migrations.',
  });

  // Now ask a question. The memory above is automatically in context.
  const reply = await chat(
    'I need to add a new endpoint for fetching user preferences. What pattern should I follow?'
  );
  console.log(reply);
}

main().catch(console.error);
