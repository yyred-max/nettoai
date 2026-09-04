// lib/store/decisionStore.ts

export type DecisionEntry = {
  intent: any;
  action: any;
  provenance: any;
  userInput: string;
  status: 'pending' | 'executed';
  createdAt: number;
  ttl: number; // milliseconds
};

export class DecisionStore {
  private store: Map<string, DecisionEntry> = new Map();

  /**
   * Simpan decision dengan TTL (default 5 menit)
   */
  set(decisionId: string, entry: Omit<DecisionEntry, 'createdAt' | 'ttl'>): void {
    const now = Date.now();
    const ttl = 5 * 60 * 1000; // 5 menit
    this.store.set(decisionId, {
      ...entry,
      createdAt: now,
      ttl,
    });
  }

  /**
   * Ambil decision, otomatis cek expired
   */
  get(decisionId: string): DecisionEntry | null {
    const entry = this.store.get(decisionId);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(decisionId);
      return null;
    }
    return entry;
  }

  /**
   * Cek apakah decision sudah expired
   */
  isExpired(entry: DecisionEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  /**
   * Hapus decision
   */
  delete(decisionId: string): void {
    this.store.delete(decisionId);
  }

  /**
   * Tandai decision sebagai executed
   */
  markExecuted(decisionId: string): boolean {
    const entry = this.get(decisionId);
    if (!entry) return false;
    if (entry.status === 'executed') return false;
    entry.status = 'executed';
    this.store.set(decisionId, entry);
    return true;
  }

  /**
   * Hapus semua decision yang expired (cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.store.entries()) {
      if (now - entry.createdAt > entry.ttl) {
        this.store.delete(id);
      }
    }
  }

  /**
   * Get all active decision IDs (untuk debugging)
   */
  listActive(): string[] {
    this.cleanup();
    return Array.from(this.store.keys());
  }
}

// ✅ Singleton instance — DIEKSPOR
export const decisionStore = new DecisionStore();
