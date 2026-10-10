import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aarkeshgupta.com';

const getCachedPrinciples = () => {
  try {
    const cached = localStorage.getItem('cached_principles_data');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
};

export function fetchPrinciplesSettings() {
  return fetch(`${API_URL}/api/home-settings/principles`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        try {
          localStorage.setItem('cached_principles_data', JSON.stringify(data));
        } catch (e) {}
      }
      return data;
    })
    .catch((err) => {
      console.error('Failed to fetch principles data:', err);
      return null;
    });
}

export function usePrinciplesData(sectionKey) {
  const [sectionData, setSectionData] = useState(() => {
    const cached = getCachedPrinciples();
    return cached && sectionKey && cached[sectionKey] ? cached[sectionKey] : null;
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

