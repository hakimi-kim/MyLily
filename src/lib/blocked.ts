// Accounts barred from the site. Their data stays in the database untouched.
const BLOCKED_USERNAMES = ['zhralily', 'zahra@gmail.com'];
const BLOCKED_USER_IDS = ['2', '4'];

export const BLOCKED_MESSAGE =
	'Sorry, you cannot log in to this website. This website will be taken down soon.';

export function isBlockedUsername(username: string | null | undefined): boolean {
	return !!username && BLOCKED_USERNAMES.includes(username.trim().toLowerCase());
}

// Reads the JWT payload without verifying it: only used to kick a session out, so a forged token gains nothing.
export function isBlockedToken(token: string): boolean {
	try {
		const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
		const payload = JSON.parse(atob(b64));
		const name =
			payload.unique_name ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
		const id =
			payload.nameid ??
			payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
		return isBlockedUsername(name) || BLOCKED_USER_IDS.includes(String(id));
	} catch {
		return false;
	}
}
