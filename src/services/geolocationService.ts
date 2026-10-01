/**
 * Service de géolocalisation MAMAN+
 * Gère l'accès sécurisé à navigator.geolocation et le calcul des distances réelles
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export type GeolocationStatus =
  | 'idle'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

export interface GeolocationResult {
  coords?: Coordinates;
  error?: string;
  status: GeolocationStatus;
}

/**
 * Calcule la distance orthodromique réelle en kilomètres entre deux coordonnées GPS
 * selon la formule du Haversine.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Formate élégamment la distance pour l'affichage (ex: "850 m" ou "1,8 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  const formatted = distanceKm.toFixed(1).replace('.', ',');
  return `${formatted} km`;
}

/**
 * Vérifie si la géolocalisation est prise en charge par le navigateur
 */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Récupère la position géographique avec consentement explicite
 */
export function requestUserLocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!isGeolocationSupported()) {
      resolve({
        status: 'unavailable',
        error: "La géolocalisation n'est pas supportée par votre navigateur.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          status: 'granted',
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            resolve({
              status: 'denied',
              error:
                'Vous avez refusé l’accès à votre position. Vous pouvez rechercher manuellement une ville ci-dessous.',
            });
            break;
          case error.POSITION_UNAVAILABLE:
            resolve({
              status: 'unavailable',
              error:
                'Impossible de déterminer votre position. Vérifiez les autorisations de localisation et réessayez.',
            });
            break;
          case error.TIMEOUT:
            resolve({
              status: 'timeout',
              error:
                'Le délai pour déterminer votre position a expiré. Vérifiez votre signal réseau et réessayez.',
            });
            break;
          default:
            resolve({
              status: 'error',
              error:
                'Impossible de déterminer votre position. Vérifiez les autorisations de localisation et réessayez.',
            });
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Génère une URL d'itinéraire sécurisée standard
 */
export function getDirectionsUrl(
  name: string,
  address?: string,
  city?: string
): string {
  const query = [name, address, city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
