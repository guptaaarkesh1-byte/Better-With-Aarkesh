import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripArticleNumbering = (title) => {
  if (!title || typeof title !== 'string') return title;
  return title
    .replace(/^\s*\d+(\.\d+)+[\.\s\-–—:]*\s*/, '')
    .replace(/^\s*\d{1,2}\.\s+/, '')
    .trim();
};

const filePath = path.join(__dirname, '../data/articles.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

let count = 0;
data.forEach(item => {
  const clean = stripArticleNumbering(item.title);
  if (clean !== item.title) {
    item.title = clean;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Cleaned ${count} titles in server/data/articles.json`);
