import dotenv from 'dotenv';
dotenv.config();

try {
  const keyRes = await fetch('http://localhost:5000/api/payment/public-key');
  console.log('GET /api/payment/public-key status:', keyRes.status);
  const keyData = await keyRes.json();
  console.log('Public Key Data:', keyData);

  const orderRes = await fetch('http://localhost:5000/api/payment/course-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  });
  console.log('POST /api/payment/course-order status:', orderRes.status);
  const orderData = await orderRes.json();
  console.log('Order Data:', orderData);
} catch (err) {
  console.error('Fetch error:', err);
}
