import React, { useState, useEffect } from 'react';
import { getPublicSite, PublicSite, trackSiteView, trackBlockClick } from '../../api/db';
import { BioSiteRenderer } from '../preview/BioSiteRenderer';

interface PublicSiteViewProps {
  slug: string;
}

export const PublicSiteView: React.FC<PublicSiteViewProps> = ({ slug }) => {
  const [site, setSite] = useState<PublicSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPublicSite(slug);
        if (cancelled) return;
        setSite(data);
        if (data) {
          trackSiteView(data.id).catch(() => {});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleBlockClick = (blockId: string) => {
    if (site) {
      trackBlockClick(site.id, blockId).catch(() => {});
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">Carregando...</div>;
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Site não encontrado</h1>
          <p className="text-sm text-gray-600 mt-2">Este mini-site não existe ou não está publicado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <BioSiteRenderer
        config={site.config}
        isInteractive={true}
        onBlockClick={handleBlockClick}
        plan={site.plan}
        isAdmin={site.isAdmin}
        slug={slug}
      />
    </div>
  );
};
