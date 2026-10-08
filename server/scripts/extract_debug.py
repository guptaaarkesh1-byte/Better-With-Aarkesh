import json

log_path = r'C:\Users\yashr\.gemini\antigravity-ide\brain\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if '"type":"USER_INPUT"' in line:
            data = json.loads(line)
            content = data.get('content', '')
            print(f"Line {i}: len={len(content)}, has_articles={'articles.json' in content}")
            if 'articles.json' in content:
                start = content.find('[')
                end = content.rfind(']')
                if start != -1 and end != -1:
                    raw_json = content[start:end+1]
                    try:
                        parsed = json.loads(raw_json)
                        print(f"FOUND {len(parsed)} articles in line {i}!")
                        with open(r'd:\Meraki Movies\Life Coaching website\Better With Aarkesh\server\data\articles.json', 'w', encoding='utf-8') as out:
                            json.dump(parsed, out, indent=2, ensure_ascii=False)
                        print("SUCCESSFULLY SAVED TO server/data/articles.json")
                    except Exception as err:
                        print("JSON parse error:", err)
