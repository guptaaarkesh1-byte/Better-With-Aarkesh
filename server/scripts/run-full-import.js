import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { importAllArticles } from './import-all-33-articles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transcriptPath = 'C:\\Users\\yashr\\.gemini\\antigravity-ide\\brain\\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\\.system_generated\\logs\\transcript_full.jsonl';

// Extract the 33 articles JSON from the user message in transcript
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
let userJson = null;

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].trim()) continue;
  try {
    const entry = JSON.parse(lines[i]);
    if (entry.content && entry.content.includes('I have a file articles.json in this project')) {
      const jsonMatch = entry.content.match(/\[\s*\{\s*"category"[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        userJson = JSON.parse(jsonMatch[0]);
        break;
      }
    }
  } catch (e) {}
}

if (!userJson || !Array.isArray(userJson)) {
  console.error('Could not extract articles JSON from transcript');
  process.exit(1);
}

console.log(`Extracted ${userJson.length} articles from prompt.`);

// Save to server/data/articles.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'articles.json'), JSON.stringify(userJson, null, 2), 'utf8');
console.log('Saved articles.json to server/data/articles.json');

// Run the import
importAllArticles(userJson);
