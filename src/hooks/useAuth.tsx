import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  permissions: string[]; // List of allowed pages/actions
  loading: boolean;
  supabase: typeof supabase;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string, userMetadata: any) => {
    // 1. Check DB role (Master)
    const { data: roleData } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const isMaster = !!roleData;
    setIsAdmin(isMaster);

    if (isMaster) {
      setPermissions(["*"]); // Master has all permissions
    } else {
      // 2. Check metadata permissions (for secondary admins)
      const userPerms = userMetadata?.permissions || [];
      setPermissions(userPerms);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id, session.user.user_metadata);
      } else {
        setIsAdmin(false);
        setPermissions([]);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id, session.user.user_metadata);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (loginIdentifier: string, password: string) => {
    // Se não tiver @, trata como Nome de Usuário interno
    const loginEmail = loginIdentifier.includes("@") 
      ? loginIdentifier.trim().toLowerCase() 
      : `${loginIdentifier.trim().toLowerCase()}@radio.internal`;

    const { error } = await supabase.auth.signInWithPassword({ 
      email: loginEmail, 
      password 
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setPermissions([]);
  };

  const hasPermission = (permission: string) => {
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, permissions, loading, supabase, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
