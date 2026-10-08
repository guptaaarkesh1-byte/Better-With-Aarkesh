import fs from 'fs';
import path from 'path';

const logsDir = 'C:\\Users\\yashr\\.gemini\\antigravity-ide\\brain\\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\\.system_generated\\logs';
const files = fs.readdirSync(logsDir);

for (const file of files) {
  const fullPath = path.join(logsDir, file);
  const data = fs.readFileSync(fullPath, 'utf8');
  if (data.includes('A Need Is Not an Embarrassing Request')) {
    console.log(`Found in file: ${file}, size: ${data.length}`);
    const idx = data.indexOf('A Need Is Not an Embarrassing Request');
    const start = data.lastIndexOf('[', idx);
    const end = data.indexOf(']', data.indexOf('1.4.3 The Price You Pay to Keep Someone Close'));
    console.log(`Indices: start=${start}, end=${end}`);
    if (start !== -1 && end !== -1) {
      const raw = data.substring(start, end + 1);
      try {
        const parsed = JSON.parse(raw);
        console.log(`Parsed ${parsed.length} articles!`);
        fs.writeFileSync('d:\\Meraki Movies\\Life Coaching website\\Better With Aarkesh\\server\\data\\articles.json', JSON.stringify(parsed, null, 2), 'utf8');
        console.log('Saved to server/data/articles.json');
        break;
      } catch (e) {
        console.log('Direct parse failed, trying unescaped JSON.parse on content string:', e.message);
      }
    }
  }
}
