import React, { useEffect } from 'react';
import { trackPageView } from '../services/analytics';

interface SeoHeadProps {
  currentPath: string;
  isAuthenticated: boolean;
}

interface PageMetaConfig {
  title: string;
  description: string;
  isPrivate: boolean;
  schemaType?: 'WebApplication' | 'MedicalWebPage' | 'WebPage';
}

const DEFAULT_DESCRIPTION =
  "MAMAN+ est une application dédiée au suivi de grossesse, au bien-être de la future maman et à la préparation de l'arrivée de bébé. Suivez votre grossesse, vos rendez-vous, vos symptômes, vos examens, votre poids, votre calendrier et retrouvez des conseils et ressources utiles.";

const PAGE_META_MAP: Record<string, PageMetaConfig> = {
  '/': {
    title: 'MAMAN+ — Tableau de bord grossesse',
    description: DEFAULT_DESCRIPTION,
    isPrivate: true,
  },
  '/dashboard': {
    title: 'MAMAN+ — Tableau de bord grossesse',
    description: DEFAULT_DESCRIPTION,
    isPrivate: true,
  },
  '/login': {
    title: 'Connexion | MAMAN+ — Suivi de grossesse et conseils pour futures mamans',
    description: "Accédez en toute sécurité à votre carnet de maternité MAMAN+, vos rendez-vous et vos repères cliniques.",
    isPrivate: false,
    schemaType: 'WebPage',
  },
  '/ma-grossesse': {
    title: 'Ma Grossesse — Suivi personnalisé | MAMAN+',
    description: "Suivi obstétrical de votre grossesse semaine après semaine.",
    isPrivate: true,
  },
  '/bebe': {
    title: 'Suivi du bébé semaine après semaine | MAMAN+',
    description: "Développement in utero du bébé, taille, poids et repères visuels.",
    isPrivate: true,
  },
  '/calendrier': {
    title: 'Calendrier de grossesse | MAMAN+',
    description: "Planning obstétrical et échéances de votre grossesse.",
    isPrivate: true,
  },
  '/rendez-vous': {
    title: 'Rendez-vous médicaux grossesse | MAMAN+',
    description: "Gestion des consultations prénatales, échographies et rendez-vous sage-femme.",
    isPrivate: true,
  },
  '/symptomes': {
    title: 'Suivi des symptômes pendant la grossesse | MAMAN+',
    description: "Journal quotidien des sensations et symptômes de grossesse.",
    isPrivate: true,
  },
  '/suivi-poids': {
    title: 'Suivi du poids pendant la grossesse | MAMAN+',
    description: "Courbe d'évolution pondérale et calcul de repères d'IMC.",
    isPrivate: true,
  },
  '/examens': {
    title: 'Examens et suivi médical de grossesse | MAMAN+',
    description: "Résultats biologiques, échographies et bilans médicaux prénataux.",
    isPrivate: true,
  },
  '/mon-ordonnance': {
    title: 'Mon ordonnance médicale | MAMAN+',
    description: "Prescriptions médicales et traitements recommandés par vos praticiens.",
    isPrivate: true,
  },
  '/ordonnance': {
    title: 'Mon ordonnance médicale | MAMAN+',
    description: "Prescriptions médicales et traitements recommandés par vos praticiens.",
    isPrivate: true,
  },
  '/ordonnances': {
    title: 'Mon ordonnance médicale | MAMAN+',
    description: "Prescriptions médicales et traitements recommandés par vos praticiens.",
    isPrivate: true,
  },
  '/synthese-suivi': {
    title: 'Synthèse médicale de grossesse | MAMAN+',
    description: "Rapport clinique condensé pour votre praticien et votre dossier maternité.",
    isPrivate: true,
  },
  '/journal': {
    title: 'Journal de grossesse | MAMAN+',
    description: "Notes personnelles et souvenirs du parcours de maternité.",
    isPrivate: true,
  },
  '/checklist': {
    title: 'Checklist grossesse et préparation bébé | MAMAN+',
    description: "Valise de maternité et préparatifs de l'arrivée de bébé.",
    isPrivate: true,
  },
  '/rappels': {
    title: 'Rappels grossesse | MAMAN+',
    description: "Rappels automatiques de prises de vitamines, hydratation et examens.",
    isPrivate: true,
  },
  '/notifications': {
    title: 'Notifications | MAMAN+',
    description: "Alertes et messages informatifs de votre suivi de maternité.",
    isPrivate: true,
  },
  '/conseils-ressources': {
    title: 'Conseils grossesse et maternité | MAMAN+',
    description: "Bibliothèque de plus de 1000 conseils vérifiés, vidéos de professionnels et repères de santé pour futures mamans.",
    isPrivate: false,
    schemaType: 'MedicalWebPage',
  },
  '/ressources': {
    title: 'Conseils grossesse et maternité | MAMAN+',
    description: "Bibliothèque de plus de 1000 conseils vérifiés, vidéos de professionnels et repères de santé pour futures mamans.",
    isPrivate: false,
    schemaType: 'MedicalWebPage',
  },
  '/guide': {
    title: "Guide d'utilisation et repères | MAMAN+",
    description: "Guide complet d'utilisation de l'application MAMAN+ pour les futures mamans.",
    isPrivate: false,
    schemaType: 'WebPage',
  },
  '/guide-utilisation': {
    title: "Guide d'utilisation et repères | MAMAN+",
    description: "Guide complet d'utilisation de l'application MAMAN+ pour les futures mamans.",
    isPrivate: false,
    schemaType: 'WebPage',
  },
  '/profil': {
    title: 'Mon Profil | MAMAN+',
    description: "Profil et repères obstétricaux de l'utilisatrice.",
    isPrivate: true,
  },
  '/parametres': {
    title: 'Paramètres du compte | MAMAN+',
    description: "Gestion des préférences, sécurité et paramètres de l'application.",
    isPrivate: true,
  },
};

