
import React, { useMemo } from 'react';
import { CodeStats, LibraryStats, CATEGORY_COLORS, SnippetCategory } from '../types';

interface StatsPanelProps {
  codeStats: CodeStats;
  libraryStats: LibraryStats;
  onClose: () => void;
}

const StatBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-20 text-white/40 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right text-white/50">{value}</span>
    </div>
  );
};

const MiniCard: React.FC<{ title: string; value: string | number; sub?: string }> = ({ title, value, sub }) => (
  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
    <p className="text-[9px] text-white/30 uppercase tracking-widest">{title}</p>
    <p className="text-xl font-bold text-white mt-1">{value}</p>
    {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ codeStats, libraryStats, onClose }) => {
  const maxCategory = useMemo(() => {
    const values = Object.values(libraryStats.categoryDistribution) as number[];
    return Math.max(1, ...values);
  }, [libraryStats]);

  const maxActivity = useMemo(() => {
    return Math.max(1, ...libraryStats.recentActivity.map(a => a.count));
  }, [libraryStats]);

  const codeComposition = useMemo(() => {
    const total = codeStats.htmlLines + codeStats.cssLines + codeStats.jsLines;
    return { total: Math.max(total, 1), html: codeStats.htmlLines, css: codeStats.cssLines, js: codeStats.jsLines };
  }, [codeStats]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[720px] max-h-[85vh] bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white">Analytics Dashboard</h2>
            <p className="text-[10px] text-white/30 mt-0.5">Code statistics & library insights</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <MiniCard title="Snippets" value={libraryStats.totalSnippets} sub={`${libraryStats.totalFolders} folders`} />
            <MiniCard title="Total Lines" value={libraryStats.totalCodeLines.toLocaleString()} sub="across all snippets" />
            <MiniCard title="Avg Length" value={libraryStats.avgCodeLength.toLocaleString()} sub="chars per snippet" />
            <MiniCard title="Curriculums" value={libraryStats.totalCurriculums} sub="learning paths" />
          </div>

          {/* Current Code Analysis */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Current File Composition</h3>
            <div className="flex gap-1 h-5 rounded-full overflow-hidden mb-3">
              <div className="transition-all duration-500 rounded-l-full" style={{ width: `${(codeComposition.html / codeComposition.total) * 100}%`, backgroundColor: '#f97316' }} title={`HTML: ${codeComposition.html} lines`} />
              <div className="transition-all duration-500" style={{ width: `${(codeComposition.css / codeComposition.total) * 100}%`, backgroundColor: '#3b82f6' }} title={`CSS: ${codeComposition.css} lines`} />
              <div className="transition-all duration-500 rounded-r-full" style={{ width: `${(codeComposition.js / codeComposition.total) * 100}%`, backgroundColor: '#eab308' }} title={`JS: ${codeComposition.js} lines`} />
            </div>
            <div className="flex gap-4 text-[10px] text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" />HTML {codeComposition.html}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />CSS {codeComposition.css}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" />JS {codeComposition.js}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center py-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">{codeStats.tagCount}</p>
                <p className="text-[9px] text-white/30 uppercase">HTML Tags</p>
              </div>
              <div className="text-center py-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">{codeStats.selectorCount}</p>
                <p className="text-[9px] text-white/30 uppercase">CSS Selectors</p>
              </div>
              <div className="text-center py-2 rounded-lg bg-white/5">
                <p className="text-lg font-bold text-white">{codeStats.functionCount}</p>
                <p className="text-[9px] text-white/30 uppercase">JS Functions</p>
              </div>
            </div>

            {/* Feature badges */}
            <div className="flex gap-2 mt-3">
              {codeStats.hasResponsive && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] border border-blue-500/20">Responsive</span>}
              {codeStats.hasAnimation && <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[9px] border border-purple-500/20">Animated</span>}
              {codeStats.hasExternalResources && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] border border-amber-500/20">External Resources</span>}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Category Distribution</h3>
            <div className="space-y-2">
              {(Object.entries(libraryStats.categoryDistribution) as [string, number][])
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <StatBar
                    key={cat}
                    label={cat}
                    value={count}
                    max={maxCategory}
                    color={CATEGORY_COLORS[cat as SnippetCategory] || '#666'}
                  />
                ))}
              {(Object.values(libraryStats.categoryDistribution) as number[]).every(v => v === 0) && (
                <p className="text-[10px] text-white/20 text-center py-4">No categorized snippets yet. Use auto-classify to get started.</p>
              )}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Difficulty Breakdown</h3>
            <div className="flex gap-3">
              {[
                { key: 'beginner', label: 'Beginner', color: '#10b981' },
                { key: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
                { key: 'advanced', label: 'Advanced', color: '#ef4444' },
              ].map(({ key, label, color }) => {
                const val = libraryStats.difficultyDistribution[key] || 0;
                const total = libraryStats.totalSnippets || 1;
                return (
                  <div key={key} className="flex-1 text-center py-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${color}20`, color }}>
                      {val}
                    </div>
                    <p className="text-[9px] text-white/40 uppercase">{label}</p>
                    <p className="text-[10px] text-white/20">{Math.round((val / total) * 100)}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">14-Day Activity</h3>
            <div className="flex items-end gap-1 h-20">
              {libraryStats.recentActivity.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max((day.count / maxActivity) * 100, day.count > 0 ? 8 : 2)}%`,
                      backgroundColor: day.count > 0 ? '#6366f1' : '#ffffff08',
                    }}
                    title={`${day.date}: ${day.count} snippets`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-white/20">{libraryStats.recentActivity[0]?.date.slice(5)}</span>
              <span className="text-[8px] text-white/20">{libraryStats.recentActivity[libraryStats.recentActivity.length - 1]?.date.slice(5)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
