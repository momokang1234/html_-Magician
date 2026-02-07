
import { CodeStats, LibraryStats, Snippet, Folder, Curriculum, SnippetCategory } from '../types';

/**
 * Analyzes a single code string and returns detailed statistics.
 */
export const analyzeCode = (code: string): CodeStats => {
  const lines = code.split('\n');
  const totalLines = lines.length;

  // Separate sections
  let inStyle = false;
  let inScript = false;
  let htmlLines = 0;
  let cssLines = 0;
  let jsLines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/<style[\s>]/i.test(trimmed)) inStyle = true;
    if (/<\/style>/i.test(trimmed)) { inStyle = false; cssLines++; continue; }
    if (/<script[\s>]/i.test(trimmed)) inScript = true;
    if (/<\/script>/i.test(trimmed)) { inScript = false; jsLines++; continue; }

    if (inStyle) cssLines++;
    else if (inScript) jsLines++;
    else if (trimmed.length > 0) htmlLines++;
  }

  // Count HTML tags
  const tagMatches = code.match(/<[a-z][a-z0-9-]*/gi);
  const tagCount = tagMatches ? tagMatches.length : 0;

  // Count CSS selectors (rough)
  const styleBlocks = code.match(/<style[\s\S]*?<\/style>/gi) || [];
  const allCSS = styleBlocks.join('\n');
  const selectorMatches = allCSS.match(/[^{}]+(?=\s*\{)/g);
  const selectorCount = selectorMatches ? selectorMatches.length : 0;

  // Count JS functions
  const scriptBlocks = code.match(/<script[\s\S]*?<\/script>/gi) || [];
  const allJS = scriptBlocks.join('\n');
  const funcMatches = allJS.match(/function\s+\w+|=>\s*[({]|\.addEventListener/g);
  const functionCount = funcMatches ? funcMatches.length : 0;

  // Feature detection
  const hasResponsive = /@media/i.test(code);
  const hasAnimation = /@keyframes|animation:|transition:/i.test(code);
  const hasExternalResources = /src=["']https?:|href=["']https?:/i.test(code);

  return {
    totalChars: code.length,
    totalLines,
    htmlLines,
    cssLines,
    jsLines,
    tagCount,
    selectorCount,
    functionCount,
    hasResponsive,
    hasAnimation,
    hasExternalResources,
  };
};

/**
 * Computes aggregate statistics for the entire snippet library.
 */
export const computeLibraryStats = (
  snippets: Snippet[],
  folders: Folder[],
  curriculums: Curriculum[]
): LibraryStats => {
  const categoryDistribution: Record<string, number> = {};
  const difficultyDistribution: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
  let totalCodeChars = 0;
  let totalCodeLines = 0;

  for (const cat of Object.values(SnippetCategory)) {
    categoryDistribution[cat] = 0;
  }

  for (const snippet of snippets) {
    const cat = snippet.category || SnippetCategory.UNCATEGORIZED;
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

    const diff = snippet.difficulty || 'beginner';
    difficultyDistribution[diff] = (difficultyDistribution[diff] || 0) + 1;

    totalCodeChars += snippet.code.length;
    totalCodeLines += snippet.code.split('\n').length;
  }

  // Recent activity (last 14 days)
  const now = Date.now();
  const dayMs = 86400000;
  const recentActivity: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = now - i * dayMs;
    const dayEnd = dayStart + dayMs;
    const dateStr = new Date(dayStart).toISOString().split('T')[0];
    const count = snippets.filter(s => s.updatedAt >= dayStart && s.updatedAt < dayEnd).length;
    recentActivity.push({ date: dateStr, count });
  }

  return {
    totalSnippets: snippets.length,
    totalFolders: folders.length,
    totalCurriculums: curriculums.length,
    categoryDistribution,
    difficultyDistribution,
    avgCodeLength: snippets.length > 0 ? Math.round(totalCodeChars / snippets.length) : 0,
    totalCodeLines,
    recentActivity,
  };
};
