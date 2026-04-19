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

const isLocalhostUrl = (value: string): boolean => {
	const normalized = value.trim().toLowerCase();
	return (
		normalized.includes('localhost') ||
		normalized.includes('127.0.0.1') ||
		normalized.includes('0.0.0.0')
	);
};

export const getAppBaseUrl = (): string => {
	const configured = publicAppUrl || appUrl || siteUrl;
	const browserOrigin = typeof window !== 'undefined' && window.location?.origin
		? trimTrailingSlash(window.location.origin)
		: '';

	if (configured && configured.trim().length > 0) {
		const normalizedConfigured = trimTrailingSlash(configured.trim());

		// If env is accidentally left as localhost in production, prefer runtime origin.
		if (
			isLocalhostUrl(normalizedConfigured) &&
			browserOrigin &&
			!isLocalhostUrl(browserOrigin)
		) {
			return browserOrigin;
		}

		return normalizedConfigured;
	}

	if (browserOrigin) {
		return browserOrigin;
	}

	// Final fallback for non-browser contexts.
	return 'https://www.integratedlearnings.com.sg';
};
