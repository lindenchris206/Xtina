/**
 * API Key Rotation Service
 * Intelligently rotates through multiple API keys to avoid rate limits
 */

import { StoredAPIKey, APIKeyRotation } from '../../shared/types';

interface KeyStats {
  keyId: string;
  usageCount: number;
  lastUsed: Date | null;
  isHealthy: boolean;
  consecutiveFailures: number;
}

export class KeyRotationService {
  private rotations: Map<string, APIKeyRotation> = new Map();
  private keyStats: Map<string, KeyStats> = new Map();
  private failureThreshold = 3; // Number of consecutive failures before marking unhealthy

  /**
   * Create a new rotation pool for a provider
   */
  createRotation(
    providerId: string,
    keyIds: string[],
    strategy: 'round-robin' | 'least-used' | 'random' | 'weighted' = 'round-robin'
  ): APIKeyRotation {
    const rotation: APIKeyRotation = {
      id: this.generateId(),
      providerId,
      keyIds,
      strategy,
      currentIndex: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rotations.set(providerId, rotation);

    // Initialize stats for each key
    keyIds.forEach(keyId => {
      this.keyStats.set(keyId, {
        keyId,
        usageCount: 0,
        lastUsed: null,
        isHealthy: true,
        consecutiveFailures: 0,
      });
    });

    return rotation;
  }

  /**
   * Get the next key to use based on rotation strategy
   */
  getNextKey(providerId: string, keys: StoredAPIKey[]): StoredAPIKey | null {
    const rotation = this.rotations.get(providerId);

    if (!rotation || !rotation.isActive || rotation.keyIds.length === 0) {
      // No rotation configured, return first active key
      return keys.find(k => k.isActive) || null;
    }

    // Filter to only healthy, active keys in the rotation
    const healthyKeys = keys.filter(k =>
      k.isActive &&
      rotation.keyIds.includes(k.id) &&
      this.isKeyHealthy(k.id)
    );

    if (healthyKeys.length === 0) {
      console.warn(`No healthy keys available for provider ${providerId}`);
      // Reset all failure counts and try again
      rotation.keyIds.forEach(id => {
        const stats = this.keyStats.get(id);
        if (stats) {
          stats.consecutiveFailures = 0;
          stats.isHealthy = true;
        }
      });
      // Return first active key as fallback
      return keys.find(k => k.isActive && rotation.keyIds.includes(k.id)) || null;
    }

    let selectedKey: StoredAPIKey | null = null;

    switch (rotation.strategy) {
      case 'round-robin':
        selectedKey = this.roundRobinSelection(healthyKeys, rotation);
        break;
      case 'least-used':
        selectedKey = this.leastUsedSelection(healthyKeys);
        break;
      case 'random':
        selectedKey = this.randomSelection(healthyKeys);
        break;
      case 'weighted':
        selectedKey = this.weightedSelection(healthyKeys);
        break;
      default:
        selectedKey = healthyKeys[0];
    }

    // Update rotation state
    if (selectedKey) {
      rotation.updatedAt = new Date();
      this.rotations.set(providerId, rotation);
    }

    return selectedKey;
  }

  /**
   * Round-robin selection
   */
  private roundRobinSelection(keys: StoredAPIKey[], rotation: APIKeyRotation): StoredAPIKey {
    // Find the key at current index
    const keyId = rotation.keyIds[rotation.currentIndex];
    let selected = keys.find(k => k.id === keyId);

    // If key not found or unhealthy, find next healthy key
    if (!selected || !this.isKeyHealthy(selected.id)) {
      selected = keys[0]; // Fallback to first healthy key
    }

    // Increment index for next time (circular)
    rotation.currentIndex = (rotation.currentIndex + 1) % rotation.keyIds.length;

    return selected;
  }

  /**
   * Least-used selection
   */
  private leastUsedSelection(keys: StoredAPIKey[]): StoredAPIKey {
    return keys.reduce((least, current) => {
      const leastStats = this.keyStats.get(least.id);
      const currentStats = this.keyStats.get(current.id);

      if (!leastStats) return current;
      if (!currentStats) return least;

      return currentStats.usageCount < leastStats.usageCount ? current : least;
    });
  }

  /**
   * Random selection
   */
  private randomSelection(keys: StoredAPIKey[]): StoredAPIKey {
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  /**
   * Weighted selection (prefer less-used, recently successful keys)
   */
  private weightedSelection(keys: StoredAPIKey[]): StoredAPIKey {
    const weights = keys.map(key => {
      const stats = this.keyStats.get(key.id);
      if (!stats) return 1;

      // Higher weight for less-used keys
      const usageWeight = 1 / (stats.usageCount + 1);

      // Higher weight for recently successful keys
      const healthWeight = stats.isHealthy ? 2 : 0.5;

      // Lower weight for recently used keys (to distribute load)
      const recencyWeight = stats.lastUsed
        ? 1 / (Date.now() - stats.lastUsed.getTime() + 1000)
        : 1;

      return usageWeight * healthWeight * recencyWeight;
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < keys.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return keys[i];
      }
    }

    return keys[keys.length - 1]; // Fallback
  }

  /**
   * Record successful API call
   */
  recordSuccess(keyId: string): void {
    const stats = this.keyStats.get(keyId);
    if (stats) {
      stats.usageCount++;
      stats.lastUsed = new Date();
      stats.consecutiveFailures = 0;
      stats.isHealthy = true;
      this.keyStats.set(keyId, stats);
    }
  }

  /**
   * Record failed API call
   */
  recordFailure(keyId: string): void {
    const stats = this.keyStats.get(keyId);
    if (stats) {
      stats.consecutiveFailures++;
      if (stats.consecutiveFailures >= this.failureThreshold) {
        stats.isHealthy = false;
        console.warn(`Key ${keyId} marked as unhealthy after ${stats.consecutiveFailures} failures`);
      }
      this.keyStats.set(keyId, stats);
    }
  }

  /**
   * Check if a key is healthy
   */
  isKeyHealthy(keyId: string): boolean {
    const stats = this.keyStats.get(keyId);
    return stats ? stats.isHealthy : true;
  }

  /**
   * Get rotation for a provider
   */
  getRotation(providerId: string): APIKeyRotation | undefined {
    return this.rotations.get(providerId);
  }

  /**
   * Get stats for a key
   */
  getKeyStats(keyId: string): KeyStats | undefined {
    return this.keyStats.get(keyId);
  }

  /**
   * Get all stats for a provider
   */
  getProviderStats(providerId: string): KeyStats[] {
    const rotation = this.rotations.get(providerId);
    if (!rotation) return [];

    return rotation.keyIds
      .map(id => this.keyStats.get(id))
      .filter((s): s is KeyStats => s !== undefined);
  }

  /**
   * Reset failure counts for a key (manual recovery)
   */
  resetKeyHealth(keyId: string): void {
    const stats = this.keyStats.get(keyId);
    if (stats) {
      stats.consecutiveFailures = 0;
      stats.isHealthy = true;
      this.keyStats.set(keyId, stats);
    }
  }

  /**
   * Remove a key from rotation
   */
  removeKeyFromRotation(providerId: string, keyId: string): void {
    const rotation = this.rotations.get(providerId);
    if (rotation) {
      rotation.keyIds = rotation.keyIds.filter(id => id !== keyId);
      rotation.updatedAt = new Date();
      this.rotations.set(providerId, rotation);
    }
    this.keyStats.delete(keyId);
  }

  /**
   * Add a key to rotation
   */
  addKeyToRotation(providerId: string, keyId: string): void {
    const rotation = this.rotations.get(providerId);
    if (rotation && !rotation.keyIds.includes(keyId)) {
      rotation.keyIds.push(keyId);
      rotation.updatedAt = new Date();
      this.rotations.set(providerId, rotation);

      // Initialize stats
      this.keyStats.set(keyId, {
        keyId,
        usageCount: 0,
        lastUsed: null,
        isHealthy: true,
        consecutiveFailures: 0,
      });
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `rotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let keyRotationServiceInstance: KeyRotationService | null = null;

export function getKeyRotationService(): KeyRotationService {
  if (!keyRotationServiceInstance) {
    keyRotationServiceInstance = new KeyRotationService();
  }
  return keyRotationServiceInstance;
}
