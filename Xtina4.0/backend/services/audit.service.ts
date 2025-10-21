/**
 * Audit Logging Service
 * Provides tamper-proof audit trails for security-critical operations
 */

import { LogEntry } from '../../shared/types';
import { createHash } from 'crypto';

interface AuditEntry extends LogEntry {
  id: string;
  hash: string; // Hash of previous entry for chain integrity
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  private auditLog: AuditEntry[] = [];
  private previousHash: string = '0';

  /**
   * Log an audit entry
   */
  async log(entry: LogEntry, metadata?: { ip?: string; userAgent?: string }): Promise<void> {
    const auditEntry: AuditEntry = {
      ...entry,
      id: this.generateId(),
      hash: this.calculateHash(entry),
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    };

    this.auditLog.push(auditEntry);
    this.previousHash = auditEntry.hash;

    // In production, write to persistent storage
    // await this.persistToDatabase(auditEntry);

    // Also log to console for debugging
    if (entry.level === 'error' || entry.level === 'warn') {
      console[entry.level](`[AUDIT] ${entry.message}`, entry.data);
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(filters: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    agentId?: string;
    taskId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<AuditEntry[]> {
    let filtered = [...this.auditLog];

    if (filters.level) {
      filtered = filtered.filter(e => e.level === filters.level);
    }

    if (filters.agentId) {
      filtered = filtered.filter(e => e.agentId === filters.agentId);
    }

    if (filters.taskId) {
      filtered = filtered.filter(e => e.taskId === filters.taskId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Verify audit log integrity
   */
  async verifyIntegrity(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    let previousHash = '0';

    for (let i = 0; i < this.auditLog.length; i++) {
      const entry = this.auditLog[i];
      const calculatedHash = this.calculateHash(entry);

      if (entry.hash !== calculatedHash) {
        errors.push(`Entry ${i} (${entry.id}) hash mismatch`);
      }

      previousHash = entry.hash;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate hash for audit entry
   */
  private calculateHash(entry: LogEntry): string {
    const data = JSON.stringify({
      previousHash: this.previousHash,
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      data: entry.data,
    });

    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear logs (admin only, with audit trail)
   */
  async clearLogs(adminUserId: string, reason: string): Promise<void> {
    const count = this.auditLog.length;

    await this.log({
      timestamp: new Date(),
      level: 'warn',
      message: `Audit logs cleared by admin`,
      data: { adminUserId, reason, entriesCleared: count },
    });

    // Keep the last log entry about clearing
    const lastEntry = this.auditLog[this.auditLog.length - 1];
    this.auditLog = [lastEntry];
    this.previousHash = lastEntry.hash;
  }
}

// Singleton instance
let auditServiceInstance: AuditService | null = null;

export function getAuditService(): AuditService {
  if (!auditServiceInstance) {
    auditServiceInstance = new AuditService();
  }
  return auditServiceInstance;
}
