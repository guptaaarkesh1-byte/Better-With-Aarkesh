import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function fetchPrinciplesSettings() {
  return fetch(`${API_URL}/api/home-settings/principles`)
    .then((res) => (res.ok ? res.json() : null))
    .catch((err) => {
      console.error('Failed to fetch principles data:', err);
      return null;
    });
}

export function usePrinciplesData(sectionKey) {
  const [sectionData, setSectionData] = useState(null);

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
