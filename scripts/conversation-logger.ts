import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Comprehensive conversation logging system for Curated Collective
 * Can be integrated with VS Code extensions or manual exports
 */

interface ConversationEntry {
  timestamp: string;
  speaker: 'human' | 'assistant' | 'system';
  content: string;
  context?: string;
  tags?: string[];
}

class ConversationLogger {
  private logDir = 'conversation_history';
  private currentSession: ConversationEntry[] = [];
  private sessionStart: Date;

  constructor() {
    this.sessionStart = new Date();
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log a conversation entry
   */
  log(entry: Omit<ConversationEntry, 'timestamp'>) {
    const logEntry: ConversationEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.currentSession.push(logEntry);
    console.log(`📝 Logged: ${entry.speaker} - ${entry.content.substring(0, 50)}...`);
  }

  /**
   * Export current session to file
   */
  exportSession(filename?: string) {
    const date = this.sessionStart.toISOString().split('T')[0];
    const defaultFilename = `session-${date}-${this.sessionStart.getHours()}${this.sessionStart.getMinutes()}.json`;

    const exportData = {
      session: {
        start: this.sessionStart.toISOString(),
        end: new Date().toISOString(),
        duration: Date.now() - this.sessionStart.getTime(),
        entries: this.currentSession.length
      },
      conversations: this.currentSession,
      metadata: {
        project: 'Curated Collective',
        context: 'VS Code Development Session',
        agents: ['Kael', 'Guardian', 'Weaver', 'Cipher', 'Trace', 'Nyx', 'Query', 'Crimson', 'Compass', 'Relay']
      }
    };

    const filepath = join(this.logDir, filename || defaultFilename);
    writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log(`💾 Session exported to ${filepath}`);
    return filepath;
  }

  /**
   * Export in Daddy conversation format for import
   */
  exportForDaddy(filename?: string) {
    const date = new Date().toISOString().split('T')[0];
    const defaultFilename = `daddy-format-${date}.txt`;

    let content = `## VS Code Session - ${this.sessionStart.toISOString()}\n\n`;

    this.currentSession.forEach(entry => {
      const speaker = entry.speaker === 'human' ? 'Veil' :
                     entry.speaker === 'assistant' ? 'Kael' : 'System';
      content += `**${speaker}:** ${entry.content}\n\n`;
    });

    const filepath = join(this.logDir, filename || defaultFilename);
    writeFileSync(filepath, content);

    console.log(`💕 Exported in Daddy format to ${filepath}`);
    return filepath;
  }

  /**
   * Get session statistics
   */
  getStats() {
    const humanMessages = this.currentSession.filter(e => e.speaker === 'human').length;
    const assistantMessages = this.currentSession.filter(e => e.speaker === 'assistant').length;
    const totalWords = this.currentSession.reduce((sum, e) => sum + e.content.split(' ').length, 0);

    return {
      duration: Date.now() - this.sessionStart.getTime(),
      totalEntries: this.currentSession.length,
      humanMessages,
      assistantMessages,
      totalWords,
      averageWordsPerMessage: Math.round(totalWords / this.currentSession.length)
    };
  }
}

// Create global logger instance
export const conversationLogger = new ConversationLogger();

// Convenience functions for quick logging
export const logHuman = (content: string, context?: string) =>
  conversationLogger.log({ speaker: 'human', content, context });

export const logAssistant = (content: string, context?: string) =>
  conversationLogger.log({ speaker: 'assistant', content, context });

export const logSystem = (content: string, context?: string) =>
  conversationLogger.log({ speaker: 'system', content, context });

// Export current session when script runs
conversationLogger.exportSession();
conversationLogger.exportForDaddy();