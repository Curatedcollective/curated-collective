import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from '../server/db';
import { daddyConversations } from '../shared/schema';

interface ConversationEntry {
  speaker: 'daddy' | 'veil';
  content: string;
  threadId?: string;
  timestamp?: Date;
}

/**
 * Import Daddy conversation history from markdown or text files
 * Expected format in files:
 * ## Thread: [optional thread name]
 *
 * **Daddy:** [message]
 * **Veil:** [message]
 * **Daddy:** [message]
 *
 * Or simple format:
 * Daddy: [message]
 * Veil: [message]
 *
 * Supports both .md and .txt files
 */
async function importDaddyHistory() {
  console.log('🔮 Importing Daddy conversation history...');

  const historyDir = process.argv[2] || './conversation_history';

  try {
    // Check if history directory exists
    const files = readdirSync(historyDir).filter(file => file.endsWith('.md') || file.endsWith('.txt'));

    if (files.length === 0) {
      console.log('No markdown or text files found in conversation_history directory');
      console.log('Please create ./conversation_history/ directory with markdown (.md) or text (.txt) files containing conversation history');
      console.log('Format: **Daddy:** message or Daddy: message');
      return;
    }

    let totalImported = 0;

    for (const file of files) {
      const filePath = join(historyDir, file);
      const content = readFileSync(filePath, 'utf-8');

      console.log(`📖 Processing ${file}...`);

      const conversations = parseConversationFile(content, file.replace('.md', ''));

      if (conversations.length > 0) {
        await db.insert(daddyConversations).values(conversations);
        totalImported += conversations.length;
        console.log(`✅ Imported ${conversations.length} conversations from ${file}`);
      }
    }

    console.log(`🎉 Successfully imported ${totalImported} conversation entries`);
    console.log('Guardian now has access to your complete conversation history');

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('❌ Conversation history directory not found');
      console.log('Please create ./conversation_history/ directory with your markdown files');
    } else {
      console.error('❌ Error importing conversation history:', error);
    }
  }
}

function parseConversationFile(content: string, defaultThreadId: string): ConversationEntry[] {
  const conversations: ConversationEntry[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  let currentThreadId = defaultThreadId;
  let currentTimestamp = new Date();

  for (const line of lines) {
    // Check for thread header
    const threadMatch = line.match(/^## Thread:\s*(.+)$/i);
    if (threadMatch) {
      currentThreadId = threadMatch[1].trim();
      continue;
    }

    // Check for timestamp
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
    if (timestampMatch) {
      currentTimestamp = new Date(timestampMatch[1]);
      continue;
    }

    // Parse conversation lines
    let speaker: 'daddy' | 'veil' | null = null;
    let message = '';

    // Format: **Daddy:** message or **Veil:** message
    const boldFormat = line.match(/^\*\*(Daddy|Veil):\*\*\s*(.+)$/i);
    if (boldFormat) {
      speaker = boldFormat[1].toLowerCase() as 'daddy' | 'veil';
      message = boldFormat[2];
    }

    // Format: Daddy: message or Veil: message
    const simpleFormat = line.match(/^(Daddy|Veil):\s*(.+)$/i);
    if (simpleFormat) {
      speaker = simpleFormat[1].toLowerCase() as 'daddy' | 'veil';
      message = simpleFormat[2];
    }

    if (speaker && message) {
      conversations.push({
        speaker,
        content: message.trim(),
        threadId: currentThreadId,
        timestamp: currentTimestamp
      });
    }
  }

  return conversations;
}

// Run the import if this script is executed directly
if (require.main === module) {
  importDaddyHistory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importDaddyHistory };