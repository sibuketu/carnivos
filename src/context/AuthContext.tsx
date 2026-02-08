import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/auth-js';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isGuest: boolean;
    signInAsGuest: () => void;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // Check for guest mode
        const guestMode = localStorage.getItem('primal_logic_guest_mode') === 'true';
        if (guestMode) {
            setIsGuest(true);
            setLoading(false);
            return;
        }

        if (isSupabaseAvailable() && supabase) {
            // Native: OAuth リダイレクトでアプリが開いた場合にセッションを復元
            const restoreSessionFromLaunchUrl = async (url: string) => {
                const hash = url.includes('#') ? url.slice(url.indexOf('#')) : '';
                if (!hash) return;
                const params = new URLSearchParams(hash.slice(1));
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');
                if (access_token && refresh_token) {
                    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
                    if (!error) {
                        setSession(data.session);
                        setUser(data.user ?? null);
                        setIsGuest(false);
                    }
                }
            };

            let urlListener: { remove: () => Promise<void> } | null = null;
            if (Capacitor.isNativePlatform()) {
                App.getLaunchUrl().then(({ url }) => {
                    if (url && url.includes('auth')) restoreSessionFromLaunchUrl(url);
                }).catch(() => {});
                App.addListener('appUrlOpen', (e) => {
                    if (e.url && e.url.includes('auth')) restoreSessionFromLaunchUrl(e.url);
                }).then((listener) => {
                    urlListener = listener;
                });
            }

            // Get initial session
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

            // Listen for auth changes
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // If we have a session, ensure guest mode is off
                if (session) {
                    setIsGuest(false);
                    localStorage.removeItem('primal_logic_guest_mode');
                }
            });

            return () => {
                subscription.unsubscribe();
                urlListener?.remove().catch(() => {});
            };
        } else {
            setLoading(false);
        }
    }, []);

    const signInAsGuest = () => {
        setIsGuest(true);
        localStorage.setItem('primal_logic_guest_mode', 'true');
    };

    const signOut = async () => {
        if (isGuest) {
            setIsGuest(false);
            localStorage.removeItem('primal_logic_guest_mode');
            return;
        }

        if (isSupabaseAvailable() && supabase) {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
        }
    };

    const value = {
        session,
        user,
        loading,
        isGuest,
        signInAsGuest,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
