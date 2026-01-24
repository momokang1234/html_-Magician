
export interface Snippet {
  id: string;
  name: string;
  code: string;
  folderId: string | null;
  updatedAt: number;
  isLocal?: boolean;
  filePath?: string;
}

export interface Folder {
  id: string;
  name: string;
  isLocal?: boolean;
  parentId?: string | null;
}

export interface AppState {
  code: string;
  isPreviewMode: boolean;
}

export enum AppConstants {
  STORAGE_KEY = 'zen_html_code_v1',
  SNIPPETS_KEY = 'zen_html_snippets_v1',
  FOLDERS_KEY = 'zen_html_folders_v1',
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
