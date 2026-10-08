import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transcriptPath = 'C:\\Users\\yashr\\.gemini\\antigravity-ide\\brain\\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\\.system_generated\\logs\\transcript_full.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('A Need Is Not an Embarrassing Request') && line.includes('1.4.3 The Price You Pay to Keep Someone Close')) {
      try {
        const obj = JSON.parse(line);
        const text = obj.content || '';
        // Find JSON array start '[' and end ']'
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
          const jsonStr = text.substring(firstBracket, lastBracket + 1);
          const parsed = JSON.parse(jsonStr);
          console.log(`Successfully parsed ${parsed.length} articles!`);
          
          const targetDir = path.join(__dirname, '../data');
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
          const targetFile = path.join(targetDir, 'articles.json');
          fs.writeFileSync(targetFile, JSON.stringify(parsed, null, 2), 'utf8');
          console.log(`Saved to ${targetFile}`);
          return;
        }
      } catch (err) {
        console.error('Error parsing line:', err.message);
      }
    }
  }
  console.log('Finished stream search');
}

extract();
