
import React, { useEffect, useRef } from 'react';

interface RunnerViewProps {
  code: string;
  isFullscreen?: boolean;
}

const RunnerView: React.FC<RunnerViewProps> = ({ code, isFullscreen = false }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleExit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`w-full h-full bg-white flex items-center justify-center ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'relative group'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body > *:not(#print-container) { display: none !important; }
          #print-container { display: block !important; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
          .no-print { display: none !important; }
        }
      `}} />
      
      {/* Floating Toolbar - Visible in Fullscreen or on Hover in Preview */}
      <div className={`no-print flex items-center gap-2 z-[10001] transition-all duration-300 
        ${isFullscreen 
          ? 'fixed top-6 right-6 opacity-70 hover:opacity-100' 
          : 'absolute top-4 right-4 opacity-40 group-hover:opacity-100'}`}>
        
        <button
          onClick={handlePrint}
          className="p-2.5 rounded-lg bg-black/80 backdrop-blur-xl border border-white/20 text-white shadow-xl hover:bg-black transition-all active:scale-90"
          title="Print Document"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        </button>
        
        {isFullscreen && (
          <button
            onClick={handleExit}
            className="p-2.5 rounded-lg bg-black/80 backdrop-blur-xl border border-white/20 text-white shadow-xl hover:bg-black transition-all active:scale-90"
            title="Exit Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <div id="print-container" className="w-full h-full relative">
        <iframe
          ref={iframeRef}
          key={isFullscreen ? 'fullscreen' : 'preview'}
          title="ZenHTML Execution Environment"
          srcDoc={code}
          className="w-full h-full border-none block bg-white"
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    </div>
  );
};

export default RunnerView;
