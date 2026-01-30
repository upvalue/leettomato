import { useReducer, useCallback, useEffect } from 'react';
import { AppState, AppAction, Problem } from '../types';
import { formatDate } from '../utils/timeFormatter';
import { useTimer } from '../hooks/useTimer';
import { useHistory } from '../hooks/useHistory';
import { useSettings } from '../hooks/useSettings';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { ProblemInput } from './ProblemInput';
import { Timer } from './Timer';
import { TimerControls } from './TimerControls';
import { Checklist } from './Checklist';
import { Results } from './Results';
import { History } from './History';
import { Settings } from './Settings';

const initialState: AppState = {
  phase: 'idle',
  session: {
    problem: null,
    designTime: 0,
    codingTime: 0,
    designOverThreshold: false,
    codingOverThreshold: false,
    grade: null,
    notes: '',
    date: formatDate(new Date()),
  },
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_PROBLEM':
      return {
        ...state,
        phase: 'ready',
        session: {
          ...state.session,
          problem: action.problem,
          date: formatDate(new Date()),
        },
      };
    case 'START_DESIGN':
      return { ...state, phase: 'design' };
    case 'FINISH_DESIGN':
      return {
        ...state,
        phase: 'coding',
        session: {
          ...state.session,
          designTime: action.time,
          designOverThreshold: action.overThreshold,
        },
      };
    case 'FINISH_CODING':
      return {
        ...state,
        phase: 'grading',
        session: {
          ...state.session,
          codingTime: action.time,
          codingOverThreshold: action.overThreshold,
        },
      };
    case 'SET_GRADE':
      return {
        ...state,
        session: {
          ...state.session,
          grade: action.grade,
        },
      };
    case 'SET_NOTES':
      return {
        ...state,
        session: {
          ...state.session,
          notes: action.notes,
        },
      };
    case 'COMPLETE_GRADING':
      return {
        ...state,
        phase: 'complete',
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function Instructions({ designMin, codingMin }: { designMin: number; codingMin: number }) {
  return (
    <div className="text-sm text-tn-muted max-w-xl text-center mb-6">
      <p className="mb-2">
        Practice coding interviews with timed phases. Enter a LeetCode problem or custom problem name to begin.
      </p>
      <p>
        <span className="text-tn-fg">Design phase:</span> {designMin} min target |{' '}
        <span className="text-tn-fg">Coding phase:</span> {codingMin} min target
      </p>
    </div>
  );
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { phase, session } = state;
  const { history, addEntry, deleteEntry, clearHistory } = useHistory();
  const { settings, updateSetting, designThresholdMs, codingThresholdMs } = useSettings();
  const { playStart, playOverThreshold, playComplete } = useSoundEffects(settings.soundEnabled);

  const designTimer = useTimer({
    warningThresholdMs: designThresholdMs,
    onThresholdCrossed: playOverThreshold,
  });
  const codingTimer = useTimer({
    warningThresholdMs: codingThresholdMs,
    onThresholdCrossed: playOverThreshold,
  });

  // Save to history when session completes
  useEffect(() => {
    if (phase === 'complete' && session.problem) {
      addEntry(session);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProblemSelect = useCallback((problem: Problem) => {
    dispatch({ type: 'SELECT_PROBLEM', problem });
  }, []);

  const handleStartDesign = useCallback(() => {
    dispatch({ type: 'START_DESIGN' });
  }, []);

  const handleFinishDesign = useCallback(() => {
    const time = designTimer.getElapsed();
    const overThreshold = designTimer.isOverThreshold;
    designTimer.pause();
    dispatch({ type: 'FINISH_DESIGN', time, overThreshold });
  }, [designTimer]);

  const handleFinishCoding = useCallback(() => {
    const time = codingTimer.getElapsed();
    const overThreshold = codingTimer.isOverThreshold;
    codingTimer.pause();
    dispatch({ type: 'FINISH_CODING', time, overThreshold });
  }, [codingTimer]);

  const handleDesignStart = useCallback(() => {
    designTimer.start();
    playStart();
  }, [designTimer, playStart]);

  const handleCodingStart = useCallback(() => {
    codingTimer.start();
    playStart();
  }, [codingTimer, playStart]);

  const handleGradingComplete = useCallback((grade: number, notes: string) => {
    dispatch({ type: 'SET_GRADE', grade });
    dispatch({ type: 'SET_NOTES', notes });
    dispatch({ type: 'COMPLETE_GRADING' });
    playComplete();
  }, [playComplete]);

  const handleReset = useCallback(() => {
    designTimer.reset();
    codingTimer.reset();
    dispatch({ type: 'RESET' });
  }, [designTimer, codingTimer]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl text-tn-fg mb-4">LeetTomato</h1>

      {(phase === 'idle' || phase === 'ready') && (
        <div className="flex flex-col items-center gap-6 w-full">
          <Instructions
            designMin={settings.designThresholdMin}
            codingMin={settings.codingThresholdMin}
          />
          <ProblemInput onSelect={handleProblemSelect} />
          <button
            onClick={handleStartDesign}
            disabled={phase !== 'ready' || !session.problem}
            className={`px-8 py-4 bg-tn-blue text-tn-bg rounded-lg text-lg hover:bg-opacity-80 transition-colors ${
              phase === 'ready' && session.problem ? '' : 'invisible'
            }`}
          >
            Start Design Phase
          </button>
          <Settings settings={settings} onUpdate={updateSetting} />
          <History entries={history} onDelete={deleteEntry} onClear={clearHistory} />
        </div>
      )}

      {phase === 'design' && (
        <div className="flex flex-col items-center gap-4">
          {session.problem && (
            <div className="text-center mb-4">
              {session.problem.isLeetCode && session.problem.frontendId && (
                <span className="text-tn-muted">#{session.problem.frontendId} </span>
              )}
              <span className="text-tn-fg font-medium">{session.problem.title}</span>
            </div>
          )}
          <Timer
            elapsed={designTimer.elapsed}
            isOverThreshold={designTimer.isOverThreshold}
            isRunning={designTimer.isRunning}
            label="Design Phase"
          />
          <TimerControls
            isRunning={designTimer.isRunning}
            onStart={handleDesignStart}
            onPause={designTimer.pause}
            onNextPhase={handleFinishDesign}
            onSetOffset={designTimer.setInitialOffset}
            nextPhaseLabel="Start Coding"
          />
        </div>
      )}

      {phase === 'coding' && (
        <div className="flex flex-col items-center gap-4">
          {session.problem && (
            <div className="text-center mb-4">
              {session.problem.isLeetCode && session.problem.frontendId && (
                <span className="text-tn-muted">#{session.problem.frontendId} </span>
              )}
              <span className="text-tn-fg font-medium">{session.problem.title}</span>
            </div>
          )}
          <Timer
            elapsed={codingTimer.elapsed}
            isOverThreshold={codingTimer.isOverThreshold}
            isRunning={codingTimer.isRunning}
            label="Coding Phase"
          />
          <TimerControls
            isRunning={codingTimer.isRunning}
            onStart={handleCodingStart}
            onPause={codingTimer.pause}
            onNextPhase={handleFinishCoding}
            onSetOffset={codingTimer.setInitialOffset}
            nextPhaseLabel="Complete"
          />
        </div>
      )}

      {phase === 'grading' && <Checklist onComplete={handleGradingComplete} />}

      {phase === 'complete' && <Results session={session} onReset={handleReset} />}
    </div>
  );
}
