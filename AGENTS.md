# CodeKata - Architecture Guide

## Overview

Single-page React application for deliberate coding interview practice. Fully client-side with no backend dependencies.

## Project Structure

```
src/
├── components/        # React components
│   ├── App.tsx        # Main app with state machine
│   ├── ProblemInput.tsx  # Search/autocomplete for problems
│   ├── Timer.tsx      # Timer display with threshold warning
│   ├── TimerControls.tsx # Start/pause/next phase buttons
│   ├── Checklist.tsx  # Grade selection (1-4) and notes
│   ├── Results.tsx    # Session summary and CSV export
│   └── History.tsx    # Recent sessions table
├── hooks/
│   ├── useTimer.ts    # Timer with threshold tracking
│   ├── useProblemSearch.ts # Problem search/autocomplete
│   ├── useHistory.ts  # localStorage session history
│   └── useLocalStorage.ts  # Generic localStorage hook
├── utils/
│   ├── urlParser.ts   # Extract slug from LeetCode URLs
│   ├── csvFormatter.ts # Generate TSV output
│   └── timeFormatter.ts # MM:SS formatting
├── types/
│   └── index.ts       # TypeScript interfaces
├── data/
│   └── problems.json  # Compressed LeetCode DB (~400KB)
└── styles/
    └── tokyo-night.css # Theme CSS variables
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

### Freeform Problems
- `isLeetCode: boolean` flag distinguishes sources
- Null-safe fields for difficulty, URL, frontendId
- CSV output adapts format based on problem type

### Session History
- Stored in localStorage as JSON array
- Auto-saved when session reaches COMPLETE phase
- Displayed in table on home screen
- Individual delete or clear all

### CSV/TSV Format
- Tab-separated for easy spreadsheet paste
- Notes field sanitized (tabs/newlines → spaces)
- Optional header row toggle

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

- Design phase: 10 minutes (600,000ms)
- Coding phase: 20 minutes (1,200,000ms)

Timer display turns red when threshold exceeded.

## Build & Deploy

- Vite for dev server and production builds
- Output to `dist/` directory
- Cloudflare Pages compatible (static hosting)
- No environment variables required
