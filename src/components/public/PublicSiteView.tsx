import React, { useState, useEffect } from 'react';
import { getPublicSite, getPublicSiteByDomain, PublicSite, trackSiteView, trackBlockClick } from '../../api/db';
import { BioSiteRenderer } from '../preview/BioSiteRenderer';
import { updateDocumentMetaTags } from '../../utils/seoUtils';

interface PublicSiteViewProps {
  slug?: string;
  customDomain?: string;
  initialSite?: PublicSite;
}

export const PublicSiteView: React.FC<PublicSiteViewProps> = ({ slug, customDomain, initialSite }) => {
  const [site, setSite] = useState<PublicSite | null>(initialSite || null);
  const [loading, setLoading] = useState(!initialSite);

  useEffect(() => {
    if (initialSite) {
      setSite(initialSite);
      updateDocumentMetaTags(initialSite.config.profile);
      trackSiteView(initialSite.id).catch(() => {});
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = customDomain
          ? await getPublicSiteByDomain(customDomain)
          : slug
          ? await getPublicSite(slug)
          : null;

        if (cancelled) return;
        setSite(data);
        if (data) {
          updateDocumentMetaTags(data.config.profile);
          trackSiteView(data.id).catch(() => {});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, customDomain, initialSite]);

  const handleBlockClick = (blockId: string) => {
    if (site) {
      trackBlockClick(site.id, blockId).catch(() => {});
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-gray-500 font-medium">Carregando mini-site...</div>;
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
        <div className="text-center max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-xl font-bold mx-auto mb-4">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {customDomain ? 'Domínio não configurado' : 'Site não encontrado'}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {customDomain
              ? `O domínio "${customDomain}" ainda não está vinculado a um mini-site publicado no Exiba Studio.`
              : 'Este mini-site não existe ou ainda não foi publicado pelo proprietário.'}
          </p>
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
        slug={site.slug || slug || ''}
      />
    </div>
  );
};
