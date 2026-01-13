import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { requestJson } from '@/api/appClient';
import { appParams, getStoredToken } from '@/lib/app-params';
import { checkRateLimit } from '@/components/security/rateLimiter';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      const token = getStoredToken();
      if (!appParams.appId) {
        setIsLoadingPublicSettings(false);
        if (token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        return;
      }
      let shouldCheckAuth = !!token;

      if (token) {
        try {
          const publicSettings = await requestJson(`/app/public-settings/${appParams.appId}`, {
            token,
          });
          setAppPublicSettings(publicSettings);
        } catch (appError) {
          console.error('App state check failed:', appError);

          const reason = appError?.data?.reason || appError?.data?.extra_data?.reason;
          if ((appError.status === 401 || appError.status === 403) && reason) {
            if (reason === 'auth_required') {
              setAuthError({
                type: 'auth_required',
                message: 'Authentication required'
              });
              shouldCheckAuth = false;
            } else if (reason === 'user_not_registered') {
              setAuthError({
                type: 'user_not_registered',
                message: 'User not registered for this app'
              });
              shouldCheckAuth = false;
            } else {
              setAuthError({
                type: reason,
                message: appError.message
              });
              shouldCheckAuth = false;
            }
          }
        } finally {
          setIsLoadingPublicSettings(false);
        }
      } else {
        setIsLoadingPublicSettings(false);
      }

      if (shouldCheckAuth) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = async (nextUrl = window.location.href, options = {}) => {
    // Rate limit the redirect attempt (client-side defense)
    const { allowed } = await checkRateLimit('login', 'guest'); 
    if (!allowed) {
      console.warn('Login redirect rate limited');
      return;
    }
    // Uses Base44 SDK redirectToLogin(nextUrl)
    base44.auth.redirectToLogin(nextUrl, options);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
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
