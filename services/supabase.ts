import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env
const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
const appUrl = (import.meta as any).env?.VITE_APP_URL as string | undefined;
const publicAppUrl = (import.meta as any).env?.VITE_PUBLIC_APP_URL as string | undefined;
const siteUrl = (import.meta as any).env?.VITE_SITE_URL as string | undefined;

const hasCreds = !!url && !!key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key';

export const supabase = hasCreds ? createClient(url!, key!) : null;
export const isSupabaseConfigured = !!supabase;

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

export const getAppBaseUrl = (): string => {
	const configured = publicAppUrl || appUrl || siteUrl;
	if (configured && configured.trim().length > 0) {
		return trimTrailingSlash(configured.trim());
	}

	if (typeof window !== 'undefined' && window.location?.origin) {
		return trimTrailingSlash(window.location.origin);
	}

	return '';
};
