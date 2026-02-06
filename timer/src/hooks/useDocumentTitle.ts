import { useEffect } from 'react';
import { AppPhase } from '../types';

const DEFAULT_TITLE = 'LeetTomato';

export function useDocumentTitle(phase: AppPhase, problemTitle: string | null) {
  useEffect(() => {
    const isActive = phase !== 'idle' && phase !== 'complete';

    if (isActive && problemTitle) {
      document.title = `\u23F1 ACTIVE - ${problemTitle} | ${DEFAULT_TITLE}`;
    } else {
      document.title = DEFAULT_TITLE;
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [phase, problemTitle]);
}
