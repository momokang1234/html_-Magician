
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import EditorView from './components/EditorView';
import RunnerView from './components/RunnerView';
import LibrarySidebar from './components/LibrarySidebar';
import StatsPanel from './components/StatsPanel';
import CurriculumView from './components/CurriculumView';
import { AppConstants, Snippet, Folder, Curriculum, CurriculumStep } from './types';
import { improveCodeWithAI } from './services/geminiService';
import { classifySnippet, classifyByHeuristic } from './services/classificationService';
import { analyzeCode, computeLibraryStats } from './services/analyticsService';
import { storage } from './services/storageService';
import { extractH1Content, sanitizeFileName } from './services/fileUtils';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(() => storage.loadCode());

  const [snippets, setSnippets] = useState<Snippet[]>(() => storage.loadSnippets());
  const [folders, setFolders] = useState<Folder[]>(() => storage.loadFolders());
  const [curriculums, setCurriculums] = useState<Curriculum[]>(() => storage.loadCurriculums());
  const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(null);
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);

  const [debouncedCode, setDebouncedCode] = useState<string>(code);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showCurriculum, setShowCurriculum] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef<boolean>(false);

  // Persistence
  useEffect(() => {
    storage.saveCode(code);
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 200);
    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    storage.saveSnippets(snippets);
  }, [snippets]);

  useEffect(() => {
    storage.saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    storage.saveCurriculums(curriculums);
  }, [curriculums]);

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

  // Memoized analytics
  const codeStats = useMemo(() => analyzeCode(code), [code]);
  const libraryStats = useMemo(
    () => computeLibraryStats(snippets, folders, curriculums),
    [snippets, folders, curriculums]
  );

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
    const folderMap = new Map<string, string>();

    const htmlFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.html'));

    for (const file of htmlFiles) {
      const pathParts = file.webkitRelativePath.split('/');
      const fileName = pathParts.pop() || file.name;

      let currentParentId: string | null = null;
      let pathAccumulator = "";

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

      const content = await file.text();
      const h1Title = extractH1Content(content, fileName);
      const sanitizedName = sanitizeFileName(h1Title);

      // Auto-classify on import using heuristic (fast, no API call)
      const classification = classifyByHeuristic(content);

      newSnippets.push({
        id: crypto.randomUUID(),
        name: sanitizedName,
        code: content,
        folderId: currentParentId,
        updatedAt: Date.now(),
        isLocal: true,
        filePath: file.webkitRelativePath,
        category: classification.category,
        tags: classification.tags,
        difficulty: classification.difficulty,
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

  // --- Auto-Classification ---
  const handleClassifyAll = async () => {
    if (isClassifying || snippets.length === 0) return;
    setIsClassifying(true);
    try {
      const updated = [...snippets];
      for (let i = 0; i < updated.length; i++) {
        const snippet = updated[i];
        try {
          const result = await classifySnippet(snippet.code);
          updated[i] = {
            ...snippet,
            category: result.category,
            tags: result.tags,
            difficulty: result.difficulty,
          };
        } catch {
          const fallback = classifyByHeuristic(snippet.code);
          updated[i] = {
            ...snippet,
            category: fallback.category,
            tags: fallback.tags,
            difficulty: fallback.difficulty,
          };
        }
      }
      setSnippets(updated);
    } finally {
      setIsClassifying(false);
    }
  };

  // --- Curriculum Management ---
  const handleCreateCurriculum = (name: string, description: string) => {
    const newCurriculum: Curriculum = {
      id: crypto.randomUUID(),
      name,
      description,
      steps: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurriculums([...curriculums, newCurriculum]);
  };

  const handleDeleteCurriculum = (id: string) => {
    if (confirm('Delete this curriculum?')) {
      setCurriculums(curriculums.filter(c => c.id !== id));
    }
  };

  const handleAddStep = (curriculumId: string, snippetId: string, note: string) => {
    setCurriculums(curriculums.map(c => {
      if (c.id !== curriculumId) return c;
      const newStep: CurriculumStep = {
        id: crypto.randomUUID(),
        snippetId,
        order: c.steps.length,
        note,
        isCompleted: false,
      };
      return { ...c, steps: [...c.steps, newStep], updatedAt: Date.now() };
    }));
  };

  const handleRemoveStep = (curriculumId: string, stepId: string) => {
    setCurriculums(curriculums.map(c => {
      if (c.id !== curriculumId) return c;
      const remaining = c.steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i }));
      return { ...c, steps: remaining, updatedAt: Date.now() };
    }));
  };

  const handleToggleStep = (curriculumId: string, stepId: string) => {
    setCurriculums(curriculums.map(c => {
      if (c.id !== curriculumId) return c;
      return {
        ...c,
        steps: c.steps.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s),
        updatedAt: Date.now(),
      };
    }));
  };

  const handleReorderStep = (curriculumId: string, stepId: string, direction: 'up' | 'down') => {
    setCurriculums(curriculums.map(c => {
      if (c.id !== curriculumId) return c;
      const sorted = [...c.steps].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === stepId);
      if (idx < 0) return c;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return c;
      [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
      const reordered = sorted.map((s, i) => ({ ...s, order: i }));
      return { ...c, steps: reordered, updatedAt: Date.now() };
    }));
  };

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
              onClassifyAll={handleClassifyAll}
              onOpenStats={() => setShowStats(true)}
              onOpenCurriculum={() => setShowCurriculum(true)}
              isClassifying={isClassifying}
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

      {/* Modal overlays */}
      {showStats && (
        <StatsPanel
          codeStats={codeStats}
          libraryStats={libraryStats}
          onClose={() => setShowStats(false)}
        />
      )}

      {showCurriculum && (
        <CurriculumView
          curriculums={curriculums}
          snippets={snippets}
          onCreateCurriculum={handleCreateCurriculum}
          onDeleteCurriculum={handleDeleteCurriculum}
          onAddStep={handleAddStep}
          onRemoveStep={handleRemoveStep}
          onToggleStep={handleToggleStep}
          onReorderStep={handleReorderStep}
          onSelectSnippet={(snippet) => {
            handleSelectSnippet(snippet);
            setShowCurriculum(false);
          }}
          onClose={() => setShowCurriculum(false)}
        />
      )}
    </div>
  );
};

export default App;
