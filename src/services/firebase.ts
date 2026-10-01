import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

// Normalize project ID: handle cases where container or settings has "62544" without "maman-" prefix
const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();
const normalizedProjectId =
  !rawProjectId || rawProjectId === '62544' ? 'maman-62544' : rawProjectId;

// Configuration loaded dynamically from import.meta.env with safe project fallback
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAdMjzxjzqIEbmGSgmh-bDIjXyUf968xb8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${normalizedProjectId}.firebaseapp.com`,
  projectId: normalizedProjectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${normalizedProjectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '44712893491',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:44712893491:web:4fa978ec1a78b95e751746',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    console.info('[Firebase] Initialized successfully with project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
  }
} else {
  console.warn('[Firebase] Environment variables not fully set. Please check VITE_FIREBASE_* variables.');
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

/**
 * Validates connection to Firestore server
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized' };
  }
  try {
    // Attempt reading a health-check document to test network reachability
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return { success: true, message: 'Firestore connection confirmed' };
  } catch (error: any) {
    // Permission-denied means the server is reachable and active (security rules enforced)
    if (error?.code === 'permission-denied' || error?.message?.includes('permission-denied')) {
      return { success: true, message: 'Firestore connected (secured with rules)' };
    }
    if (error?.message?.includes('the client is offline')) {
      return { success: false, message: 'Firestore client is offline' };
    }
    return { success: false, message: error?.message || 'Unknown Firestore error' };
  }
}

// Error handling helper for Firestore operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || false,
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  return errInfo;
}
