import dotenv from 'dotenv';
dotenv.config();

try {
  const res = await fetch('http://localhost:5000/api/courses/primary/curriculum');
  const data = await res.json();
  console.log('Public Course Curriculum Modules:', data.modules?.length);
  data.modules?.forEach((m, idx) => {
    console.log(`\n[${m.title}] (${m.lessons?.length} lessons)`);
    m.lessons?.forEach(l => {
      console.log(`   - ${l.title} (${l.duration}) [${l.videoStatus}] (Resources: ${l.resources?.length})`);
    });
  });
} catch (err) {
  console.error('Error fetching curriculum:', err);
}
