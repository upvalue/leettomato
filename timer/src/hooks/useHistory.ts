import { useState, useCallback, useEffect } from 'react';
import { HistoryEntry, SessionData } from '../types';

const STORAGE_KEY = 'interview-practice-history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      console.error('Failed to load history from localStorage');
    }
  }, []);

  const saveToStorage = useCallback((entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      console.error('Failed to save history to localStorage');
    }
  }, []);

  const addEntry = useCallback((session: SessionData) => {
    if (!session.problem) return;

    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: session.date,
      problemTitle: session.problem.title,
      problemId: session.problem.frontendId,
      isLeetCode: session.problem.isLeetCode,
      difficulty: session.problem.difficulty,
      designTime: session.designTime,
      codingTime: session.codingTime,
      totalTime: session.designTime + session.codingTime,
      grade: session.grade,
      notes: session.notes,
    };

    setHistory((prev) => {
      const updated = [entry, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntry, deleteEntry, clearHistory };
}
