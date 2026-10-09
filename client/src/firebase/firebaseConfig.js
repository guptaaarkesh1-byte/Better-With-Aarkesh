// Firebase CDN Loader & Google Auth Helper (Zero-bundle overhead)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const loadFirebaseCDN = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window not available'));
    if (window.firebase && window.firebase.auth) {
      return resolve(window.firebase);
    }
    if (document.getElementById('firebase-app-script')) {
      const checkInterval = setInterval(() => {
        if (window.firebase && window.firebase.auth) {
          clearInterval(checkInterval);
          resolve(window.firebase);
        }
      }, 100);
      return;
    }

    const scriptApp = document.createElement('script');
    scriptApp.id = 'firebase-app-script';
    scriptApp.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js';
    scriptApp.onload = () => {
      const scriptAuth = document.createElement('script');
      scriptAuth.id = 'firebase-auth-script';
      scriptAuth.src = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js';
      scriptAuth.onload = () => {
        resolve(window.firebase);
      };
      scriptAuth.onerror = reject;
      document.head.appendChild(scriptAuth);
    };
    scriptApp.onerror = reject;
    document.head.appendChild(scriptApp);
  });
};

export const initFirebase = async () => {
  const firebase = await loadFirebaseCDN();
  if (!firebase.apps || !firebase.apps.length) {
    if (firebaseConfig.apiKey) {
      firebase.initializeApp(firebaseConfig);
    }
  }
  return firebase;
};

export const signInWithGoogle = async () => {
  try {
    const firebase = await initFirebase();
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase configuration missing. Please add VITE_FIREBASE_API_KEY in your .env file.');
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || user.email?.split('@')[0] || 'Member',
        photoUrl: user.photoURL || '',
        phoneNumber: user.phoneNumber || ''
      },
      idToken
    };
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message || 'Google sign-in failed'
    };
  }
};
