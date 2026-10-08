import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));

    // 1. Delete all articles from today's import
    const delRes = await Article.deleteMany({});
    console.log('Successfully cleared existing articles count:', delRes.deletedCount);

    // 2. Exact test article 1.1.1 from the corrected articles.json
    const articleData = {
      category: 'RELATIONSHIPS',
      order: 1,
      title: '1.1.1 Are You Solving the Conflict or Trying to Win It?',
      body_html: '<p>Most arguments between partners begin with something reasonably specific.</p>\n<p>“You did not call.”<br>“I felt dismissed.”<br>“You made that decision without asking me.”<br>“I am tired of having the same conversation.”</p>\n<p>…And somewhere between the complaint and the defence, the original problem quietly leaves the room.</p>\n<p><br></p>\n<p>The conversation is no longer about what happened. It becomes a contest over whose account is more accurate, whose hurt is more legitimate, and who has committed the greater offence. </p>\n<p>Both people begin presenting evidence. </p>\n<p>Previous incidents are summoned as witnesses. </p>\n<p>Tone is cross-examined. </p>\n<p>Words such as “always” and “never” arrive with the confidence of people who have no intention of checking the records.</p>\n<p>Eventually, the argument has a winner…The relationship usually does not.</p>\n<p><br></p>\n<p>This happens because admitting fault during conflict rarely feels like acknowledging one behaviour. It can feel like conceding that your partner’s entire version of you is correct. </p>\n<p>Careless. </p>\n<p>Selfish. </p>\n<p>Unreliable. </p>\n<p>Too demanding. </p>\n<p>Not good enough.</p>\n<p>So you defend more than your actions. You defend your character.</p>\n<p><br></p>\n<p>That defence makes sense. Nobody enjoys being reduced to their worst moment, especially by someone whose opinion matters deeply. </p>\n<p>But when protecting your dignity becomes the only objective, your partner’s experience begins to look like an accusation that must be defeated.</p>\n<p><br></p>\n<p>There is an important distinction here: your partner’s feelings may be valid without their entire interpretation being accurate.</p>\n<p>They may genuinely feel ignored. That does not automatically mean you intended to ignore them. You may have had legitimate reasons for what you did. That does not mean the impact disappears once your reasons have been presented.</p>\n<p>Both can exist without one cancelling the other.</p>\n<p><br></p>\n<p>Repair begins when the question changes from “Who is right?” to “What happened between us, and what must we understand before it happens again?”</p>\n<p>That may require you to admit something without attaching a counter-complaint. </p>\n<p>It may require listening to an impact you did not intend. It may also require challenging an unfair interpretation without dismissing the feeling beneath it.</p>\n<p><br></p>\n<p>None of this guarantees agreement. Sometimes two people will understand each other perfectly and still disagree.</p>\n<p>But disagreement is not what destroys most relationships. The more corrosive experience is repeatedly discovering that whenever pain is expressed, the person you love becomes more interested in acquittal than understanding.</p>\n<p>Your position may be defensible.</p>\n<p>The more important question is whether the <em>way </em>you are defending it leaves any possibility of repair.</p>',
      paragraph_count: 28,
      word_count: 400
    };

    const cleanSlug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const readMinutes = Math.ceil(articleData.word_count / 200);

    const created = await Article.create({
      title: articleData.title,
      slug: cleanSlug,
      order: articleData.order,
      category: articleData.category,
      categoryId: 'relationships',
      categoryNum: '01 / 06',
      categoryTitle: 'Relationships',
      readTime: `${readMinutes} MIN READ`,
      status: 'Draft',
      bodyHtml: articleData.body_html,
      blocks: [],
      sections: [],
      paragraphsAfterDropCap: []
    });

    console.log('Inserted article 1.1.1 with ID:', created._id);

    // 3. Query back from database to verify exact stored bodyHtml
    const doc = await Article.findById(created._id).lean();
    console.log('\n--- VERIFICATION FROM DATABASE ---');
    console.log('ID:', doc._id);
    console.log('Title:', doc.title);
    console.log('Status:', doc.status);
    console.log('\n--- STORED RAW bodyHtml ---');
    console.log(doc.bodyHtml);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error importing single article:', error);
    process.exit(1);
  }
};

run();
