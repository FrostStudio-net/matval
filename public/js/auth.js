import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in /public/js/supabaseConfig.js.");
  }
  return supabase;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("[Supabase auth] getCurrentUser failed:", error);
    return null;
  }
  return data?.user || null;
}

export async function signInWithGoogle() {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback.html`,
    },
  });

  if (error) {
    console.error("Google login failed:", error);
    throw error;
  }

  return data;
}

export async function signInWithEmail(email) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback.html`,
    },
  });

  if (error) {
    console.error("Magic link failed:", error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export function listenToAuthChanges(callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback(null);
    return { unsubscribe() {} };
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });

  return data?.subscription || { unsubscribe() {} };
}

window.MatvalAuth = {
  getCurrentUser,
  signInWithGoogle,
  signInWithEmail,
  signOut,
  listenToAuthChanges,
  isSupabaseConfigured,
};
