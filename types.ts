
export enum SnippetCategory {
  LAYOUT = 'Layout',
  ANIMATION = 'Animation',
  FORM = 'Form',
  GAME = 'Game',
  API_INTEGRATION = 'API Integration',
  DATA_VISUALIZATION = 'Data Visualization',
  UI_COMPONENT = 'UI Component',
  UTILITY = 'Utility',
  LANDING_PAGE = 'Landing Page',
  UNCATEGORIZED = 'Uncategorized',
}

export const CATEGORY_COLORS: Record<SnippetCategory, string> = {
  [SnippetCategory.LAYOUT]: '#3b82f6',
  [SnippetCategory.ANIMATION]: '#a855f7',
  [SnippetCategory.FORM]: '#10b981',
  [SnippetCategory.GAME]: '#f59e0b',
  [SnippetCategory.API_INTEGRATION]: '#ef4444',
  [SnippetCategory.DATA_VISUALIZATION]: '#06b6d4',
  [SnippetCategory.UI_COMPONENT]: '#ec4899',
  [SnippetCategory.UTILITY]: '#6b7280',
  [SnippetCategory.LANDING_PAGE]: '#8b5cf6',
  [SnippetCategory.UNCATEGORIZED]: '#374151',
};

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Snippet {
  id: string;
  name: string;
  code: string;
  folderId: string | null;
  updatedAt: number;
  isLocal?: boolean;
  filePath?: string;
  category?: SnippetCategory;
  tags?: string[];
  difficulty?: DifficultyLevel;
}

export interface Folder {
  id: string;
  name: string;
  isLocal?: boolean;
  parentId?: string | null;
}

export interface CurriculumStep {
  id: string;
  snippetId: string;
  order: number;
  note: string;
  isCompleted: boolean;
}

export interface Curriculum {
  id: string;
  name: string;
  description: string;
  steps: CurriculumStep[];
  createdAt: number;
  updatedAt: number;
}

export interface CodeStats {
  totalChars: number;
  totalLines: number;
  htmlLines: number;
  cssLines: number;
  jsLines: number;
  tagCount: number;
  selectorCount: number;
  functionCount: number;
  hasResponsive: boolean;
  hasAnimation: boolean;
  hasExternalResources: boolean;
}

export interface LibraryStats {
  totalSnippets: number;
  totalFolders: number;
  totalCurriculums: number;
  categoryDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  avgCodeLength: number;
  totalCodeLines: number;
  recentActivity: { date: string; count: number }[];
}

export interface AppState {
  code: string;
  isPreviewMode: boolean;
}

export enum AppConstants {
  STORAGE_KEY = 'zen_html_code_v1',
  SNIPPETS_KEY = 'zen_html_snippets_v1',
  FOLDERS_KEY = 'zen_html_folders_v1',
  CURRICULUMS_KEY = 'zen_html_curriculums_v1',
  DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(45deg, #0f0c29, #302b63, #24243e);
      color: white;
      font-family: system-ui;
    }
    .card {
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
      animation: fadeIn 1s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>ZenHTML Runner</h1>
    <p>Your code is running in live preview mode.</p>
    <p>Try the new Library feature to organize your snippets!</p>
  </div>
</body>
</html>`
}
