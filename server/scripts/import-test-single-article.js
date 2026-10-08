import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Article from '../models/Article.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const testArticle = {
  category: "RELATIONSHIPS",
  order: 1,
  title: "1.1.1 Are You Solving the Conflict or Trying to Win It?",
  body_html: "<p>Most arguments between partners begin with something reasonably specific.</p>\n<p>“You did not call.”\n“I felt dismissed.”\n“You made that decision without asking me.”\n“I am tired of having the same conversation.”</p>\n<p>…And somewhere between the complaint and the defence, the original problem quietly leaves the room.</p>\n<p><br></p>\n<p>The conversation is no longer about what happened. It becomes a contest over whose account is more accurate, whose hurt is more legitimate, and who has committed the greater offence. </p>\n<p>Both people begin presenting evidence. </p>\n<p>Previous incidents are summoned as witnesses. </p>\n<p>Tone is cross-examined. </p>\n<p>Words such as “always” and “never” arrive with the confidence of people who have no intention of checking the records.</p>\n<p>Eventually, the argument has a winner…The relationship usually does not.</p>\n<p><br></p>\n<p>This happens because admitting fault during conflict rarely feels like acknowledging one behaviour. It can feel like conceding that your partner’s entire version of you is correct. </p>\n<p>Careless. </p>\n<p>Selfish. </p>\n<p>Unreliable. </p>\n<p>Too demanding. </p>\n<p>Not good enough.</p>\n<p>So you defend more than your actions. You defend your character.</p>\n<p><br></p>\n<p>That defence makes sense. Nobody enjoys being reduced to their worst moment, especially by someone whose opinion matters deeply. </p>\n<p>But when protecting your dignity becomes the only objective, your partner’s experience begins to look like an accusation that must be defeated.</p>\n<p><br></p>\n<p>There is an important distinction here: your partner’s feelings may be valid without their entire interpretation being accurate.</p>\n<p>They may genuinely feel ignored. That does not automatically mean you intended to ignore them. You may have had legitimate reasons for what you did. That does not mean the impact disappears once your reasons have been presented.</p>\n<p>Both can exist without one cancelling the other.</p>\n<p><br></p>\n<p>Repair begins when the question changes from “Who is right?” to “What happened between us, and what must we understand before it happens again?”</p>\n<p>That may require you to admit something without attaching a counter-complaint. </p>\n<p>It may require listening to an impact you did not intend. It may also require challenging an unfair interpretation without dismissing the feeling beneath it.</p>\n<p><br></p>\n<p>None of this guarantees agreement. Sometimes two people will understand each other perfectly and still disagree.</p>\n<p>But disagreement is not what destroys most relationships. The more corrosive experience is repeatedly discovering that whenever pain is expressed, the person you love becomes more interested in acquittal than understanding.</p>\n<p>Your position may be defensible.</p>\n<p>The more important question is whether the <em>way </em>you are defending it leaves any possibility of repair.</p>",
  paragraph_count: 28,
  word_count: 400
};

const CATEGORY_MAP = {
  'SELF': { categoryId: 'self', categoryTitle: 'Self', categoryNum: '02 / 06' },
  'CHANGE': { categoryId: 'change', categoryTitle: 'Change', categoryNum: '03 / 06' },
  'DECISIONS': { categoryId: 'decisions', categoryTitle: 'Decisions', categoryNum: '04 / 06' },
  'COMMUNICATION': { categoryId: 'communication', categoryTitle: 'Communication', categoryNum: '06 / 06' },
  'DIFFICULT_PEOPLE': { categoryId: 'difficult_people', categoryTitle: 'Difficult People', categoryNum: '05 / 06' },
  'RELATIONSHIPS': { categoryId: 'relationships', categoryTitle: 'Relationships', categoryNum: '01 / 06' }
};

async function runTestImport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const catInfo = CATEGORY_MAP[testArticle.category];
    const slug = testArticle.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const readMinutes = Math.ceil((testArticle.word_count || 400) / 200);
    const readTime = `${readMinutes} min read`;

    const articleDoc = {
      title: testArticle.title,
      slug: slug,
      category: testArticle.category,
      categoryId: catInfo.categoryId,
      categoryTitle: catInfo.categoryTitle,
      categoryNum: catInfo.categoryNum,
      headingId: catInfo.categoryId,
      headingTitle: catInfo.categoryTitle,
      order: testArticle.order,
      status: 'Draft',
      bodyHtml: testArticle.body_html,
      readTime: readTime
    };

    const updated = await Article.findOneAndUpdate(
      { title: articleDoc.title, category: articleDoc.category },
      { $set: articleDoc },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log('✅ Article successfully upserted into DB!');
    console.log('DB _id:', updated._id);
    console.log('Title:', updated.title);
    console.log('Slug:', updated.slug);
    console.log('Category:', updated.category, `(${updated.categoryId})`);
    console.log('Status:', updated.status);
    console.log('Order:', updated.order);
    console.log('ReadTime:', updated.readTime);
    console.log('Exact Match check (saved === original):', updated.bodyHtml === testArticle.body_html);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error in test import:', err);
    process.exit(1);
  }
}

runTestImport();
