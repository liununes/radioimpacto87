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

  const checkAdmin = async (user: User) => {
    const isOwner = user.email === 'liununes06@gmail.com' || 
                    user.email === 'liununes06@radio.internal' || 
                    user.email === 'admin@radio.internal';
    
    // Tentar buscar permissões atualizadas da tabela para evitar cache/metadata desatualizado
    const { data: permsData } = await supabase
        .from('user_permissions')
        .select('permissions')
        .eq('user_id', user.id)
        .maybeSingle();

    const userPerms = permsData?.permissions || user.user_metadata?.permissions || [];
    
    // O dono master ou qualquer um que tenha recebido a permissão '*' na lista de colaboradores
    if (isOwner || userPerms.includes("*")) {
      setIsAdmin(true);
      setPermissions(["*"]);
    } else {
      setIsAdmin(false);
      setPermissions(userPerms);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user);
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
        checkAdmin(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (loginIdentifier: string, password: string) => {
    const identifier = loginIdentifier.trim().toLowerCase();
    let loginEmail = identifier;

    if (!identifier.includes("@")) {
      // Caso especial para o Admin Master acessar por nome mesmo usando o Gmail
      if (identifier === 'liununes06' || identifier === 'admin') {
        const { error: gmailError } = await supabase.auth.signInWithPassword({ 
          email: 'liununes06@gmail.com', 
          password 
        });
        if (!gmailError) return { error: null };
        
        // Se falhar com gmail, tenta o padrão interno (caso a conta tenha sido migrada)
        loginEmail = `${identifier}@radio.internal`;
      } else {
        loginEmail = `${identifier}@radio.internal`;
      }
    }

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
