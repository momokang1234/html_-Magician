
import { GoogleGenAI } from "@google/genai";
import { SnippetCategory, DifficultyLevel } from '../types';

export interface ClassificationResult {
  category: SnippetCategory;
  tags: string[];
  difficulty: DifficultyLevel;
}

/**
 * Uses Gemini to auto-classify an HTML snippet's category, tags, and difficulty.
 */
export const classifySnippet = async (code: string): Promise<ClassificationResult> => {
  const fallback: ClassificationResult = {
    category: SnippetCategory.UNCATEGORIZED,
    tags: [],
    difficulty: 'beginner',
  };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const categories = Object.values(SnippetCategory).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this HTML/CSS/JS code and return a JSON object with exactly these fields:
- "category": one of [${categories}]
- "tags": array of 2-5 short descriptive tags (e.g. "flexbox", "dark-theme", "canvas", "responsive")
- "difficulty": one of ["beginner", "intermediate", "advanced"]

Return ONLY valid JSON. No markdown, no explanation.

Code:
${code.substring(0, 3000)}`,
    });

    const text = response.text?.trim() || '';
    const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    const validCategory = Object.values(SnippetCategory).includes(parsed.category)
      ? parsed.category
      : SnippetCategory.UNCATEGORIZED;

    const validDifficulty = ['beginner', 'intermediate', 'advanced'].includes(parsed.difficulty)
      ? parsed.difficulty as DifficultyLevel
      : 'beginner';

    return {
      category: validCategory,
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 5) : [],
      difficulty: validDifficulty,
    };
  } catch (error) {
    console.error("Classification failed:", error);
    return classifyByHeuristic(code);
  }
};

/**
 * Fast heuristic fallback when AI is unavailable.
 */
export const classifyByHeuristic = (code: string): ClassificationResult => {
  const lower = code.toLowerCase();
  const tags: string[] = [];
  let category = SnippetCategory.UNCATEGORIZED;
  let difficulty: DifficultyLevel = 'beginner';

  // Detect features for tagging
  if (/@keyframes|animation:|transition:/.test(lower)) tags.push('animation');
  if (/@media/.test(lower)) tags.push('responsive');
  if (/display:\s*flex/.test(lower)) tags.push('flexbox');
  if (/display:\s*grid/.test(lower)) tags.push('css-grid');
  if (/<canvas/.test(lower)) tags.push('canvas');
  if (/<form/.test(lower)) tags.push('form');
  if (/fetch\(|xmlhttprequest|axios/i.test(lower)) tags.push('api');
  if (/<svg/.test(lower)) tags.push('svg');
  if (/chart|graph|plot/i.test(lower)) tags.push('data-viz');
  if (/localstorage|sessionstorage/i.test(lower)) tags.push('storage');

  // Category detection
  if (/<canvas/.test(lower) && /(game|score|player|collision)/i.test(lower)) {
    category = SnippetCategory.GAME;
  } else if (tags.includes('data-viz') || /<canvas/.test(lower) && /draw|chart/i.test(lower)) {
    category = SnippetCategory.DATA_VISUALIZATION;
  } else if (tags.includes('animation') && code.match(/@keyframes/gi)?.length! > 2) {
    category = SnippetCategory.ANIMATION;
  } else if (/<form/.test(lower) && /<input/.test(lower)) {
    category = SnippetCategory.FORM;
  } else if (tags.includes('api')) {
    category = SnippetCategory.API_INTEGRATION;
  } else if (/<nav|<header|<footer|<aside/.test(lower) && /<section|<main/.test(lower)) {
    category = SnippetCategory.LANDING_PAGE;
  } else if (/@media/.test(lower) || /display:\s*(flex|grid)/.test(lower)) {
    category = SnippetCategory.LAYOUT;
  } else if (/<button|<modal|<dialog|<dropdown/i.test(lower)) {
    category = SnippetCategory.UI_COMPONENT;
  }

  // Difficulty estimation
  const lineCount = code.split('\n').length;
  const jsBlocks: string[] = code.match(/<script[\s\S]*?<\/script>/gi) || [];
  const totalJsLength = jsBlocks.reduce((sum: number, b: string) => sum + b.length, 0);

  if (lineCount > 200 || totalJsLength > 2000 || tags.length > 4) {
    difficulty = 'advanced';
  } else if (lineCount > 80 || totalJsLength > 500 || tags.length > 2) {
    difficulty = 'intermediate';
  }

  return { category, tags: tags.slice(0, 5), difficulty };
};
