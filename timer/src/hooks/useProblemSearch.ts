import { useState, useMemo, useCallback } from 'react';
import { CompressedProblem, Problem } from '../types';
import { extractSlugFromUrl, buildLeetCodeUrl } from '../utils/urlParser';
import problemsData from '../data/problems.json';

const problems = problemsData as CompressedProblem[];

function decompress(p: CompressedProblem): Problem {
  return {
    title: p.t,
    frontendId: p.fid,
    difficulty: p.d,
    slug: p.s,
    topics: p.tp,
    url: buildLeetCodeUrl(p.s),
    isLeetCode: true,
  };
}

export function createFreeformProblem(title: string): Problem {
  return {
    title,
    frontendId: null,
    difficulty: null,
    slug: null,
    topics: [],
    url: null,
    isLeetCode: false,
  };
}

interface UseProblemSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: Problem[];
  selectedProblem: Problem | null;
  selectProblem: (p: Problem) => void;
  selectFreeform: () => void;
  clearSelection: () => void;
}

export function useProblemSearch(): UseProblemSearchReturn {
  const [query, setQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const slugIndex = useMemo(() => {
    const index = new Map<string, CompressedProblem>();
    for (const p of problems) {
      index.set(p.s, p);
    }
    return index;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    // Check if it's a LeetCode URL
    const slug = extractSlugFromUrl(query);
    if (slug) {
      const found = slugIndex.get(slug);
      return found ? [decompress(found)] : [];
    }

    // Check if it's a problem number
    const numMatch = query.match(/^\s*#?(\d+)\s*$/);
    if (numMatch) {
      const num = numMatch[1];
      const found = problems.find(p => p.fid === num);
      return found ? [decompress(found)] : [];
    }

    // Text search on title
    const lowerQuery = query.toLowerCase().trim();
    const matches = problems
      .filter(p => p.t.toLowerCase().includes(lowerQuery))
      .slice(0, 10)
      .map(decompress);

    return matches;
  }, [query, slugIndex]);

  const selectProblem = useCallback((p: Problem) => {
    setSelectedProblem(p);
    setQuery(p.title);
  }, []);

  const selectFreeform = useCallback(() => {
    if (query.trim()) {
      setSelectedProblem(createFreeformProblem(query.trim()));
    }
  }, [query]);

  const clearSelection = useCallback(() => {
    setSelectedProblem(null);
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    selectedProblem,
    selectProblem,
    selectFreeform,
    clearSelection,
  };
}
