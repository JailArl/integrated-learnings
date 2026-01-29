import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env
const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasCreds = !!url && !!key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key';

export const supabase = hasCreds ? createClient(url!, key!) : null;
export const isSupabaseConfigured = !!supabase;
