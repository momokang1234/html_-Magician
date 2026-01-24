
import React, { useState, useEffect, useCallback, useRef } from 'react';
import EditorView from './components/EditorView';
import RunnerView from './components/RunnerView';
import LibrarySidebar from './components/LibrarySidebar';
import { AppConstants, Snippet, Folder } from './types';
import { improveCodeWithAI } from './services/geminiService';
import { extractH1Content, sanitizeFileName } from './services/fileUtils';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    const saved = localStorage.getItem(AppConstants.STORAGE_KEY);
    return saved || AppConstants.DEFAULT_HTML;
  });
  
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const saved = localStorage.getItem(AppConstants.SNIPPETS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem(AppConstants.FOLDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(null);
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);

  const [debouncedCode, setDebouncedCode] = useState<string>(code);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef<boolean>(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(AppConstants.STORAGE_KEY, code);
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 200);
    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    const persistentSnippets = snippets.filter(s => !s.isLocal);
    localStorage.setItem(AppConstants.SNIPPETS_KEY, JSON.stringify(persistentSnippets));
  }, [snippets]);

  useEffect(() => {
    const persistentFolders = folders.filter(f => !f.isLocal);
    localStorage.setItem(AppConstants.FOLDERS_KEY, JSON.stringify(persistentFolders));
  }, [folders]);

  useEffect(() => {
    if (currentSnippetId) {
      const current = snippets.find(s => s.id === currentSnippetId);
      if (current && !current.isLocal) {
        setSnippets(prev => prev.map(s => 
          s.id === currentSnippetId ? { ...s, code, updatedAt: Date.now() } : s
        ));
      }
    }
  }, [code, currentSnippetId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsPreviewMode(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) isTransitioning.current = false;
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRunFullscreen = useCallback(async () => {
    if (isTransitioning.current || !containerRef.current) return;
    try {
      isTransitioning.current = true;
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen failed:", err);
      isTransitioning.current = false;
      setIsPreviewMode(true);
    }
  }, []);

  const handleCreateSnippet = (folderId: string | null) => {
    const newSnippet: Snippet = {
      id: crypto.randomUUID(),
      name: `Snippet ${snippets.length + 1}`,
      code: AppConstants.DEFAULT_HTML,
      folderId,
      updatedAt: Date.now(),
    };
    setSnippets([...snippets, newSnippet]);
    setCurrentSnippetId(newSnippet.id);
    setCode(newSnippet.code);
  };

  const handleCreateFolder = () => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: `Folder ${folders.length + 1}`,
    };
    setFolders([...folders, newFolder]);
  };

  const handleImportPath = async (fileList: FileList) => {
    const newFolders: Folder[] = [];
    const newSnippets: Snippet[] = [];
    const folderMap = new Map<string, string>(); // Path -> FolderID

    // Extract files that end with .html
    const htmlFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.html'));

    for (const file of htmlFiles) {
      // webkitRelativePath example: "root/sub/index.html"
      const pathParts = file.webkitRelativePath.split('/');
      const fileName = pathParts.pop() || file.name;
      
      let currentParentId: string | null = null;
      let pathAccumulator = "";

      // Process directory structure
      for (const part of pathParts) {
        pathAccumulator += (pathAccumulator ? '/' : '') + part;
        if (!folderMap.has(pathAccumulator)) {
          const folderId = crypto.randomUUID();
          newFolders.push({
            id: folderId,
            name: part,
            isLocal: true,
            parentId: currentParentId
          });
          folderMap.set(pathAccumulator, folderId);
        }
        currentParentId = folderMap.get(pathAccumulator) || null;
      }

      // Read file content
      const content = await file.text();
      const h1Title = extractH1Content(content, fileName);
      const sanitizedName = sanitizeFileName(h1Title);

      newSnippets.push({
        id: crypto.randomUUID(),
        name: sanitizedName,
        code: content,
        folderId: currentParentId,
        updatedAt: Date.now(),
        isLocal: true,
        filePath: file.webkitRelativePath
      });
    }

    setFolders(prev => [...prev.filter(f => !f.isLocal), ...newFolders]);
    setSnippets(prev => [...prev.filter(s => !s.isLocal), ...newSnippets]);
  };

  const handleDeleteSnippet = (id: string) => {
    if (confirm('Delete this snippet?')) {
      setSnippets(snippets.filter(s => s.id !== id));
      if (currentSnippetId === id) setCurrentSnippetId(null);
    }
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('Delete this folder and move snippets to uncategorized?')) {
      setFolders(folders.filter(f => f.id !== id));
      setSnippets(snippets.map(s => s.folderId === id ? { ...s, folderId: null } : s));
    }
  };

  const handleSelectSnippet = (snippet: Snippet) => {
    setCurrentSnippetId(snippet.id);
    setCode(snippet.code);
  };

  const handleMoveSnippet = (snippetId: string, folderId: string | null) => {
    setSnippets(snippets.map(s => s.id === snippetId ? { ...s, folderId } : s));
  };

  const handleRenameFolder = (id: string, name: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleOptimize = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    try {
      const optimized = await improveCodeWithAI(code);
      setCode(optimized);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = useCallback(() => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zen-${currentSnippetId || 'export'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [code, currentSnippetId]);

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a] flex">
      {isPreviewMode ? (
        <RunnerView code={code} isFullscreen={true} />
      ) : (
        <>
          {isLibraryVisible && (
            <LibrarySidebar
              snippets={snippets}
              folders={folders}
              currentSnippetId={currentSnippetId}
              onSelectSnippet={handleSelectSnippet}
              onCreateSnippet={handleCreateSnippet}
              onCreateFolder={handleCreateFolder}
              onDeleteSnippet={handleDeleteSnippet}
              onDeleteFolder={handleDeleteFolder}
              onMoveSnippet={handleMoveSnippet}
              onRenameFolder={handleRenameFolder}
              onImportPath={handleImportPath}
            />
          )}
          <EditorView 
            code={code} 
            setCode={setCode} 
            livePreviewCode={debouncedCode}
            onRun={handleRunFullscreen} 
            onOptimize={handleOptimize}
            onSave={handleSave}
            isOptimizing={isOptimizing}
            isLibraryVisible={isLibraryVisible}
            toggleLibrary={() => setIsLibraryVisible(!isLibraryVisible)}
          />
        </>
      )}
    </div>
  );
};

export default App;
