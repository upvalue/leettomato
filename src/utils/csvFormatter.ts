import { SessionData } from '../types';
import { formatTimeForExport } from './timeFormatter';

function getDifficultyLabel(d: 'E' | 'M' | 'H' | null): string {
  if (d === null) return '';
  return d === 'E' ? 'easy' : d === 'M' ? 'medium' : 'hard';
}

function formatProblemName(problem: SessionData['problem']): string {
  if (!problem) return '';
  if (problem.isLeetCode && problem.frontendId) {
    return `Leetcode ${problem.frontendId} ${problem.title}`;
  }
  return problem.title;
}

function sanitizeForTsv(text: string): string {
  return text.replace(/[\t\r\n]+/g, ' ').trim();
}

export function formatSessionAsCsv(session: SessionData): string {
  if (!session.problem) return '';

  const { problem, designTime, codingTime, designOverThreshold, codingOverThreshold, grade, notes, date } = session;
  const totalTime = designTime + codingTime;

  const columns = [
    date,
    formatProblemName(problem),
    problem.url || '',
    getDifficultyLabel(problem.difficulty),
    formatTimeForExport(designTime),
    formatTimeForExport(codingTime),
    formatTimeForExport(totalTime),
    designOverThreshold ? 'Y' : 'N',
    codingOverThreshold ? 'Y' : 'N',
    grade !== null ? grade.toString() : '',
    problem.topics.join(', '),
    sanitizeForTsv(notes),
  ];

  return columns.join('\t');
}

export function getCsvHeader(): string {
  return [
    'Date',
    'Problem',
    'URL',
    'Difficulty',
    'Design Time',
    'Coding Time',
    'Total Time',
    'Design Time Exceeded',
    'Coding Time Exceeded',
    'Grade',
    'Topics',
    'Notes',
  ].join('\t');
}
