import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.log(error.message);
        if (mounted) {
          setUser(data?.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim(), full_name: name.trim() }
      }
    });
    if (error) throw error;
    return data.user;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log("Error al cerrar sesión en Supabase:", error.message);
      }
    } catch (err) {
      console.log(err.message);
    }
    // Solo limpiamos el usuario en memoria; NO borramos AsyncStorage
    // para que tus reservas, reseñas y favoritos sigan guardados
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);