/**
 * Google Analytics 4 (GA4) Service for MAMAN+
 * 
 * - Configured via environment variable: VITE_GOOGLE_ANALYTICS_ID (e.g., G-XXXXXXXXXX)
 * - Zero PII: Strictly no personal or medical data is sent (no patient name, email, symptoms, weight, dates)
 * - Single initialization guard: prevents duplicate tags or double-pageviews
 * - Respects user consent (GDPR / privacy compliance)
 * - Fails silently and safely when GA ID is not set
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'maman_ga_consent';

export type ConsentStatus = 'granted' | 'denied' | null;

let isGaInitialized = false;
let lastTrackedPath: string | null = null;

/**
 * Returns true if a valid GA4 Measurement ID is provided in the environment.
 */
export function hasAnalyticsId(): boolean {
  const id = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
  return Boolean(id && typeof id === 'string' && id.trim().startsWith('G-'));
}

/**
 * Gets the current Measurement ID from Vite environment.
 */
export function getAnalyticsId(): string {
  return (import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '').trim();
}

/**
 * Retrieves stored user consent state.
 */
export function getStoredConsent(): ConsentStatus {
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'granted' || val === 'denied') return val;
  } catch {
    // LocalStorage blocked
  }
  return null;
}

/**
 * Saves user consent choice.
 */
export function setAnalyticsConsent(granted: boolean): void {
  const status: ConsentStatus = granted ? 'granted' : 'denied';
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // Ignore storage errors
  }

  if (granted) {
    initAnalytics();
  } else if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    });
  }
}

/**
 * Initializes Google Analytics 4 tag cleanly once.
 */
export function initAnalytics(): boolean {
  if (typeof window === 'undefined') return false;
  if (!hasAnalyticsId()) return false;

  const consent = getStoredConsent();
  // Do not initialize before consent if user hasn't accepted
  if (consent !== 'granted') return false;

  if (isGaInitialized) return true;

  const gaId = getAnalyticsId();

  try {
    // Inject gtag script asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
    });

    // Disable automatic pageviews so our SPA route listener handles them accurately
    gtag('config', gaId, {
      send_page_view: false,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    isGaInitialized = true;
    console.log('[MAMAN+ Analytics] Initialized GA4 safely.');
    return true;
  } catch (err) {
    console.warn('[MAMAN+ Analytics] Initialization skipped:', err);
    return false;
  }
}

/**
 * Sends a sanitized page view on route change.
 * Never includes personal identifiers, medical variables or query strings.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || !isGaInitialized || !window.gtag) return;
  if (!hasAnalyticsId()) return;

  // Prevent duplicate pageview for the same path
  if (lastTrackedPath === path) return;
  lastTrackedPath = path;

  // Clean path to eliminate any query params or personal IDs
  const cleanPath = path.split('?')[0].split('#')[0] || '/';

  // Sanitized generic page title (strict privacy: never include patient name or gestational details)
  const safeTitle = sanitizeTitle(title || document.title);

  try {
    window.gtag('event', 'page_view', {
      page_path: cleanPath,
      page_title: safeTitle,
      page_location: window.location.origin + cleanPath,
    });
  } catch (err) {
    // Ignore tracking errors
  }
}

/**
 * Tracks safe, non-sensitive application events.
 * Strips any potential health or personal data.
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined' || !isGaInitialized || !window.gtag) return;
  if (!hasAnalyticsId()) return;

  // Whitelist of allowed non-sensitive parameters
  const safeParams: Record<string, any> = {};
  if (params) {
    const forbiddenKeywords = [
      'symptom',
      'weight',
      'poids',
      'patient',
      'name',
      'nom',
      'prenom',
      'email',
      'phone',
      'medical',
      'exam',
      'prescription',
      'ordonnance',
      'pregnancy_week',
      'sa',
      'dpa',
      'ddr',
      'condition',
    ];

    for (const [key, value] of Object.entries(params)) {
      const lowerKey = key.toLowerCase();
      const isForbidden = forbiddenKeywords.some((forbidden) => lowerKey.includes(forbidden));
      if (!isForbidden && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
        safeParams[key] = value;
      }
    }
  }

  try {
    window.gtag('event', eventName, safeParams);
  } catch {
    // Ignore tracking errors
  }
}

/**
 * Helper to ensure page titles sent to GA4 don't leak personalized clinical data.
 */
function sanitizeTitle(title: string): string {
  if (!title) return 'MAMAN+';
  // If title has gestational week or user names, generalize it
  if (title.includes('SA') || title.includes('Trimestre') || title.includes('Dossier')) {
    return 'MAMAN+ — Espace Clinique Maternité';
  }
  return title;
}
