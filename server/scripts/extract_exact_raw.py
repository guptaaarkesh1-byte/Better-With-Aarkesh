import json

with open(r'C:\Users\yashr\.gemini\antigravity-ide\brain\a9e710ed-4210-478c-abe8-f1c6bf0ab3aa\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the start of the JSON array
key = '[\n  {\n    "category": "SELF",'
start = text.find(key)
if start == -1:
    key = '[\r\n  {\r\n    "category": "SELF",'
    start = text.find(key)

print("Start index:", start)
if start != -1:
    # Find the end of this array
    end_key = '"word_count": 839\n  }\n]'
    end = text.find(end_key, start)
    if end == -1:
        end_key = '"word_count": 839\r\n  }\r\n]'
        end = text.find(end_key, start)
    
    if end != -1:
        end = end + len(end_key)
        raw_array = text[start:end]
        print(f"Extracted string of length {len(raw_array)}")
        # Clean any escaped newlines if needed, or parse directly
        try:
            articles = json.loads(raw_array)
            print(f"🎉 Successfully parsed all {len(articles)} articles!")
            with open(r'd:\Meraki Movies\Life Coaching website\Better With Aarkesh\server\data\articles.json', 'w', encoding='utf-8') as out:
                json.dump(articles, out, indent=2, ensure_ascii=False)
            print("Saved to server/data/articles.json")
        except Exception as err:
            print("JSON parse error:", err)
    else:
        print("End key not found")
