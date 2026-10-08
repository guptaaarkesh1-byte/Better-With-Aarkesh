import json

log_path = r'C:\Users\yashr\.gemini\antigravity-ide\brain\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'A Need Is Not an Embarrassing Request' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                start = content.find('[')
                end = content.rfind(']')
                if start != -1 and end != -1:
                    articles = json.loads(content[start:end+1])
                    print(f"Extracted {len(articles)} articles!")
                    with open(r'd:\Meraki Movies\Life Coaching website\Better With Aarkesh\server\data\articles.json', 'w', encoding='utf-8') as out:
                        json.dump(articles, out, indent=2, ensure_ascii=False)
                    print("Saved successfully to server/data/articles.json")
                    break
            except Exception as e:
                print("Error:", e)
