import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Clock,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  ExternalLink,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { NotificationItem } from '../../types';
import {
  getNotificationPermissionState,
  requestAndRegisterPushNotifications,
} from '../../services/notificationService';

interface NotificationsViewProps {
  onNavigate?: (path: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useUserData();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'reminders' | 'advice'>('all');
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [isActivating, setIsActivating] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updatePermission = useCallback(() => {
    const perm = getNotificationPermissionState();
    setPermissionState(perm);
  }, []);

  useEffect(() => {
    updatePermission();
    const handleStatusChange = () => updatePermission();
    window.addEventListener('maman-push-status-changed', handleStatusChange);
    return () => window.removeEventListener('maman-push-status-changed', handleStatusChange);
  }, [updatePermission]);

  const handleEnableNotifications = async () => {
    setIsActivating(true);
    setFeedbackMessage(null);

    try {
      const res = await requestAndRegisterPushNotifications(currentUser?.id);
      if (res.success) {
        setPermissionState('granted');
        setFeedbackMessage({
          type: 'success',
          message: 'Notifications activées avec succès !',
        });
      } else {
        updatePermission();
        if (res.error) {
          setFeedbackMessage({
            type: 'error',
            message: res.error,
          });
        }
      }
    } catch (err: any) {
      updatePermission();
      setFeedbackMessage({
        type: 'error',
        message: err?.message || 'Impossible d’activer les notifications pour le moment.',
      });
    } finally {
      setIsActivating(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const openInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  // Filter logic
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'reminders') return n.type === 'appointment' || n.type === 'reminder';
    if (activeTab === 'advice') return n.type === 'advice' || n.type === 'welcome';
    return true;
  });

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#1E653A]" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-[#8C5E24]" />;
      case 'welcome':
        return <Sparkles className="w-4 h-4 text-[#9E2A2B]" />;
      case 'advice':
        return <Heart className="w-4 h-4 text-[#852324]" />;
      case 'clinical':
      default:
        return <Activity className="w-4 h-4 text-[#9E2A2B]" />;
    }
  };

  const getBadgeStyleForType = (type?: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-[#E7F8ED] text-[#1E653A] border-[#C5EAD0]';
      case 'reminder':
        return 'bg-[#FAF5EC] text-[#8C5E24] border-[#EEDDC6]';
      case 'welcome':
        return 'bg-[#FEECEC] text-[#9E2A2B] border-[#FAD7D7]';
      case 'advice':
        return 'bg-[#F4ECE8] text-[#852324] border-[#EAD6CE]';
      case 'clinical':
      default:
        return 'bg-[#FEECEC] text-[#9E2A2B] border-[#FAD7D7]';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'appointment':
        return 'Rendez-vous';
      case 'reminder':
        return 'Rappel';
      case 'welcome':
        return 'Bienvenue';
      case 'advice':
        return 'Conseil';
      case 'clinical':
      default:
        return 'Santé';
    }
  };

  const handleCardClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    const targetPath = notification.data?.path || notification.data?.url;
    if (targetPath && onNavigate) {
      onNavigate(targetPath);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE6DF]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-serif text-[24px] sm:text-[28px] font-bold text-[#1E1B18] tracking-tight">
              Mes notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9E2A2B] text-white shadow-2xs">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-[13.5px] text-[#69625A]">
            Restez informée de vos rendez-vous, rappels et conseils importants.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllNotificationsAsRead()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#47413B] border border-[#DDD7CD] hover:bg-[#F8F7F4] shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#1E653A]" />
              <span>Tout marquer comme lu</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous supprimer toutes vos notifications ?')) {
                  clearAllNotifications();
                }
              }}
              className="p-2 rounded-xl text-[#8C847D] hover:text-[#9E2A2B] hover:bg-white border border-transparent hover:border-[#DDD7CD] transition-colors cursor-pointer"
              title="Vider les notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Notification Card (Simple, elegant, reassuring) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D8] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                permissionState === 'granted'
                  ? 'bg-[#E7F8ED] border-[#C5EAD0] text-[#1E653A]'
                  : permissionState === 'denied'
                  ? 'bg-[#FEECEC] border-[#FAD7D7] text-[#9E2A2B]'
                  : 'bg-[#FDF2F4] border-[#FADCE2] text-[#9E2A2B]'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14.5px] font-semibold text-[#1E1B18]">
                  {permissionState === 'granted'
                    ? 'Notifications activées'
                    : permissionState === 'denied'
                    ? 'Notifications désactivées'
                    : 'Notifications'}
                </h3>

                {permissionState === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D7F0DF] text-[#1E653A]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Activées</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-[#706961] mt-0.5 leading-relaxed">
                {permissionState === 'granted'
                  ? 'Vous recevrez vos rappels et informations importantes directement sur votre appareil.'
                  : permissionState === 'denied'
                  ? 'Pour recevoir vos rappels, autorisez les notifications dans les réglages de votre navigateur.'
                  : 'Recevez les rappels importants de MAMAN+ directement sur votre appareil.'}
              </p>
            </div>
          </div>

          {/* Action button */}
          {permissionState === 'default' && (
            <button
              type="button"
              disabled={isActivating}
              onClick={handleEnableNotifications}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#9E2A2B] hover:bg-[#852324] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60 shrink-0 self-stretch sm:self-auto"
            >
              <Bell className="w-4 h-4" />
              <span>{isActivating ? 'Activation en cours...' : 'Activer les notifications'}</span>
            </button>
          )}

          {permissionState === 'denied' && (
            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
              {isInIframe && (
                <button
                  type="button"
                  onClick={openInNewTab}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#9E2A2B] hover:bg-[#852324] text-white shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir dans un nouvel onglet</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHelpGuide(!showHelpGuide)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-[#7D756D] hover:text-[#1E1B18] bg-[#F8F7F4] hover:bg-[#ECE8E1] border border-[#DDD7CD] transition-colors cursor-pointer"
              >
                <span>{showHelpGuide ? 'Masquer l’aide' : 'Comment activer ?'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback message */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 border ${
              feedbackMessage.type === 'success'
                ? 'bg-[#E7F8ED] border-[#C5EAD0] text-[#1E653A]'
                : 'bg-[#FEECEC] border-[#FAD7D7] text-[#9E2A2B]'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.message}</span>
          </div>
        )}

        {/* Reassuring help guide when permission is denied */}
        {permissionState === 'denied' && showHelpGuide && (
          <div className="mt-2 p-4 bg-[#FAF8F5] rounded-xl border border-[#EADFD0] space-y-3 animate-in fade-in duration-200 text-xs">
            <h4 className="font-semibold text-[#1E1B18]">
              Comment autoriser les notifications :
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-[#EAE5DC] space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-[#1E1B18]">
                  <Laptop className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Sur ordinateur (Chrome / Edge)</span>
                </div>
                <p className="text-[#69625A] text-[11.5px] leading-relaxed">
                  Cliquez sur l'icône de réglages ou cadenas 🔒 à gauche de l'adresse du site, puis activez l'option <strong>Notifications</strong>.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#EAE5DC] space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-[#1E1B18]">
                  <Smartphone className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Sur smartphone</span>
                </div>
                <p className="text-[#69625A] text-[11.5px] leading-relaxed">
                  Dans le menu de votre navigateur, accédez à <strong>Paramètres du site &gt; Notifications</strong> et autorisez MAMAN+.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#2C2825] text-white'
              : 'bg-white text-[#5E5750] border border-[#E2DDD5] hover:bg-[#F7F5F0]'
          }`}
        >
          <span>Toutes</span>
          <span className="text-[10px] opacity-80">({notifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-[#9E2A2B] text-white'
              : 'bg-white text-[#5E5750] border border-[#E2DDD5] hover:bg-[#F7F5F0]'
          }`}
        >
          <span>Non lues</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-[#8C5E24] text-white'
              : 'bg-white text-[#5E5750] border border-[#E2DDD5] hover:bg-[#F7F5F0]'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Rendez-vous & Rappels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advice')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'advice'
              ? 'bg-[#1E653A] text-white'
              : 'bg-white text-[#5E5750] border border-[#E2DDD5] hover:bg-[#F7F5F0]'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Conseils & Bienvenue</span>
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#E8E2D8] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] border border-[#EAE6DF] mx-auto flex items-center justify-center text-[#8C847D]">
            <Bell className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-[17px] font-bold text-[#2C2825]">
            {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </h3>
          <p className="text-xs text-[#706961] max-w-md mx-auto leading-relaxed">
            Vos rendez-vous de consultation, rappels de vitamines et conseils de santé apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                item.read
                  ? 'bg-white border-[#E8E2D8] hover:border-[#DDD7CD]'
                  : 'bg-[#FFFBF7] border-[#F0D5C9] shadow-2xs hover:border-[#E8C2B3]'
              }`}
            >
              <div
                className="flex items-start gap-3.5 flex-1 cursor-pointer"
                onClick={() => handleCardClick(item)}
              >
                {/* Type Icon Container */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBadgeStyleForType(
                    item.type
                  )}`}
                >
                  {getIconForType(item.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={`text-[14.5px] font-semibold leading-snug ${
                        item.read ? 'text-[#3E3933]' : 'text-[#1E1B18] font-bold'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#9E2A2B] shrink-0" title="Non lue" />
                    )}

                    {item.type && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider border ${getBadgeStyleForType(
                          item.type
                        )}`}
                      >
                        {getTypeLabel(item.type)}
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-[#5C564F] leading-relaxed">
                    {item.body || item.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-[#8C847D]">
                    <span>{item.date}</span>
                    {item.createdAt && (
                      <span>
                        {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {item.data?.path && (
                      <span className="text-[#9E2A2B] font-medium flex items-center gap-0.5 hover:underline">
                        <span>Voir</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions on Item */}
              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationAsRead(item.id)}
                    className="p-2 text-xs text-[#5C564F] hover:text-[#1E653A] hover:bg-[#F2ECE4] rounded-lg transition-colors cursor-pointer"
                    title="Marquer comme lu"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  className="p-2 text-xs text-[#8C847D] hover:text-[#9E2A2B] hover:bg-[#FEECEC] rounded-lg transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
