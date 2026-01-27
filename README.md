# CodeKata

A client-side web app for deliberate coding interview practice. Track timed sessions, look up LeetCode problems, grade yourself, and export to spreadsheets.

## Features

- **Problem Lookup**: Search LeetCode problems by URL, number, or name with autocomplete
- **Custom Problems**: Enter any problem name for non-LeetCode practice
- **Timed Phases**: Design phase (10 min target) and Coding phase (20 min target)
- **Visual Warnings**: Timer turns red when exceeding time thresholds
- **Self-Grading**: Rate yourself 1-4 with optional notes
- **CSV Export**: Copy tab-separated data for pasting into spreadsheets
- **Session History**: View recent sessions stored in localStorage
- **Tokyo Night Theme**: Dark theme optimized for focused practice

## Usage

1. **Enter a Problem**
   - Paste a LeetCode URL (e.g., `https://leetcode.com/problems/two-sum/`)
   - Enter a problem number (e.g., `1` or `#1`)
   - Search by name (e.g., `two sum`)
   - Or type any custom problem name and press Enter

2. **Design Phase**
   - Click "Start Design Phase" to begin
   - Plan your approach, identify data structures, time/space complexity
   - Timer turns red after 10 minutes
   - Click "Start Coding" when ready

3. **Coding Phase**
   - Implement your solution
   - Timer turns red after 20 minutes
   - Click "Complete" when finished

4. **Self-Grading**
   - Rate yourself 1-4 (1 = struggled, 4 = nailed it)
   - Add optional notes about what went well or needs improvement

5. **Results**
   - View session summary with times and grade
   - Click "Copy to Clipboard" to copy CSV data
   - Paste into Google Sheets or Excel

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

Deploy to Cloudflare Pages:
- Build command: `pnpm run build`
- Output directory: `dist`

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage for session history