export const SeoHead: React.FC<SeoHeadProps> = ({ currentPath, isAuthenticated }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const origin = window.location.origin;
    const cleanPath = currentPath.split('?')[0].split('#')[0] || '/';
    const canonicalUrl = `${origin}${cleanPath === '/' ? '' : cleanPath}`;
    const socialImageUrl = `${origin}/pregnant_mother_illustration.jpg`;

    // 1. Determine Meta configuration
    const config: PageMetaConfig = PAGE_META_MAP[cleanPath] || {
      title: isAuthenticated
        ? 'MAMAN+ — Tableau de bord grossesse'
        : 'MAMAN+ — Suivi de grossesse et conseils pour futures mamans',
      description: DEFAULT_DESCRIPTION,
      isPrivate: isAuthenticated,
      schemaType: 'WebPage',
    };

    // When logged out on '/', title is the branded public portal title
    const effectiveTitle =
      cleanPath === '/' && !isAuthenticated
        ? 'MAMAN+ — Suivi de grossesse et conseils pour futures mamans'
        : config.title;

    // 2. Update Document Title
    document.title = effectiveTitle;

    // 3. Update or create Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);

    // 4. Update or create Robots tag (CRITICAL: noindex,nofollow on private/health pages)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    if (config.isPrivate && isAuthenticated) {
      metaRobots.setAttribute('content', 'noindex,nofollow');
    } else {
      metaRobots.setAttribute('content', 'index,follow,max-image-preview:large,max-snippet:-1');
    }

    // 5. Update or create Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 6. OpenGraph tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:site_name', 'MAMAN+');
    setOgTag('og:type', 'website');
    setOgTag('og:url', canonicalUrl);
    setOgTag('og:title', effectiveTitle);
    setOgTag('og:description', config.description);
    setOgTag('og:image', socialImageUrl);

    // 7. Twitter Cards
    const setTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', effectiveTitle);
    setTwitterTag('twitter:description', config.description);
    setTwitterTag('twitter:image', socialImageUrl);

    // 8. Google Search Console Verification (from environment variable VITE_GOOGLE_SITE_VERIFICATION)
    const gscVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
    let metaGsc = document.querySelector('meta[name="google-site-verification"]');
    if (gscVerification && typeof gscVerification === 'string' && gscVerification.trim()) {
      if (!metaGsc) {
        metaGsc = document.createElement('meta');
        metaGsc.setAttribute('name', 'google-site-verification');
        document.head.appendChild(metaGsc);
      }
      metaGsc.setAttribute('content', gscVerification.trim());
    } else if (metaGsc) {
      metaGsc.remove();
    }

    // 9. Schema.org JSON-LD Structured Data
    let schemaScript = document.getElementById('maman-schema-structured-data');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'maman-schema-structured-data';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    const structuredData: Record<string, any> = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          url: origin,
          name: 'MAMAN+',
          description: DEFAULT_DESCRIPTION,
          inLanguage: 'fr-FR',
        },
        {
          '@type': 'WebApplication',
          '@id': `${origin}/#webapp`,
          name: 'MAMAN+ Maternité & Santé',
          url: origin,
          applicationCategory: 'HealthApplication',
          operatingSystem: 'All',
          description: DEFAULT_DESCRIPTION,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'XAF',
          },
        },
      ],
    };

    // If on public resources page, enrich with MedicalWebPage
    if (config.schemaType === 'MedicalWebPage') {
      structuredData['@graph'].push({
        '@type': 'MedicalWebPage',
        '@id': `${canonicalUrl}/#medicalpage`,
        url: canonicalUrl,
        name: effectiveTitle,
        description: config.description,
        about: {
          '@type': 'MedicalCondition',
          name: 'Grossesse & Maternité',
        },
        inLanguage: 'fr-FR',
      });
    }

    schemaScript.textContent = JSON.stringify(structuredData);

    // 10. Track GA4 pageview for SPA navigation
    trackPageView(cleanPath, effectiveTitle);
  }, [currentPath, isAuthenticated]);

  return null;
};
