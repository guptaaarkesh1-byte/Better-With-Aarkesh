import { useEffect } from 'react';
import { API_URL } from '../../utils/apiUrl';

export default function DynamicSEO() {
  useEffect(() => {
    let isMounted = true;

    async function applySEO() {
      try {
        const res = await fetch(`${API_URL}/api/seo-settings`);
        if (!res.ok) return;
        const seo = await res.json();
        if (!isMounted || !seo) return;

        // 1. Update Document Title
        if (seo.metaTitle) {
          document.title = seo.metaTitle;
        }

        // 2. Helper to Update or Create Meta Tags
        const updateMeta = (nameOrProperty, value, isProperty = false) => {
          if (!value) return;
          const selector = isProperty 
            ? `meta[property="${nameOrProperty}"]` 
            : `meta[name="${nameOrProperty}"]`;
          let el = document.querySelector(selector);
          if (!el) {
            el = document.createElement('meta');
            if (isProperty) el.setAttribute('property', nameOrProperty);
            else el.setAttribute('name', nameOrProperty);
            document.head.appendChild(el);
          }
          el.setAttribute('content', value);
        };

        // Primary Meta Tags
        updateMeta('title', seo.metaTitle);
        updateMeta('description', seo.metaDescription);
        if (seo.metaKeywords) updateMeta('keywords', seo.metaKeywords);
        if (seo.author) updateMeta('author', seo.author);
        if (seo.robots) updateMeta('robots', seo.robots);
        if (seo.googleSiteVerification) {
          updateMeta('google-site-verification', seo.googleSiteVerification);
        }

        // Open Graph
        updateMeta('og:title', seo.ogTitle || seo.metaTitle, true);
        updateMeta('og:description', seo.ogDescription || seo.metaDescription, true);
        if (seo.ogImage) updateMeta('og:image', seo.ogImage, true);
        if (seo.canonicalUrl) updateMeta('og:url', seo.canonicalUrl, true);
        updateMeta('og:type', seo.ogType || 'website', true);
        updateMeta('og:site_name', seo.siteName || 'Better With Aarkesh', true);

        // Twitter Card
        updateMeta('twitter:title', seo.ogTitle || seo.metaTitle);
        updateMeta('twitter:description', seo.ogDescription || seo.metaDescription);
        if (seo.ogImage) updateMeta('twitter:image', seo.ogImage);
        updateMeta('twitter:card', seo.twitterCard || 'summary_large_image');
        if (seo.twitterCreator) updateMeta('twitter:creator', seo.twitterCreator);

        // Canonical link
        if (seo.canonicalUrl) {
          let canonicalLink = document.querySelector('link[rel="canonical"]');
          if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalLink);
          }
          canonicalLink.setAttribute('href', seo.canonicalUrl);
        }

        // 3. Dynamic Favicon Link (supports SVG, PNG, ICO, WebP, and backend uploads)
        if (seo.favicon) {
          let faviconUrl = seo.favicon;
          if (faviconUrl.startsWith('/uploads/')) {
            faviconUrl = `${API_URL}${faviconUrl}`;
          }

          const versionedUrl = faviconUrl.includes('?') ? faviconUrl : `${faviconUrl}?v=${Date.now()}`;

          const iconSelectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="alternate icon"]',
            'link[rel="apple-touch-icon"]'
          ];

          iconSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              el.setAttribute('href', versionedUrl);
              if (faviconUrl.includes('.svg')) {
                el.setAttribute('type', 'image/svg+xml');
              } else if (faviconUrl.includes('.png')) {
                el.setAttribute('type', 'image/png');
              } else if (faviconUrl.includes('.ico')) {
                el.setAttribute('type', 'image/x-icon');
              }
            });
          });

          // Ensure at least one primary icon element exists
          let primaryIcon = document.querySelector('link[rel="icon"]');
          if (!primaryIcon) {
            primaryIcon = document.createElement('link');
            primaryIcon.setAttribute('rel', 'icon');
            primaryIcon.setAttribute('href', versionedUrl);
            document.head.appendChild(primaryIcon);
          }
        }

        // 4. Update Schema.org JSON-LD structured data dynamically for Google Sitelinks
        if (seo.sitelinks) {
          try {
            let ldJsonScript = document.querySelector('script[type="application/ld+json"]');
            if (ldJsonScript) {
              const currentLd = JSON.parse(ldJsonScript.textContent || '{}');
              if (currentLd['@graph']) {
                // Update WebSite description and name
                const websiteObj = currentLd['@graph'].find((item) => item['@type'] === 'WebSite');
                if (websiteObj) {
                  websiteObj.name = seo.siteName || websiteObj.name;
                  websiteObj.description = seo.metaDescription || websiteObj.description;
                }

                // Update Sitelinks ItemList
                const sitelinksObj = currentLd['@graph'].find((item) => item['@type'] === 'ItemList');
                if (sitelinksObj && sitelinksObj.itemListElement) {
                  const items = [
                    seo.sitelinks.sitelink1,
                    seo.sitelinks.sitelink2,
                    seo.sitelinks.sitelink3,
                    seo.sitelinks.sitelink4,
                  ].filter(Boolean);

                  sitelinksObj.itemListElement = items.map((s, idx) => ({
                    '@type': 'SiteNavigationElement',
                    position: idx + 1,
                    name: s.title || `Sitelink ${idx + 1}`,
                    description: s.description || '',
                    url: s.url ? (s.url.startsWith('http') ? s.url : `https://aarkeshgupta.com${s.url.startsWith('/') ? '' : '/'}${s.url}`) : 'https://aarkeshgupta.com',
                  }));
                }

                ldJsonScript.textContent = JSON.stringify(currentLd, null, 2);
              }
            }
          } catch (_) {}
        }

        // 5. Google Analytics 4 (gtag.js) Injection
        if (seo.gaMeasurementId && typeof window !== 'undefined') {
          const gaId = seo.gaMeasurementId.trim();
          if (gaId.startsWith('G-')) {
            const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`);
            if (!existingScript) {
              const script = document.createElement('script');
              script.async = true;
              script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
              document.head.appendChild(script);

              const inlineScript = document.createElement('script');
              inlineScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { page_path: window.location.pathname });
              `;
              document.head.appendChild(inlineScript);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic SEO settings:', err);
      }
    }

    applySEO();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
