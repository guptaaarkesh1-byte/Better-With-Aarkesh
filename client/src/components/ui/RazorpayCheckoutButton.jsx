import { useState } from 'react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RazorpayCheckoutButton({
  amount = 50000, // in paise (e.g., 50000 paise = ₹500)
  currency = 'INR',
  name = 'Better With Aarkesh',
  description = 'Masterclass / Session Payment',
  customer = {},
  onSuccess,
  onError,
  className = '',
  buttonText = 'Pay with Razorpay',
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Ensure Razorpay checkout.js script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 2. Resolve Razorpay Public Key ID
      let keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        const keyRes = await fetch('/api/payment/public-key');
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          keyId = keyData.keyId;
        }
      }

      if (!keyId) {
        throw new Error('Razorpay Public Key ID is not configured.');
      }

      // 3. Create Order on Backend (POST /api/create-order)
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(Number(amount)),
          currency,
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create payment order on server.');
      }

      const orderId = orderData.order_id || orderData.id;
      if (!orderId) {
        throw new Error('Invalid order response from server: order_id is missing.');
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || currency,
        name: name,
        description: description,
        order_id: orderId,
        prefill: {
          name: customer.name || '',
          email: customer.email || '',
          contact: customer.phone || '',
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log('Razorpay modal closed by user');
          },
        },
        handler: async (response) => {
          // 5. Verify payment signature on Backend (POST /api/verify-payment)
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setSuccessMessage('Payment verified successfully!');
              if (onSuccess) onSuccess({ ...response, ...verifyData });
            } else {
              throw new Error(verifyData.message || 'Payment signature verification failed.');
            }
          } catch (verifyErr) {
            console.error('Signature verification error:', verifyErr);
            setErrorMessage(verifyErr.message || 'Verification failed');
            if (onError) onError(verifyErr);
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment failure event
      razorpayInstance.on('payment.failed', (failResponse) => {
        console.error('Payment failed event:', failResponse.error);
        setErrorMessage(failResponse.error?.description || 'Payment was declined or failed.');
        setLoading(false);
        if (onError) onError(failResponse.error);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay checkout error:', err);
      setErrorMessage(err.message || 'Something went wrong initiating payment.');
      setLoading(false);
      if (onError) onError(err);
    }
  };

  return (
    <div className="inline-flex flex-col items-center">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={className || "px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"}
      >
        {loading ? 'Processing...' : buttonText}
      </button>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500 font-medium">{errorMessage}</p>
      )}

      {successMessage && (
        <p className="mt-2 text-xs text-green-500 font-medium">{successMessage}</p>
      )}
    </div>
  );
}
