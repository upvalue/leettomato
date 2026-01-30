# LeetTomato

A client-side web app for deliberate coding interview practice. Track timed
sessions, look up LeetCode problems, grade yourself, and export to
spreadsheets.

100% vibe coded in an hour approach with caution.

## Features

- **Problem Lookup**: Search LeetCode problems by URL, number, or name with autocomplete
- **Custom Problems**: Enter any problem name for non-LeetCode practice
- **Timed Phases**: Design phase and Coding phase with configurable time thresholds
- **Recording Indicator**: Pulsing red dot shows when timer is actively running
- **Visual Warnings**: Timer turns red when exceeding time thresholds
- **Add Time Offset**: Add elapsed time before or during a session (e.g. started on paper first)
- **Custom Thresholds**: Configure design/coding time limits via Settings panel (persisted in localStorage)
- **Sound Effects**: Optional 8-bit sound effects for start, threshold warning, and session complete (opt-in via Settings)
- **Self-Grading**: Rate yourself 1-4 with optional notes
- **CSV Export**: Copy tab-separated data for pasting into spreadsheets
- **History Clipboard**: Copy any past session's data from the history table
- **Session History**: View recent sessions stored in localStorage
- **Stable Layout**: UI elements reserve space to prevent layout shifts during state changes
- **Tokyo Night Theme**: Dark theme optimized for focused practice

## Usage

1. **Enter a Problem**
   - Paste a LeetCode URL (e.g., `https://leetcode.com/problems/two-sum/`)
   - Enter a problem number (e.g., `1` or `#1`)
   - Search by name (e.g., `two sum`)
   - Or type any custom problem name and press Enter

2. **Design Phase**
   - Click "Start Design Phase" to begin
   - Timer starts paused — optionally add already-elapsed time via "Add time" inputs
   - Click "Start" to begin timing; a red recording dot indicates the timer is running
   - Plan your approach, identify data structures, time/space complexity
   - Timer turns red when exceeding the configured threshold (default 10 min)
   - Click "Start Coding" when ready

3. **Coding Phase**
   - Timer starts paused — optionally add time offset
   - Implement your solution
   - Timer turns red when exceeding the configured threshold (default 20 min)
   - Click "Complete" when finished

4. **Self-Grading**
   - Rate yourself 1-4 (1 = struggled, 4 = nailed it)
   - Add optional notes about what went well or needs improvement

5. **Results**
   - View session summary with times and grade
   - Click "Copy to Clipboard" to copy CSV data
   - Paste into Google Sheets or Excel
   - Past sessions in the history table also have a clipboard button for copying

## CSV Output Format

Tab-separated columns:
- Date
- Problem (e.g., "Leetcode 1 Two Sum" or custom name)
- URL
- Difficulty (easy/medium/hard)
- Design Time
- Coding Time
- Total Time
- Design Time Exceeded (Y/N)
- Coding Time Exceeded (Y/N)
- Grade (1-4)
- Topics
- Notes

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

Deploys automatically to GitHub Pages on push to `main`.

To enable:
1. Go to repo Settings → Pages
2. Set Source to "GitHub Actions"

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Heroicons (icons)
- localStorage for session history and settings

## Data Source

LeetCode problem database from [mcaupybugs/leetcode-problems-db](https://github.com/mcaupybugs/leetcode-problems-db).

To update the problem database:
1. Download `merged_problems.json` from the repo above
2. Run `node compress-db.js` to generate `src/data/problems.json`
