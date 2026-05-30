export const API_BASE = 'https://api.haxnation.org/jobs';

export async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    };

    if (body !== null) {
        // Guard: if the caller accidentally passes an already-stringified body,
        // don't double-serialize it — use it as-is.
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let res;
    try {
        res = await fetch(`${API_BASE}${endpoint}`, options);
        let data = null;
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            data = await res.json();
        } else if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }

        if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
        return { success: true, data };
    } catch (err) {
        // Enforce 3-part rule: What, Why, Next Step
        const rawMessage = err.message || 'Unknown error';
        
        let what = 'The action could not be completed.';
        let why = 'We encountered an unexpected issue on our end.';
        let nextStepLabel = 'Go to Dashboard';
        let nextStepAction = '/dashboard';
        let isSystemFault = true;

        if (res && res.status >= 400 && res.status < 500) {
            isSystemFault = false;
            why = 'There was an issue with the information provided or your request.';
            nextStepLabel = 'Check Information';
            nextStepAction = null; // Fix inline
            if (res.status === 401) {
                what = 'Authentication failed.';
                why = 'Your session expired or you are not logged in.';
                nextStepLabel = 'Login';
                nextStepAction = () => { window.location.href = `${API_BASE}/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`; };
            } else if (res.status === 403) {
                what = 'Permission denied.';
                why = 'You do not have access to perform this action.';
            } else if (res.status === 404) {
                what = 'Resource not found.';
                why = 'The item you are looking for does not exist or was removed.';
            }
        }

        // Add original error message if it's safe (could just be used for dev, but we won't show raw errors per UX rules)
        
        return { 
            success: false, 
            error: {
                what,
                why,
                nextStepLabel,
                nextStepAction,
                isSystemFault,
                rawMessage
            }
        };
    }
}
