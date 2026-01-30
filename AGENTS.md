# LeetTomato - Architecture Guide

## Overview

Single-page React application for deliberate coding interview practice. Fully client-side with no backend dependencies.

## Project Structure

```
src/
├── components/        # React components
│   ├── App.tsx        # Main app with state machine
│   ├── ProblemInput.tsx  # Search/autocomplete for problems
│   ├── Timer.tsx      # Timer display with threshold warning + recording dot
│   ├── TimerControls.tsx # Start/pause/next phase buttons + add time offset
│   ├── Settings.tsx   # Collapsible settings panel (thresholds, sound toggle)
│   ├── Checklist.tsx  # Grade selection (1-4) and notes
│   ├── Results.tsx    # Session summary and CSV export
│   └── History.tsx    # Recent sessions table with per-row copy
├── hooks/
│   ├── useTimer.ts    # Timer with threshold tracking + offset + onThresholdCrossed
│   ├── useSettings.ts # localStorage-backed AppSettings (thresholds, sound)
│   ├── useSoundEffects.ts # Audio preload + gated playback (start/warning/complete)
│   ├── useProblemSearch.ts # Problem search/autocomplete
│   ├── useHistory.ts  # localStorage session history
│   └── useLocalStorage.ts  # Generic localStorage hook
├── utils/
│   ├── urlParser.ts   # Extract slug from LeetCode URLs
│   ├── csvFormatter.ts # Generate TSV output (SessionData + HistoryEntry formatters)
│   └── timeFormatter.ts # MM:SS formatting
├── types/
│   └── index.ts       # TypeScript interfaces (includes AppSettings)
├── data/
│   └── problems.json  # Compressed LeetCode DB (~400KB)
└── styles/
    └── tokyo-night.css # Theme CSS variables
public/
└── sounds/            # CC0 WAV sound effects (generated via synthesis)
    ├── start.wav      # Rising chirp — played on timer start
    ├── warning.wav    # Two-tone alert — played on threshold exceeded
    └── complete.wav   # Three-note fanfare — played on session complete
```

## State Machine

```
IDLE → (select problem) → READY
READY → (start) → DESIGN
DESIGN → (next phase) → CODING
CODING → (complete) → GRADING
GRADING → (submit) → COMPLETE
COMPLETE → (new session) → IDLE
```

State managed via `useReducer` in `App.tsx`.

## Key Design Decisions

### Problem Database
- Original `merged_problems.json` (~20MB) compressed to ~400KB
- Keeps only: title, frontend_id, difficulty, slug, topics
- Short keys: `t`, `fid`, `d`, `s`, `tp`
- Loaded synchronously (fast enough for ~3000 problems)

### Timer Implementation
- Timestamp-based calculation to avoid drift
- Stores start time, calculates elapsed on each tick
- 100ms interval for smooth display updates
- Threshold comparison for warning state
- `setInitialOffset(ms)` adds time to accumulated elapsed (additive, not replacing)
- `onThresholdCrossed` callback fires exactly once when elapsed exceeds threshold (reset on `reset()`)
- Entering design/coding phase shows a paused timer; user clicks "Start" to begin counting

### Freeform Problems
- `isLeetCode: boolean` flag distinguishes sources
- Null-safe fields for difficulty, URL, frontendId
- CSV output adapts format based on problem type

### Settings (AppSettings)
- Stored in localStorage under key `leettomato-settings`
- `designThresholdMin` (default 10), `codingThresholdMin` (default 20), `soundEnabled` (default false)
- `useSettings` hook merges with defaults for forward-compatibility
- Collapsible gear-icon panel on idle/ready screen

### Sound Effects
- 3 small WAV files in `public/sounds/` (generated via synthesis, public domain)
- `useSoundEffects` hook preloads Audio objects, gated by `enabled` boolean
- Sounds: start (timer begin), warning (threshold crossed), complete (session done)
- Sound paths use `document.baseURI` to handle Vite `base` config (`/leettomato/`)

### Session History
- Stored in localStorage as JSON array
- Auto-saved when session reaches COMPLETE phase
- Displayed in table on home screen
- Per-row clipboard copy button (uses `formatHistoryEntryAsCsv`)
- Individual delete or clear all

### CSV/TSV Format
- Tab-separated for easy spreadsheet paste
- Notes field sanitized (tabs/newlines → spaces)
- Optional header row toggle
- `formatHistoryEntryAsCsv` for history entries (subset of fields available)

### Layout Stability
- UI elements use `invisible` instead of conditional rendering to reserve space
- Recording dot, "Over time limit!" text, "Add time" row, and "Start Design Phase" button all reserve space when hidden
- Hidden elements use `tabIndex={-1}` to prevent focus when invisible

## Styling

Tokyo Night theme via CSS variables:
- `--bg-main`: #1a1b26
- `--bg-highlight`: #283457
- `--fg-main`: #c0caf5
- `--fg-muted`: #565f89
- `--color-red`: #f7768e (warnings, hard difficulty)
- `--color-green`: #9ece6a (success, easy difficulty)
- `--color-yellow`: #e0af68 (medium difficulty)
- `--color-blue`: #7aa2f7 (primary actions)

Tailwind configured with `tn-*` color aliases.

## Time Thresholds

- Design phase: configurable (default 10 minutes)
- Coding phase: configurable (default 20 minutes)
- Stored in `AppSettings` via `useSettings` hook
- Timer display turns red when threshold exceeded
- `onThresholdCrossed` callback fires warning sound (if enabled)

## Dependencies

- `@heroicons/react` — icons (play, pause, forward, clock, cog, clipboard, check, x-mark)

## Build & Deploy

- Vite for dev server and production builds
- Output to `dist/` directory
- GitHub Pages deployment (base path: `/leettomato/`)
- No environment variables required

## Testing

After making changes, always verify:

1. `pnpm build` — TypeScript compilation must succeed with no errors
2. `pnpm dev --port 5199` — start dev server, then **test in browser using Playwright MCP**:
   - Navigate to `http://localhost:5199/leettomato/`
   - Select a problem (e.g. search "two sum", click result)
   - Click "Start Design Phase" → verify timer is paused at 00:00
   - Test "Add time" offset: set minutes/seconds, click Set, verify timer updates
   - Click Start → verify recording dot appears, timer counts up
   - Click Pause → verify dot disappears, "Add time" row reappears, layout doesn't shift
   - Click "Start Coding" → verify coding phase starts paused
   - Complete session through grading → verify results screen
   - Click "New Session" → verify history table shows entry with copy button
   - Open Settings → verify threshold inputs and sound checkbox
   - Take screenshots at key states to visually verify layout stability
