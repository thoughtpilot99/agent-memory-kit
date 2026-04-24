/**
 * Example: a Claude-powered agent with persistent memory.
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
    system: `You are a helpful assistant for a B2B marketer.\n\n${memoryBlock}`,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

async function main() {
  // Seed a few memories. In a real agent, these get written by the model
  // as it learns about the user across conversations.
  await memory.save({
    name: 'user_role',
    description: 'Senior demand gen leader at a B2B SaaS company',
    type: 'user',
    content:
      'User leads demand gen at a $50M ARR B2B SaaS company. 8 years of paid media experience. Reports to the CMO.',
  });

  await memory.save({
    name: 'tone_preference',
    description: 'Prefers concise, data-led responses',
    type: 'feedback',
    content:
      'User has corrected me twice for fluffy answers. Prefers short, specific responses with numbers and named examples. Skip the throat-clearing.',
  });

  await memory.save({
    name: 'q4_priority',
    description: 'Q4 priority is reducing CAC by 20% without cutting pipeline',
    type: 'project',
    content:
      'CFO mandate: cut blended CAC by 20% in Q4 without dropping pipeline volume. User is exploring channel reallocation and AI agent tools to hit this.',
  });

  // Now ask the agent something. The memory above is automatically in context.
  const reply = await chat('What channels should I prioritize this quarter?');
  console.log(reply);
}

main().catch(console.error);
