
import React, { useState, useRef } from 'react';
import { Snippet, Folder } from '../types';

interface LibrarySidebarProps {
  snippets: Snippet[];
  folders: Folder[];
  currentSnippetId: string | null;
  onSelectSnippet: (snippet: Snippet) => void;
  onCreateSnippet: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onDeleteSnippet: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveSnippet: (snippetId: string, folderId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onImportPath: (files: FileList) => void;
}

const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  snippets,
  folders,
  currentSnippetId,
  onSelectSnippet,
  onCreateSnippet,
  onCreateFolder,
  onDeleteSnippet,
  onDeleteFolder,
  onMoveSnippet,
  onRenameFolder,
  onImportPath,
}) => {
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, snippetId: string) => {
    e.dataTransfer.setData('snippetId', snippetId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const snippetId = e.dataTransfer.getData('snippetId');
    onMoveSnippet(snippetId, folderId);
    setDragOverFolder(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportPath(e.target.files);
    }
  };

  const renderSnippet = (snippet: Snippet) => (
    <div
      key={snippet.id}
      draggable={!snippet.isLocal}
      onDragStart={(e) => !snippet.isLocal && handleDragStart(e, snippet.id)}
      onClick={() => onSelectSnippet(snippet)}
      className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-md transition-all text-sm mb-0.5 ${
        currentSnippetId === snippet.id 
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
          : 'text-white/50 hover:bg-white/5 hover:text-white/80'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {snippet.isLocal ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500/60"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        )}
        <span className="truncate text-[12px]">{snippet.name}</span>
      </div>
      {!snippet.isLocal && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDeleteSnippet(snippet.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="w-64 flex flex-col h-full bg-[#0d0d0d] border-r border-white/5 animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Library</h2>
          <div className="flex gap-1">
            <button onClick={onCreateFolder} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 transition-colors" title="New Folder">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            </button>
            <button onClick={() => onCreateSnippet(null)} className="p-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-colors" title="New Snippet">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileInputChange}
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[11px] font-medium text-white/70 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          Open Path (Directory)
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-2 scrollbar-thin">
        {/* Uncategorized Snippets */}
        <div 
          onDragOver={(e) => handleDragOver(e, null)}
          onDrop={(e) => handleDrop(e, null)}
          className={`mb-4 transition-all duration-200 rounded-lg p-1 ${dragOverFolder === null ? 'bg-indigo-500/10' : ''}`}
        >
          {snippets.filter(s => s.folderId === null).map(renderSnippet)}
        </div>

        {/* Folders List */}
        {folders.map(folder => (
          <div 
            key={folder.id} 
            className={`mb-4 rounded-lg transition-all duration-200 ${dragOverFolder === folder.id ? 'bg-indigo-500/10 p-1 ring-1 ring-indigo-500/30' : ''}`}
            onDragOver={(e) => !folder.isLocal && handleDragOver(e, folder.id)}
            onDrop={(e) => !folder.isLocal && handleDrop(e, folder.id)}
          >
            <div className="group flex items-center justify-between px-3 py-1.5 mb-1">
              <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-wider font-bold overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={folder.isLocal ? 'text-amber-500/60' : ''}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                {folder.isLocal ? (
                   <span className="truncate text-white/40">{folder.name}</span>
                ) : (
                  <input 
                    className="bg-transparent border-none focus:outline-none focus:text-white/60 truncate"
                    defaultValue={folder.name}
                    onBlur={(e) => onRenameFolder(folder.id, e.target.value)}
                  />
                )}
              </div>
              {!folder.isLocal && (
                <div className="flex items-center opacity-0 group-hover:opacity-100 gap-1">
                  <button onClick={() => onCreateSnippet(folder.id)} className="p-1 hover:text-indigo-400" title="Add to folder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <button onClick={() => onDeleteFolder(folder.id)} className="p-1 hover:text-red-400" title="Delete folder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              )}
            </div>
            <div className={`pl-4 border-l border-white/5 ml-4`}>
              {snippets.filter(s => s.folderId === folder.id).map(renderSnippet)}
            </div>
          </div>
        ))}
        
        {folders.length === 0 && snippets.length === 0 && (
          <div className="mt-20 text-center px-4">
            <p className="text-[10px] text-white/20 uppercase tracking-widest leading-loose">No snippets yet.<br/>Open a directory to import structure.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySidebar;
