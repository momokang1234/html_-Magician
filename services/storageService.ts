
import { Snippet, Folder, Curriculum, AppConstants } from '../types';

/**
 * Storage backend abstraction layer.
 * Currently uses localStorage — swap the implementation to a REST API
 * by replacing the method bodies without touching any consumer code.
 */

export interface StorageBackend {
  // Snippets
  loadSnippets(): Snippet[];
  saveSnippets(snippets: Snippet[]): void;

  // Folders
  loadFolders(): Folder[];
  saveFolders(folders: Folder[]): void;

  // Curriculums
  loadCurriculums(): Curriculum[];
  saveCurriculums(curriculums: Curriculum[]): void;

  // Code
  loadCode(): string;
  saveCode(code: string): void;
}

class LocalStorageBackend implements StorageBackend {
  loadSnippets(): Snippet[] {
    try {
      const raw = localStorage.getItem(AppConstants.SNIPPETS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveSnippets(snippets: Snippet[]): void {
    const persistent = snippets.filter(s => !s.isLocal);
    localStorage.setItem(AppConstants.SNIPPETS_KEY, JSON.stringify(persistent));
  }

  loadFolders(): Folder[] {
    try {
      const raw = localStorage.getItem(AppConstants.FOLDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveFolders(folders: Folder[]): void {
    const persistent = folders.filter(f => !f.isLocal);
    localStorage.setItem(AppConstants.FOLDERS_KEY, JSON.stringify(persistent));
  }

  loadCurriculums(): Curriculum[] {
    try {
      const raw = localStorage.getItem(AppConstants.CURRICULUMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveCurriculums(curriculums: Curriculum[]): void {
    localStorage.setItem(AppConstants.CURRICULUMS_KEY, JSON.stringify(curriculums));
  }

  loadCode(): string {
    return localStorage.getItem(AppConstants.STORAGE_KEY) || AppConstants.DEFAULT_HTML;
  }

  saveCode(code: string): void {
    localStorage.setItem(AppConstants.STORAGE_KEY, code);
  }
}

/**
 * Placeholder for future REST API backend.
 * Uncomment and implement when a server is available.
 *
 * class ApiBackend implements StorageBackend {
 *   private baseUrl: string;
 *   constructor(baseUrl: string) { this.baseUrl = baseUrl; }
 *
 *   async loadSnippets() {
 *     const res = await fetch(`${this.baseUrl}/api/snippets`);
 *     return res.json();
 *   }
 *   async saveSnippets(snippets: Snippet[]) {
 *     await fetch(`${this.baseUrl}/api/snippets`, {
 *       method: 'PUT',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(snippets),
 *     });
 *   }
 *   // ... same pattern for folders, curriculums, code
 * }
 */

// Singleton — swap to ApiBackend when ready
export const storage: StorageBackend = new LocalStorageBackend();
