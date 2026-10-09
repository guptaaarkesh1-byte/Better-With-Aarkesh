import React, { useState } from 'react';
import { signInWithGoogle } from '../../firebase/firebaseConfig';
import { API_URL } from '../../utils/apiUrl';

export default function GoogleLoginButton({
  onSuccess,
  onError,
  theme = 'light',
  className = '',
  text = 'Continue with Google',
  apiEndpoint = '/api/auth/google'
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const googleResult = await signInWithGoogle();
      
      if (!googleResult.success) {
        if (googleResult.error && !googleResult.error.includes('popup-closed-by-user')) {
          onError?.(googleResult.error);
        }
        setIsLoading(false);
        return;
      }

      // Send Google user details to backend
      const res = await fetch(`${API_URL}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: googleResult.user.email,
          fullName: googleResult.user.fullName,
          photoUrl: googleResult.user.photoUrl,
          phoneNumber: googleResult.user.phoneNumber,
          uid: googleResult.user.uid,
          idToken: googleResult.idToken
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Save auth tokens & userInfo
        if (apiEndpoint.includes('course-auth')) {
          if (data.token) localStorage.setItem('courseToken', data.token);
          if (data.coachingToken) localStorage.setItem('token', data.coachingToken);
          
          const courseUserObj = {
            _id: data._id,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber || '',
            photoUrl: data.photoUrl || '',
            isPurchased: !!data.isPurchased,
            authProvider: data.authProvider || 'google'
          };
          localStorage.setItem('courseUser', JSON.stringify(courseUserObj));

          const userInfoObj = {
            _id: data.coachingUserId || data._id,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber || '',
            countryCode: '+91',
            photoUrl: data.photoUrl || '',
            authProvider: data.authProvider || 'google'
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfoObj));
        } else {
          if (data.token) localStorage.setItem('token', data.token);
          if (data.courseToken) localStorage.setItem('courseToken', data.courseToken);
          
          const userInfo = {
            _id: data._id,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber || '',
            countryCode: data.countryCode || '+91',
            photoUrl: data.photoUrl || '',
            dob: data.dob || '',
            gender: data.gender || 'Prefer not to say',
            freeSessions: data.freeSessions,
            courseSessionsGranted: data.courseSessionsGranted,
            authProvider: data.authProvider || 'google'
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));

          if (data.courseUserId || data.courseToken) {
            localStorage.setItem('courseUser', JSON.stringify({
              _id: data.courseUserId || data._id,
              fullName: data.fullName,
              email: data.email,
              phoneNumber: data.phoneNumber || '',
              photoUrl: data.photoUrl || '',
              isPurchased: !!data.isCoursePurchased,
              authProvider: data.authProvider || 'google'
            }));
          }
        }

        window.dispatchEvent(new Event('auth-change'));
        onSuccess?.(data);
      } else {
        onError?.(data.message || 'Google sign-in failed on server.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      onError?.(err.message || 'Network error during Google sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-sans text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${
        isDark
          ? 'bg-[#18181b] hover:bg-[#27272a] text-white border border-white/10 hover:border-white/20 shadow-md shadow-black/40'
          : 'bg-white hover:bg-[#faf8f5] text-[#1c1917] border border-stone-200 hover:border-stone-300 shadow-xs'
      } ${className}`}
    >
      {/* Official Google 'G' SVG Logo */}
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span>{isLoading ? 'Connecting to Google...' : text}</span>
    </button>
  );
}
