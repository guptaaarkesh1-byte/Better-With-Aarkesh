import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/articles.json', 'utf-8'));
const art111 = data.find(a => a.title.includes('1.1.1'));
if (art111) {
  art111.body_html = art111.body_html.replace(
    '“You did not call.”\n“I felt dismissed.”\n“You made that decision without asking me.”\n“I am tired of having the same conversation.”',
    '“You did not call.”<br>“I felt dismissed.”<br>“You made that decision without asking me.”<br>“I am tired of having the same conversation.”'
  );
  fs.writeFileSync('./data/articles.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Successfully updated 1.1.1 in server/data/articles.json');
} else {
  console.log('1.1.1 not found in data/articles.json');
}
