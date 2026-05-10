export const API_BASE = 'https://api.haxnation.org/jobs'; 

export async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' 
    };

    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        let data = null;
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            data = await res.json();
        } else if (!res.ok) {
            // Non-JSON error response (e.g., HTML error page from CloudFront)
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }

        if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
