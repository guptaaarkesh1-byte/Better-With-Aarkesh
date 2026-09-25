import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let cachedPrinciplesPromise = null;
let cachedPrinciplesData = null;

export function fetchPrinciplesSettings() {
  if (cachedPrinciplesData) {
    return Promise.resolve(cachedPrinciplesData);
  }
  if (!cachedPrinciplesPromise) {
    cachedPrinciplesPromise = fetch(`${API_URL}/api/home-settings/principles`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        cachedPrinciplesData = data;
        return data;
      })
      .catch((err) => {
        console.error('Failed to fetch principles data:', err);
        return null;
      });
  }
  return cachedPrinciplesPromise;
}

export function usePrinciplesData(sectionKey) {
  const [sectionData, setSectionData] = useState(() => {
    return cachedPrinciplesData && sectionKey ? cachedPrinciplesData[sectionKey] : null;
  });

  useEffect(() => {
    let isMounted = true;
    fetchPrinciplesSettings().then((data) => {
      if (data && isMounted && sectionKey && data[sectionKey]) {
        setSectionData(data[sectionKey]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [sectionKey]);

  return sectionData;
}
