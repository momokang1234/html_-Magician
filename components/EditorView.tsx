
import React from 'react';
import RunnerView from './RunnerView';

interface EditorViewProps {
  code: string;
  setCode: (code: string) => void;
  livePreviewCode: string;
  onRun: () => void;
  onOptimize: () => void;
  onSave: () => void;
  isOptimizing: boolean;
  isLibraryVisible: boolean;
  toggleLibrary: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ 
  code, 
  setCode, 
  livePreviewCode,
  onRun, 
  onOptimize, 
  onSave, 
  isOptimizing,
  isLibraryVisible,
  toggleLibrary
}) => {
  return (
    <div className="flex flex-col h-screen flex-grow bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#0d0d0d] z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLibrary}
            className={`p-1.5 rounded-md transition-all ${isLibraryVisible ? 'bg-indigo-600/20 text-indigo-400' : 'text-white/40 hover:text-white/60'}`}
            title="Toggle Library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white italic">Z</div>
            <div>
              <h1 className="text-xs font-bold text-white leading-none">ZenHTML</h1>
              <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Live Preview</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onOptimize}
            disabled={isOptimizing}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium border border-white/5 transition-all ${isOptimizing ? 'opacity-50' : 'hover:bg-white/5 text-indigo-400'}`}
          >
            {isOptimizing ? 'Optimizing...' : '✨ Optimize'}
          </button>

          <button
            onClick={onSave}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 transition-all"
            title="Download HTML"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-1"></div>

          <button
            onClick={onRun}
            className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            Run Fullscreen
          </button>
        </div>
      </header>

      {/* Main Content: Split Screen */}
      <main className="flex flex-grow overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 relative flex bg-[#0a0a0a] border-r border-white/5">
          <div className="w-10 bg-[#0d0d0d] border-r border-white/5 flex flex-col items-center pt-6 text-[10px] text-white/10 font-mono select-none overflow-hidden">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center leading-none">{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-grow h-full p-6 bg-transparent text-white/80 code-font text-sm leading-relaxed resize-none focus:outline-none placeholder:text-white/10"
            placeholder="<!-- Type your code here... -->"
          />
        </div>

        {/* Preview Pane */}
        <div className="flex-1 bg-white relative">
          <RunnerView code={livePreviewCode} isFullscreen={false} />
          {/* Label for Preview */}
          <div className="absolute top-4 left-4 pointer-events-none opacity-20 z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/50 bg-white/50 px-2 py-1 rounded">Preview</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-8 border-t border-white/5 px-6 bg-[#0d0d0d] flex items-center justify-between text-[10px] text-white/20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Live Updates On</span>
        </div>
        <div>
          <span>{code.length} chars</span>
        </div>
      </footer>
    </div>
  );
};

export default EditorView;
