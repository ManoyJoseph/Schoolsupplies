import { createClient } from "./client";

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signOut();

  return { error };
}

export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();

  return session?.user ?? null;
}

export async function getUserRole(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data?.role ?? 'cashier';
}

export async function getRedirectPathByRole(userId: string) {
  const role = await getUserRole(userId);
  if (role === 'admin') return '/dashboard';
  return '/pos';
}
