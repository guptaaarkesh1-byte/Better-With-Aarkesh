import json

full_path = r'C:\Users\yashr\.gemini\antigravity-ide\brain\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\.system_generated\logs\transcript_full.jsonl'

with open(full_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i == 534 or 'A Need Is Not an Embarrassing Request' in line:
            data = json.loads(line)
            content = data.get('content', '')
            print(f"Full transcript line {i} content length: {len(content)}")
            start = content.find('[')
            end = content.rfind(']')
            if start != -1 and end != -1:
                raw_json = content[start:end+1]
                parsed = json.loads(raw_json)
                print(f"🎉 PARSED {len(parsed)} ARTICLES!")
                with open(r'd:\Meraki Movies\Life Coaching website\Better With Aarkesh\server\data\articles.json', 'w', encoding='utf-8') as out:
                    json.dump(parsed, out, indent=2, ensure_ascii=False)
                print("SAVED TO server/data/articles.json")
                break
