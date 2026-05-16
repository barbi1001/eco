import { writable, get, derived } from 'svelte/store';
import { browser } from '$app/environment';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://strapi-7iq2.onrender.com';
const STORAGE_KEY = 'barb_admin_auth';

export interface AdminUser {
	id: number;
	username: string;
	email: string;
	role?: { name: string };
}

interface AuthState {
	jwt: string | null;
	user: AdminUser | null;
}

function loadInitial(): AuthState {
	if (!browser) return { jwt: null, user: null };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { jwt: null, user: null };
		const parsed = JSON.parse(raw);
		return { jwt: parsed.jwt ?? null, user: parsed.user ?? null };
	} catch {
		return { jwt: null, user: null };
	}
}

export const adminAuth = writable<AuthState>(loadInitial());
export const isAuthenticated = derived(adminAuth, ($a) => !!$a.jwt);

adminAuth.subscribe((state) => {
	if (!browser) return;
	if (state.jwt) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}
});

export async function login(identifier: string, password: string): Promise<void> {
	const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier, password })
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		const msg = body?.error?.message || 'התחברות נכשלה — בדקי שם משתמש וסיסמה';
		throw new Error(msg);
	}

	const data = await res.json();
	const jwt: string = data.jwt;
	const baseUser = data.user;

	let roleName: string | undefined;
	try {
		const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
			headers: { Authorization: `Bearer ${jwt}` }
		});
		if (meRes.ok) {
			const me = await meRes.json();
			roleName = me?.role?.name;
		}
	} catch {
		// Non-fatal — role check is best-effort
	}

	if (roleName && roleName !== 'Admin Manager' && roleName !== 'Administrator') {
		throw new Error('למשתמש זה אין הרשאות ניהול');
	}

	adminAuth.set({
		jwt,
		user: {
			id: baseUser.id,
			username: baseUser.username,
			email: baseUser.email,
			role: roleName ? { name: roleName } : undefined
		}
	});
}

export function logout(): void {
	adminAuth.set({ jwt: null, user: null });
}

export function authHeaders(): HeadersInit {
	const { jwt } = get(adminAuth);
	return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
	const headers = new Headers(init.headers || {});
	const { jwt } = get(adminAuth);
	if (jwt) headers.set('Authorization', `Bearer ${jwt}`);
	if (init.body && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}
	const res = await fetch(`${STRAPI_URL}${path}`, { ...init, headers });
	if (res.status === 401 || res.status === 403) {
		logout();
	}
	return res;
}

export { STRAPI_URL };
