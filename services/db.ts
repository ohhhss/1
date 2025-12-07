
import { DiaryEntry, AppSettings } from '../types';

const DB_NAME = 'worthy_journal_db';
const DB_VERSION = 1;
const STORE_NAME = 'entries';
const SETTINGS_KEY = 'settings';

class DiaryDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('mood', 'mood', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  async addEntry(entry: DiaryEntry): Promise<void> {
    return this.performTransaction(STORE_NAME, 'readwrite', (store) => {
      store.add(entry);
    });
  }

  async updateEntry(entry: DiaryEntry): Promise<void> {
    return this.performTransaction(STORE_NAME, 'readwrite', (store) => {
      store.put(entry);
    });
  }

  async deleteEntry(id: string): Promise<void> {
    return this.performTransaction(STORE_NAME, 'readwrite', (store) => {
      store.delete(id);
    });
  }

  async getAllEntries(): Promise<DiaryEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp'); // Sort by time automatically
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.reverse().map((entry: any) => ({
           ...entry,
           moodScore: entry.moodScore !== undefined ? entry.moodScore : 50 // Backwards compatibility default
        }));
        resolve(results); 
      };
    });
  }

  // LocalStorage fallback for simple settings
  getSettings(): AppSettings {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
    return {
      darkMode: false,
      userName: 'Friend',
      reminderEnabled: false,
      reminderTime: '20:00',
      customMoods: [],
      customTags: [],
      lastBackupDate: Date.now()
    };
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // Helper for transactions
  private async performTransaction(
    storeName: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      try {
        action(store);
      } catch (e) {
        reject(e);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
  
  async exportData(): Promise<string> {
      const entries = await this.getAllEntries();
      const settings = this.getSettings();
      // Update backup date
      settings.lastBackupDate = Date.now();
      this.saveSettings(settings);
      
      return JSON.stringify({ entries, settings, version: 1, exportedAt: new Date().toISOString() }, null, 2);
  }
  
  async importData(jsonString: string): Promise<void> {
      try {
          const data = JSON.parse(jsonString);
          if(data.entries && Array.isArray(data.entries)) {
              for(const entry of data.entries) {
                  // Avoid duplicates by checking ID or just put (overwrite)
                  await this.updateEntry(entry);
              }
          }
          if(data.settings) {
              this.saveSettings(data.settings);
          }
      } catch (e) {
          throw new Error("Invalid import file");
      }
  }
}

export const dbService = new DiaryDB();
