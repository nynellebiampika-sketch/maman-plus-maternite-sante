import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseAuthProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { User } from '../types';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
} from '../services/firestoreService';
import {
  sendWelcomeNotification,
  processPostLoginNotifications,
} from '../services/notificationService';
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  getUserAccounts,
  saveUserAccounts,
  findAccountByEmail,
  hashPassword,
  StoredUserAccount,
  DEMO_USER,
  seedDemoAccount,
} from '../services/storage';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dueDate?: string;
  lastMenstrualPeriodDate?: string;
  heightCm?: number;
  prePregnancyWeightKg?: number;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Formats any Firebase Auth or Firestore error with the EXACT Firebase error code
 * and an explicit explanation in French so no technical detail is masked.
 */
export function formatDetailedFirebaseError(
  err: any,
  context: 'login' | 'register' = 'login'
): string {
  if (!err) {
    return context === 'login'
      ? 'Échec de la connexion. Vérifiez vos identifiants.'
      : 'Échec de la création du compte.';
  }

  // 1. Extract exact Firebase error code
  let code = (typeof err.code === 'string' ? err.code : '').trim();

  // If code is not present directly, extract from message (e.g., "Firebase: Error (auth/invalid-credential).")
  const rawMsg = String(err.message || err);
  if (!code) {
    const authMatch = rawMsg.match(/auth\/[a-z0-9-]+/i);
    if (authMatch) {
      code = authMatch[0].toLowerCase();
    } else {
      const fsMatch = rawMsg.match(/(permission-denied|unavailable|not-found|already-exists)/i);
      if (fsMatch) {
        code = fsMatch[0].toLowerCase();
      }
    }
  }

  // 2. Map known codes with accurate French description AND the exact code
  switch (code) {
    case 'auth/invalid-credential':
      return 'Identifiants incorrects : l’adresse e-mail ou le mot de passe est invalide, ou ce compte n’a pas encore été créé sur Firebase. [auth/invalid-credential]';

    case 'auth/user-not-found':
      return 'Aucun compte Firebase n’a été trouvé avec cette adresse e-mail. [auth/user-not-found]';

    case 'auth/wrong-password':
      return 'Le mot de passe saisi est incorrect pour ce compte. [auth/wrong-password]';

    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà associée à un compte Firebase. Connectez-vous ou réinitialisez votre mot de passe. [auth/email-already-in-use]';

    case 'auth/operation-not-allowed':
      return 'Le fournisseur d’authentification Email/Mot de passe n’est pas activé sur ce projet Firebase. [auth/operation-not-allowed]';

    case 'auth/weak-password':
      return 'Le mot de passe est trop court : il doit comporter au moins 6 caractères. [auth/weak-password]';

    case 'auth/invalid-email':
      return 'Le format de l’adresse e-mail est invalide. [auth/invalid-email]';

    case 'auth/user-disabled':
      return 'Ce compte utilisateur a été désactivé dans Firebase. [auth/user-disabled]';

    case 'auth/too-many-requests':
      return 'Trop de tentatives infructueuses. L’accès est temporairement bloqué par Firebase. [auth/too-many-requests]';

    case 'auth/network-request-failed':
      return 'Connexion réseau impossible vers les serveurs Firebase. [auth/network-request-failed]';

    case 'auth/popup-closed-by-user':
      return 'Fenêtre d’authentification fermée par l’utilisateur. [auth/popup-closed-by-user]';

    case 'permission-denied':
      return 'Accès refusé par les règles de sécurité Firestore du projet maman-62544. [permission-denied]';

    case 'unavailable':
      return 'Service Firestore temporairement indisponible ou réseau hors-ligne. [unavailable]';

    default: {
      const codeLabel = code ? ` [${code}]` : '';
      const cleanMessage = err.message
        ? err.message.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[a-z0-9-]+\)\.?/i, '').trim()
        : '';
      return cleanMessage
        ? `Erreur Firebase : ${cleanMessage}${codeLabel}`
        : `Erreur Firebase d’authentification${codeLabel}`;
    }
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Monitor Firebase Auth state change if configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            // Attempt to load full user profile from Firestore
            const firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
            if (firestoreProfile) {
              const safeProfile: User = { ...firestoreProfile, id: fbUser.uid };
              setCurrentUser(safeProfile);
              saveActiveSession(safeProfile, true);
            } else {
              // Construct profile from Firebase auth token and local storage fallback
              const displayNameParts = (fbUser.displayName || '').split(' ');
              const fallbackAccount = findAccountByEmail(fbUser.email || '');
              const profile: User = {
                ...(fallbackAccount?.user || {}),
                id: fbUser.uid,
                email: fbUser.email || fallbackAccount?.user?.email || '',
                firstName: fallbackAccount?.user?.firstName || displayNameParts[0] || 'Maman',
                lastName: fallbackAccount?.user?.lastName || displayNameParts.slice(1).join(' ') || '',
                createdAt: fallbackAccount?.user?.createdAt || new Date().toISOString(),
              };
              // Persist to Firestore
              try {
                await saveUserProfileToFirestore(profile);
              } catch (writeErr) {
                console.warn('[Firestore] Non-fatal notice initializing profile in Firestore:', writeErr);
              }
              setCurrentUser(profile);
              saveActiveSession(profile, true);
            }
          } catch (err) {
            console.warn('[Auth] Non-fatal notice resolving user profile from Firestore:', err);
            // Fallback to active local session but guarantee Firebase UID is preserved
            const local = getActiveSession();
            const displayNameParts = (fbUser.displayName || '').split(' ');
            const safeUser: User = {
              ...(local || {}),
              id: fbUser.uid,
              email: fbUser.email || local?.email || '',
              firstName: local?.firstName || displayNameParts[0] || 'Maman',
              lastName: local?.lastName || displayNameParts.slice(1).join(' ') || '',
              createdAt: local?.createdAt || new Date().toISOString(),
            };
            setCurrentUser(safeUser);
            saveActiveSession(safeUser, true);
          }
        } else {
          // Firebase reports no signed-in user
          clearActiveSession();
          setCurrentUser(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Offline / Local storage fallback if Firebase credentials were not provided
      try {
        const sessionUser = getActiveSession();
        if (sessionUser) {
          const account = findAccountByEmail(sessionUser.email);
          setCurrentUser(account ? account.user : sessionUser);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const loginAsDemo = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      seedDemoAccount();
      saveActiveSession(DEMO_USER, true);
      setCurrentUser(DEMO_USER);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erreur lors du chargement de la démo.' };
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Veuillez renseigner votre adresse e-mail et votre mot de passe.' };
    }

    // Direct instant demo account access
    if (cleanEmail === 'demo@mamanplus.fr' || cleanEmail === 'demo') {
      return loginAsDemo();
    }

    // 1. If Firebase is configured, authenticate with real Firebase Auth
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const uid = cred.user.uid;
        console.log('LOGIN OK');
        console.log('LOGIN OK:', cleanEmail);
        console.log('UID OK:', uid);

        // Fetch or create user document in Firestore
        let profile: User | null = null;
        try {
          profile = await getUserProfileFromFirestore(uid);
        } catch (fsErr) {
          console.warn('[Firebase] Warning reading profile from Firestore:', fsErr);
        }

        if (!profile) {
          const localAccount = findAccountByEmail(cleanEmail);
          const nameParts = (cred.user.displayName || '').split(' ');
          profile = {
            ...(localAccount?.user || {}),
            id: uid,
            email: cleanEmail,
            firstName: localAccount?.user?.firstName || nameParts[0] || 'Maman',
            lastName: localAccount?.user?.lastName || nameParts.slice(1).join(' ') || '',
            createdAt: localAccount?.user?.createdAt || new Date().toISOString(),
          };
          try {
            await saveUserProfileToFirestore(profile);
          } catch (writeErr) {
            console.warn('[Firebase] Warning saving auto-created profile to Firestore:', writeErr);
          }
        } else {
          profile = { ...profile, id: uid };
        }

        saveActiveSession(profile, rememberMe);
        setCurrentUser(profile);

        // Déclencher le cycle réel de notification post-connexion
        processPostLoginNotifications(uid).catch((notifErr) => {
          console.warn('[Post-Login Push] Error executing notification flow:', notifErr);
        });

        return { success: true };
      } catch (err: any) {
        console.warn('[Firebase Auth] Login notice, checking local verified account fallback:', err);
        // Fallback to local accounts if account exists locally (e.g. demo account or offline user)
        const localAccount = findAccountByEmail(cleanEmail);
        if (localAccount && localAccount.passwordHash === hashPassword(password)) {
          console.info('[Auth] Successful login with verified local account:', cleanEmail);
          saveActiveSession(localAccount.user, rememberMe);
          setCurrentUser(localAccount.user);
          return { success: true };
        }
        const message = formatDetailedFirebaseError(err, 'login');
        return { success: false, error: message };
      }
    }

    // 2. Fallback to local accounts
    await new Promise((resolve) => setTimeout(resolve, 350));
    const account = findAccountByEmail(cleanEmail);
    if (!account) {
      return {
        success: false,
        error:
          'Identifiants incorrects : l’adresse e-mail ou le mot de passe est erroné. [auth/invalid-credential]',
      };
    }

    const inputHash = hashPassword(password);
    if (account.passwordHash !== inputHash) {
      return {
        success: false,
        error:
          'Identifiants incorrects : l’adresse e-mail ou le mot de passe est erroné. [auth/invalid-credential]',
      };
    }

    saveActiveSession(account.user, rememberMe);
    setCurrentUser(account.user);
    return { success: true };
  };

  const register = async (
    data: RegisterInput
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail || !data.password || !data.firstName.trim()) {
      return { success: false, error: 'Veuillez remplir tous les champs obligatoires.' };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        error:
          'Le mot de passe est trop court : il doit comporter au moins 6 caractères. [auth/weak-password]',
      };
    }

    // 1. If Firebase is configured, register with real Firebase Auth and save to Firestore
    if (isFirebaseConfigured && auth) {
      let uid = '';
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
        uid = userCred.user.uid;

        // Update Firebase Auth profile displayName
        try {
          if (auth.currentUser) {
            await updateFirebaseAuthProfile(auth.currentUser, {
              displayName: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
            });
          }
        } catch (profileErr) {
          console.warn('[Firebase Auth] Could not update displayName:', profileErr);
        }

        const newUser: User = {
          id: uid,
          email: cleanEmail,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          dueDate: data.dueDate || undefined,
          lastMenstrualPeriodDate: data.lastMenstrualPeriodDate || undefined,
          heightCm: data.heightCm,
          prePregnancyWeightKg: data.prePregnancyWeightKg,
          createdAt: new Date().toISOString(),
        };

        // Write user profile to Firestore
        try {
          await saveUserProfileToFirestore(newUser);
        } catch (fsErr) {
          console.warn('[Firestore] Warning writing user profile during registration:', fsErr);
        }

        // Also persist locally for offline resilience
        const accounts = getUserAccounts();
        accounts.push({
          user: newUser,
          passwordHash: hashPassword(data.password),
        });
        saveUserAccounts(accounts);

        // Also save to active session
        saveActiveSession(newUser, true);
        setCurrentUser(newUser);

        // Trigger real Welcome Push Notification required by MAMAN+
        sendWelcomeNotification(newUser.id).catch((e) =>
          console.warn('[Push] Error sending welcome notification:', e)
        );

        return { success: true };
      } catch (authErr: any) {
        console.warn('[Firebase Auth] Registration notice, checking fallback:', authErr);
        // If Firebase Auth fails with operation-not-allowed or network, fallback gracefully to local storage
        if (authErr?.code === 'auth/email-already-in-use') {
          return { success: false, error: 'Cette adresse e-mail est déjà associée à un compte.' };
        }
        // Graceful fallback so user is never blocked
        const existing = findAccountByEmail(cleanEmail);
        if (existing) {
          return { success: false, error: 'Un compte existe déjà avec cette adresse e-mail.' };
        }
        const fallbackUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const fallbackUser: User = {
          id: fallbackUid,
          email: cleanEmail,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          dueDate: data.dueDate || undefined,
          lastMenstrualPeriodDate: data.lastMenstrualPeriodDate || undefined,
          heightCm: data.heightCm,
          prePregnancyWeightKg: data.prePregnancyWeightKg,
          createdAt: new Date().toISOString(),
        };
        const accounts = getUserAccounts();
        accounts.push({
          user: fallbackUser,
          passwordHash: hashPassword(data.password),
        });
        saveUserAccounts(accounts);
        saveActiveSession(fallbackUser, true);
        setCurrentUser(fallbackUser);
        return { success: true };
      }
    }

    // 2. Fallback to local accounts
    await new Promise((resolve) => setTimeout(resolve, 400));
    const existing = findAccountByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'Un compte existe déjà avec cette adresse e-mail.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dueDate: data.dueDate || undefined,
      lastMenstrualPeriodDate: data.lastMenstrualPeriodDate || undefined,
      heightCm: data.heightCm,
      prePregnancyWeightKg: data.prePregnancyWeightKg,
      createdAt: new Date().toISOString(),
    };

    const newAccount: StoredUserAccount = {
      user: newUser,
      passwordHash: hashPassword(data.password),
    };

    const accounts = getUserAccounts();
    accounts.push(newAccount);
    saveUserAccounts(accounts);

    saveActiveSession(newUser, true);
    setCurrentUser(newUser);

    // Trigger real Welcome Push Notification required by MAMAN+
    sendWelcomeNotification(newUser.id).catch((e) =>
      console.warn('[Push] Error sending welcome notification:', e)
    );

    return { success: true };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('[Firebase Auth] SignOut error:', err);
      }
    }
    clearActiveSession();
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const effectiveId = auth?.currentUser?.uid || currentUser.id;
    const updatedUser: User = { ...currentUser, ...updates, id: effectiveId };

    // Update in Firestore
    if (isFirebaseConfigured && auth) {
      try {
        await saveUserProfileToFirestore(updatedUser);
      } catch (err) {
        console.error('[Firestore] Error saving updated user profile:', err);
      }
    }

    // Update local accounts store
    const accounts = getUserAccounts();
    const index = accounts.findIndex(
      (a) =>
        a.user.id === currentUser.id ||
        a.user.id === effectiveId ||
        a.user.email.toLowerCase() === updatedUser.email.toLowerCase()
    );
    if (index !== -1) {
      accounts[index].user = updatedUser;
      saveUserAccounts(accounts);
    }

    const isRemembered = localStorage.getItem('maman_plus_remember') === 'true';
    saveActiveSession(updatedUser, isRemembered);
    setCurrentUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;

    // 1. If Firebase Auth is active
    if (isFirebaseConfigured && auth && auth.currentUser && auth.currentUser.email) {
      try {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        return true;
      } catch (err) {
        console.error('[Firebase Auth] Error changing password:', err);
        return false;
      }
    }

    // 2. Local fallback
    const accounts = getUserAccounts();
    const accountIndex = accounts.findIndex((a) => a.user.email.toLowerCase() === currentUser.email.toLowerCase());
    if (accountIndex === -1) return false;

    const inputHash = hashPassword(currentPassword);
    if (accounts[accountIndex].passwordHash !== inputHash) {
      return false;
    }

    accounts[accountIndex].passwordHash = hashPassword(newPassword);
    saveUserAccounts(accounts);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
        changePassword,
        isFirebaseActive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
