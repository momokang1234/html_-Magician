
import React, { useState } from 'react';
import { Curriculum, CurriculumStep, Snippet } from '../types';

interface CurriculumViewProps {
  curriculums: Curriculum[];
  snippets: Snippet[];
  onCreateCurriculum: (name: string, description: string) => void;
  onDeleteCurriculum: (id: string) => void;
  onAddStep: (curriculumId: string, snippetId: string, note: string) => void;
  onRemoveStep: (curriculumId: string, stepId: string) => void;
  onToggleStep: (curriculumId: string, stepId: string) => void;
  onReorderStep: (curriculumId: string, stepId: string, direction: 'up' | 'down') => void;
  onSelectSnippet: (snippet: Snippet) => void;
  onClose: () => void;
}

const CurriculumView: React.FC<CurriculumViewProps> = ({
  curriculums,
  snippets,
  onCreateCurriculum,
  onDeleteCurriculum,
  onAddStep,
  onRemoveStep,
  onToggleStep,
  onReorderStep,
  onSelectSnippet,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(curriculums[0]?.id || null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('');
  const [stepNote, setStepNote] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateCurriculum(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
  };

  const handleAddStep = (curriculumId: string) => {
    if (!selectedSnippetId) return;
    onAddStep(curriculumId, selectedSnippetId, stepNote);
    setSelectedSnippetId('');
    setStepNote('');
    setAddingTo(null);
  };

  const getSnippetName = (snippetId: string): string => {
    return snippets.find(s => s.id === snippetId)?.name || 'Unknown Snippet';
  };

  const getProgress = (curriculum: Curriculum): number => {
    if (curriculum.steps.length === 0) return 0;
    const completed = curriculum.steps.filter(s => s.isCompleted).length;
    return Math.round((completed / curriculum.steps.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[640px] max-h-[85vh] bg-[#111] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white">Curriculum Manager</h2>
            <p className="text-[10px] text-white/30 mt-0.5">Organize snippets into learning paths</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {/* Create New */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Create New Curriculum</h3>
            <div className="space-y-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Curriculum name (e.g. CSS Animation Basics)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
              />
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Short description..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-[11px] font-bold transition-all"
              >
                Create Curriculum
              </button>
            </div>
          </div>

          {/* Curriculum List */}
          {curriculums.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/20 text-[10px] uppercase tracking-widest">No curriculums yet.</p>
              <p className="text-white/10 text-[10px] mt-1">Create one above to start organizing your learning path.</p>
            </div>
          )}

          {curriculums.map(curriculum => {
            const progress = getProgress(curriculum);
            const isExpanded = expandedId === curriculum.id;

            return (
              <div key={curriculum.id} className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                {/* Curriculum Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : curriculum.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"/></svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{curriculum.name}</p>
                      {curriculum.description && <p className="text-[10px] text-white/30 truncate">{curriculum.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] text-white/30 w-8">{progress}%</span>
                    </div>
                    <span className="text-[10px] text-white/20">{curriculum.steps.length} steps</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-4 py-3 space-y-2">
                    {curriculum.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step, idx) => (
                        <div key={step.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors ${step.isCompleted ? 'bg-green-500/5' : 'bg-white/[0.02]'}`}>
                          <button
                            onClick={() => onToggleStep(curriculum.id, step.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${step.isCompleted ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-indigo-400'}`}
                          >
                            {step.isCompleted && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </button>
                          <span className="text-[10px] text-white/20 w-4">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => {
                                const s = snippets.find(sn => sn.id === step.snippetId);
                                if (s) onSelectSnippet(s);
                              }}
                              className={`text-sm hover:text-indigo-400 transition-colors truncate block ${step.isCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}
                            >
                              {getSnippetName(step.snippetId)}
                            </button>
                            {step.note && <p className="text-[10px] text-white/20 truncate">{step.note}</p>}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onReorderStep(curriculum.id, step.id, 'up')} className="p-1 hover:text-white/60 text-white/20" title="Move up">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                            </button>
                            <button onClick={() => onReorderStep(curriculum.id, step.id, 'down')} className="p-1 hover:text-white/60 text-white/20" title="Move down">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            <button onClick={() => onRemoveStep(curriculum.id, step.id)} className="p-1 hover:text-red-400 text-white/20" title="Remove">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Add Step */}
                    {addingTo === curriculum.id ? (
                      <div className="flex flex-col gap-2 mt-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <select
                          value={selectedSnippetId}
                          onChange={e => setSelectedSnippetId(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none"
                        >
                          <option value="">Select a snippet...</option>
                          {snippets.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <input
                          value={stepNote}
                          onChange={e => setStepNote(e.target.value)}
                          placeholder="Optional note for this step..."
                          className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddStep(curriculum.id)}
                            disabled={!selectedSnippetId}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-[10px] font-bold"
                          >
                            Add Step
                          </button>
                          <button
                            onClick={() => setAddingTo(null)}
                            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white/50 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => setAddingTo(curriculum.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 text-[10px] font-medium transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Add Step
                        </button>
                        <button
                          onClick={() => onDeleteCurriculum(curriculum.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 text-[10px] font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurriculumView;
