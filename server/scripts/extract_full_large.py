import json

full_path = r'C:\Users\yashr\.gemini\antigravity-ide\brain\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\.system_generated\logs\transcript_full.jsonl'

with open(full_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        content = data.get('content', '')
        if len(content) > 10000 and 'A Need Is Not an Embarrassing Request' in content:
            print(f"Line {i} has {len(content)} chars!")
            start = content.find('[')
            end = content.rfind(']')
            print(f"Start: {start}, End: {end}")
            raw_json = content[start:end+1]
            try:
                parsed = json.loads(raw_json)
                print(f"PARSED {len(parsed)} ARTICLES!")
                with open(r'd:\Meraki Movies\Life Coaching website\Better With Aarkesh\server\data\articles.json', 'w', encoding='utf-8') as out:
                    json.dump(parsed, out, indent=2, ensure_ascii=False)
                print("SUCCESSFULLY SAVED TO server/data/articles.json")
            except Exception as e:
                print("JSON error:", e)
                # Print start and end of raw_json
                print("Prefix:", raw_json[:200])
                print("Suffix:", raw_json[-200:])
