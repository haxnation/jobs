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
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }
        if (!res.ok) throw new Error((data && data.error) || 'Request failed');
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
