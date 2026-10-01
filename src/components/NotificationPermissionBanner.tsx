import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  requestAndRegisterPushNotifications,
  sendWelcomeNotification,
} from '../services/notificationService';

export const NotificationPermissionBanner: React.FC = () => {
  const { currentUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isPushNotificationSupported()) return;

    const currentPermission = getNotificationPermissionState();
    const isDismissed = localStorage.getItem('maman_notifications_dismissed');

    // Only prompt if permission is 'default' (not yet asked) and not dismissed
    if (currentPermission === 'default' && !isDismissed) {
      // Delay showing by 1.8 seconds for smooth UI entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = async () => {
    setIsSubscribing(true);
    setStatusMessage('Activation en cours...');

    try {
      const res = await requestAndRegisterPushNotifications(currentUser?.id);
      if (res.success) {
        setIsSuccess(true);
        setStatusMessage('Notifications activées avec succès ! 🔔');
        if (currentUser?.id) {
          sendWelcomeNotification(currentUser.id).catch((err) =>
            console.warn('[Banner] Welcome notification dispatch error:', err)
          );
        }
        setTimeout(() => {
          setIsVisible(false);
        }, 2500);
      } else {
        setStatusMessage(res.error || 'Autorisation refusée.');
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Erreur lors de l’activation.');
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('maman_notifications_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="notification-permission-banner"
      role="region"
      aria-label="Autorisation des notifications"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E8E2D8] shadow-[0_12px_36px_rgba(44,40,37,0.12)] space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEECEC] border border-[#FAD7D7] flex items-center justify-center shrink-0 text-[#9E2A2B]">
              {isSuccess ? (
                <Check className="w-5 h-5 text-[#1E653A]" />
              ) : (
                <BellRing className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[14.5px] font-serif font-bold text-[#1E1B18]">
                  Notifications MAMAN+
                </h3>
              </div>
              <p className="text-[12px] text-[#69625A] leading-snug mt-0.5">
                Restez sereine : rappels de rendez-vous, vitamines et conseils personnalisés.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer"
            className="text-[#9E968E] hover:text-[#47413B] p-1 rounded-lg hover:bg-[#F4EFEA] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 ${
              isSuccess
                ? 'bg-[#E7F8ED] text-[#1E653A] border border-[#C5EAD0]'
                : 'bg-[#FAF6F0] text-[#69625A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {!isSuccess && (
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3.5 py-2 text-[12.5px] font-medium text-[#7D756D] hover:text-[#2C2825] hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
            >
              Plus tard
            </button>
            <button
              type="button"
              disabled={isSubscribing}
              onClick={handleAccept}
              className="flex items-center gap-1.5 px-4 py-2 text-[12.5px] font-semibold text-white bg-[#9E2A2B] hover:bg-[#852324] rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isSubscribing ? 'Activation...' : 'Activer les notifications'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
