/**
 * MSW handlers — frontend-only until backend is ready.
 * When backend is ready: set VITE_USE_MOCK_SERVICE=false.
 *
 * Real backend (not mocked):
 * - General Settings: site_configs / timezones / data-retention
 * - Cloud Sync / Licensing / Email / System Overview:
 *   cloud-sync / system-config / config-outbox/summary / server-time
 */
import { http, HttpResponse, delay } from 'msw';
import {
	MOCK_OTP_CODE,
	getForgotPasswordMockState,
	setForgotPasswordMockState,
	resetForgotPasswordMockState,
} from './forgotPasswordStore';
import { ALL_PERMISSIONS_TRUE } from '../types/permissions';

const forgotPasswordPath = '*/api/users/forgot-password/';
const rolesPath = '*/api/users/roles/';
const deviceCredentialsPath = '*/api/administration/device-credentials/';

const MOCK_ROLES = [
	{ id: 1, name: 'admin', description: 'Full system access', page_permission: { ...ALL_PERMISSIONS_TRUE } },
	{ id: 2, name: 'manager', description: 'Queue and schedule management', page_permission: { ...ALL_PERMISSIONS_TRUE } },
	{ id: 3, name: 'monitor', description: 'Read-only monitoring', page_permission: { ...ALL_PERMISSIONS_TRUE } },
	{ id: 4, name: 'operator', description: 'Serving point operations', page_permission: { ...ALL_PERMISSIONS_TRUE } },
	{ id: 5, name: 'user', description: 'Basic access', page_permission: { ...ALL_PERMISSIONS_TRUE } },
];

export const forgotPasswordHandlers = [
	http.post(forgotPasswordPath, async ({ request }) => {
		await delay(400);
		const body = (await request.json()) as { username?: string; action?: string };

		if (body.action === 'request_otp') {
			const username = (body.username || '').trim();
			if (!username || !username.includes('@')) {
				return HttpResponse.json({ message: 'Valid email is required' }, { status: 400 });
			}
			setForgotPasswordMockState({ username, otp: MOCK_OTP_CODE, verified: false });
			return HttpResponse.json({ success: true, message: 'OTP has been sent to your email' });
		}

		return HttpResponse.json({ success: true, message: 'Password has been reset successfully' });
	}),

	http.get(forgotPasswordPath, async ({ request }) => {
		await delay(400);
		const url = new URL(request.url);
		const otpCode = String(url.searchParams.get('otp_code') || '');
		const username = String(url.searchParams.get('username') || '').trim();
		const state = getForgotPasswordMockState();

		if (!username || !otpCode) {
			return HttpResponse.json({ message: 'OTP and email are required' }, { status: 400 });
		}
		if (state.username && state.username !== username) {
			return HttpResponse.json({ message: 'Invalid email for this OTP session' }, { status: 400 });
		}
		if (otpCode !== MOCK_OTP_CODE && otpCode !== state.otp) {
			return HttpResponse.json({ message: 'Invalid OTP' }, { status: 400 });
		}
		setForgotPasswordMockState({ username, verified: true });
		return HttpResponse.json({ success: true, message: 'OTP verified successfully' });
	}),

	http.patch(forgotPasswordPath, async ({ request }) => {
		await delay(500);
		const body = (await request.json()) as {
			username?: string;
			new_password?: string;
			otp_code?: number | string;
		};
		const username = (body.username || '').trim();
		const newPassword = body.new_password || '';
		const otpCode = String(body.otp_code ?? '');
		const state = getForgotPasswordMockState();

		if (!username || !newPassword) {
			return HttpResponse.json({ message: 'Email and new password are required' }, { status: 400 });
		}
		if (!state.verified && otpCode !== MOCK_OTP_CODE) {
			return HttpResponse.json({ message: 'OTP not verified' }, { status: 400 });
		}
		if (otpCode && otpCode !== MOCK_OTP_CODE && otpCode !== String(state.otp || '')) {
			return HttpResponse.json({ message: 'Invalid OTP' }, { status: 400 });
		}
		resetForgotPasswordMockState();
		return HttpResponse.json({ success: true, message: 'Password has been reset successfully' });
	}),
];

// Login / logout / profile / systems status / Settings (except Roles & API Keys list) use the REAL backend.

export const settingsPreviewHandlers = [
	http.get(rolesPath, async ({ request }) => {
		await delay(250);
		const url = new URL(request.url);
		const search = (url.searchParams.get('search') || '').toLowerCase();
		const offset = Number(url.searchParams.get('offset') || 0);
		const limit = Number(url.searchParams.get('limit') || 5);
		const filtered = search
			? MOCK_ROLES.filter(
					(r) =>
						r.name.toLowerCase().includes(search) ||
						r.description.toLowerCase().includes(search),
				)
			: MOCK_ROLES;
		return HttpResponse.json({
			count: filtered.length,
			results: filtered.slice(offset, offset + limit),
		});
	}),

	http.get(deviceCredentialsPath, async () => {
		await delay(250);
		return HttpResponse.json({ count: 0, results: [] });
	}),
];

export const handlers = [
	...forgotPasswordHandlers,
	...settingsPreviewHandlers,
];
