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

        // Update document title if present
        if (seo.metaTitle) {
          document.title = seo.metaTitle;
        }

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

        updateMeta('description', seo.metaDescription);
        updateMeta('keywords', seo.metaKeywords);
        updateMeta('author', seo.author);
        updateMeta('robots', seo.robots);
        if (seo.googleSiteVerification) {
          updateMeta('google-site-verification', seo.googleSiteVerification);
        }

        // Open Graph
        updateMeta('og:title', seo.ogTitle || seo.metaTitle, true);
        updateMeta('og:description', seo.ogDescription || seo.metaDescription, true);
        if (seo.ogImage) updateMeta('og:image', seo.ogImage, true);
        if (seo.canonicalUrl) updateMeta('og:url', seo.canonicalUrl, true);
        updateMeta('og:type', seo.ogType || 'website', true);

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

        // Dynamic Favicon link
        if (seo.favicon) {
          let faviconLink = document.querySelector('link[rel="icon"]');
          if (faviconLink) {
            faviconLink.setAttribute('href', seo.favicon);
          }
        }

        // Google Analytics 4 (gtag.js) Injection
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
