import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useSession } from '@/components/hooks/useSession';

function hasCapacitor() {
  return typeof window !== 'undefined' && !!window.Capacitor;
}

function getPlugin(name) {
  return window.Capacitor?.Plugins?.[name] || null;
}

function normalizeDeepLink(rawUrl, originHost) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (originHost && url.host && url.host !== originHost) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return rawUrl.startsWith('/') ? rawUrl : null;
  }
}

export default function MobileBridge() {
  const navigate = useNavigate();
  const { user, activeSchoolId } = useSession();
  const registeredSchoolRef = useRef(null);

  useEffect(() => {
    if (!hasCapacitor()) return undefined;
    const app = getPlugin('App');
    if (!app?.addListener) return undefined;

    const handler = app.addListener('appUrlOpen', ({ url }) => {
      const path = normalizeDeepLink(url, window.location.host);
      if (path) {
        navigate(path);
      }
    });

    return () => {
      handler?.remove?.();
    };
  }, [navigate]);

  useEffect(() => {
    if (!hasCapacitor()) return undefined;
    if (!user?.email || !activeSchoolId) return undefined;
    if (registeredSchoolRef.current === activeSchoolId) return undefined;

    const push = getPlugin('PushNotifications');
    if (!push?.requestPermissions || !push?.register) return undefined;

    registeredSchoolRef.current = activeSchoolId;
    let removeHandlers = [];

    const register = async () => {
      try {
        const perm = await push.requestPermissions();
        if (perm?.receive !== 'granted') {
          registeredSchoolRef.current = null;
          return;
        }

        removeHandlers.push(
          push.addListener('registration', async (token) => {
            const value = token?.value || token;
            if (!value) return;
            try {
              await base44.request('/notifications/register', {
                method: 'POST',
                body: {
                  token: value,
                  school_id: activeSchoolId,
                  user_email: user.email,
                  platform: window.Capacitor?.getPlatform?.() || 'web',
                },
              });
            } catch {
              // best effort
            }
          })
        );

        removeHandlers.push(
          push.addListener('registrationError', (err) => {
            console.warn('Push registration error', err);
          })
        );

        removeHandlers.push(
          push.addListener('pushNotificationReceived', (notification) => {
            const title = notification?.title || 'New notification';
            const body = notification?.body || '';
            toast.message(title, body ? { description: body } : undefined);
          })
        );

        removeHandlers.push(
          push.addListener('pushNotificationActionPerformed', (event) => {
            const url = event?.notification?.data?.url || event?.notification?.data?.deepLink;
            const path = normalizeDeepLink(url, window.location.host);
            if (path) {
              navigate(path);
            }
          })
        );

        await push.register();
      } catch (error) {
        console.warn('Push registration failed', error);
        registeredSchoolRef.current = null;
      }
    };

    register();

    return () => {
      removeHandlers.forEach((handler) => handler?.remove?.());
    };
  }, [user?.email, activeSchoolId, navigate]);

  return null;
}
