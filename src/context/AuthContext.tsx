
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/auth-js';
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

            return () => subscription.unsubscribe();
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
