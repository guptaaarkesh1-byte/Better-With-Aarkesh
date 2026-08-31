import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Container from '../components/ui/Container';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FooterDocumentView() {
  const { slug } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/footer-documents/${slug}`);
        if (!res.ok) {
          throw new Error('Document not found');
        }
        const data = await res.json();
        setDocument(data);
      } catch (err) {
        console.error(err);
        setError('Document not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDocument();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center pt-32 pb-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  if (error || !document) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full min-h-screen pt-32 pb-24 text-white">
      <Container className="max-w-4xl">
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-accent-gold tracking-tight mb-4">
            {document.title}
          </h1>
          <p className="text-white/50 text-sm font-sans tracking-wider uppercase">
            Last updated: {new Date(document.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div 
          className="prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-accent-gold hover:prose-a:text-accent-gold/80 max-w-none prose-lg font-sans"
          dangerouslySetInnerHTML={{ __html: document.contentHtml }}
        />
      </Container>
    </div>
  );
}
