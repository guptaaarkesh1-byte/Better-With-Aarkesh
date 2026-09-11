import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const adminToken = jwt.sign({ role: 'admin', email: 'admin@betterwithaarkesh.com' }, process.env.JWT_SECRET || 'supersecretjwtkey12345!');

try {
  const res = await fetch('http://localhost:5000/api/admin/courses/mux/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({})
  });

  console.log('Status code:', res.status);
  const data = await res.json();
  console.log('Response body:', data);
} catch (err) {
  console.error('Fetch error:', err);
}
