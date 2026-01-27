#!/usr/bin/env node
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('merged_problems.json', 'utf8'));

const compressed = data.questions.map(q => ({
  t: q.title,
  fid: q.frontend_id,
  d: q.difficulty === 'Easy' ? 'E' : q.difficulty === 'Medium' ? 'M' : 'H',
  s: q.problem_slug,
  tp: q.topics || []
}));

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/problems.json', JSON.stringify(compressed));

console.log(`Compressed ${compressed.length} problems`);
console.log(`Output size: ${fs.statSync('src/data/problems.json').size} bytes`);
