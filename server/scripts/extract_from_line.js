import fs from 'fs';
import path from 'path';

const fullPath = 'C:\\Users\\yashr\\.gemini\\antigravity-ide\\brain\\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\\.system_generated\\logs\\transcript_full.jsonl';
const fileData = fs.readFileSync(fullPath, 'utf8');
const lines = fileData.split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line.includes('A Need Is Not an Embarrassing Request')) {
    try {
      const entry = JSON.parse(line);
      const text = entry.content || '';
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        const jsonStr = text.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        console.log(`✅ SUCCESS! Extracted ${parsed.length} articles!`);
        
        const outDir = 'd:\\Meraki Movies\\Life Coaching website\\Better With Aarkesh\\server\\data';
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'articles.json'), JSON.stringify(parsed, null, 2), 'utf8');
        console.log(`✅ Saved ${parsed.length} articles to server/data/articles.json`);
        break;
      }
    } catch (e) {
      console.log('Error parsing entry:', e.message);
    }
  }
}
