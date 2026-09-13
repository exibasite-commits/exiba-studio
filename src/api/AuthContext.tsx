import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, AppUser } from './api';
import { buildTemplateSite, createInitialUserSite, SiteRecord } from './db';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<AppUser>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name?: string,
    templateId?: string
  ) => Promise<{ user: AppUser; site: SiteRecord }>;
  signInWithGoogle: (
    credential: string,
    templateId?: string
  ) => Promise<{ user: AppUser; site: SiteRecord }>;
  refreshUser: () => Promise<AppUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Tenta restaurar a sessão real via cookie (GET /api/auth/me)
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ user: AppUser }>('/api/auth/me');
        if (cancelled) return;
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const data = await apiFetch<{ user: AppUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password: pass },
    });
    setUser(data.user);
    return data.user;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    templateId?: string
  ) => {
    const initialSite = buildTemplateSite(templateId);
    const data = await apiFetch<{ user: AppUser; site: SiteRecord }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: {
          email,
          password: pass,
          name,
          initialSite: {
            title: initialSite.title,
            templateId: initialSite.templateId,
            config: initialSite.config,
          },
        },
      }
    );
    setUser(data.user);
    return { user: data.user, site: data.site };
  };

  const signInWithGoogle = async (credential: string, templateId?: string) => {
    const data = await apiFetch<{ user: AppUser }>('/api/auth/google', {
      method: 'POST',
      body: { credential },
    });
    setUser(data.user);
    const initialSite = await createInitialUserSite(
      data.user.uid,
      data.user.email || 'usuario',
      templateId
    );
    return { user: data.user, site: initialSite };
  };


  const refreshUser = async () => {
    try {
      const data = await apiFetch<{ user: AppUser }>('/api/auth/me');
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const logout = async () => {
    setUser(null);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignora se já não está autenticado
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
