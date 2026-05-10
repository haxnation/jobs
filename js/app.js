import { apiCall, API_BASE } from './api.js';

const app = document.getElementById('app');

function showLoading() {
    app.innerHTML = `
        <div class="flex items-center justify-center min-h-[50vh]">
            <div class="w-12 h-12 bg-black border-4 border-[#5ce1e6] shadow-[4px_4px_0_0_#5ce1e6] animate-[spin_1s_steps(4)_infinite]"></div>
        </div>`;
}

export let currentUser = null;

async function checkAuth() {
    const res = await apiCall('/users/me');
    if (res.success && res.data) {
        currentUser = res.data;
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('user-name').innerText = currentUser.name || 'User';
        document.getElementById('user-avatar-initials').innerText = (currentUser.name || 'U').charAt(0).toUpperCase();
    } else {
        currentUser = null;
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
    }
}

async function router() {
    const path = window.location.pathname;
    
    try {
        await checkAuth();

        if (path === '/') {
            showLoading();
            const { renderHome } = await import('./pages/home.js');
            app.innerHTML = await renderHome();
            return;
        }

        if (path === '/jobs') {
            showLoading();
            const { renderJobs, attachJobsEvents } = await import('./pages/jobs.js');
            app.innerHTML = await renderJobs();
            attachJobsEvents();
            return;
        }

        // /jobs/create must be checked BEFORE /jobs/:id
        if (path === '/jobs/create') {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const { renderJobCreate, attachJobCreateEvents } = await import('./pages/job-create.js');
            app.innerHTML = await renderJobCreate();
            attachJobCreateEvents();
            return;
        }

        if (path.startsWith('/jobs/')) {
            showLoading();
            const jobId = path.split('/jobs/')[1];
            const { renderJobDetails, attachJobDetailsEvents } = await import('./pages/job-details.js');
            app.innerHTML = await renderJobDetails(jobId);
            attachJobDetailsEvents(jobId);
            return;
        }

        if (path === '/dashboard') {
            if (!currentUser) { navigate('/'); return; }
            if (currentUser.onboarded === false) { navigate('/onboarding'); return; }
            showLoading();
            const { renderDashboard, attachDashboardEvents } = await import('./pages/dashboard.js');
            app.innerHTML = await renderDashboard();
            attachDashboardEvents();
            return;
        }

        if (path === '/onboarding') {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const { renderOnboarding, attachOnboardingEvents } = await import('./pages/onboarding.js');
            app.innerHTML = await renderOnboarding();
            attachOnboardingEvents();
            return;
        }

        if (path === '/my-jobs') {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const { renderMyJobs, attachMyJobsEvents } = await import('./pages/my-jobs.js');
            app.innerHTML = await renderMyJobs();
            attachMyJobsEvents();
            return;
        }

        if (path === '/my-applications') {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const { renderMyApplications, attachMyApplicationsEvents } = await import('./pages/my-applications.js');
            app.innerHTML = await renderMyApplications();
            attachMyApplicationsEvents();
            return;
        }

        if (path === '/pricing') {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const { renderPricing, attachPricingEvents } = await import('./pages/pricing.js');
            app.innerHTML = await renderPricing();
            attachPricingEvents();
            return;
        }

        if (path === '/analytics') {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const { renderAnalytics, attachAnalyticsEvents } = await import('./pages/analytics.js');
            app.innerHTML = await renderAnalytics();
            attachAnalyticsEvents();
            return;
        }

        if (path.startsWith('/kanban/')) {
            if (!currentUser) { navigate('/'); return; }
            showLoading();
            const jobId = path.split('/kanban/')[1];
            const { renderKanban, attachKanbanEvents } = await import('./pages/kanban.js');
            app.innerHTML = await renderKanban(jobId);
            attachKanbanEvents(jobId);
            return;
        }

        app.innerHTML = `
            <div class="text-center mt-20 border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#ff2a2a] max-w-md mx-auto">
                <h2 class="text-2xl font-bold uppercase tracking-tight border-b-2 border-black pb-2 mb-6">404 - NOT FOUND<span class="inline-block w-3 h-[1em] bg-[#ff2a2a] animate-pulse align-middle ml-1"></span></h2>
                <a href="/" class="nav-link block font-mono uppercase tracking-widest font-bold bg-[#5ce1e6] text-black border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75">RETURN TO HOME</a>
            </div>`;

    } catch (error) {
        console.error("Routing error:", error);
        app.innerHTML = `
            <div class="text-center mt-20 border-4 border-black bg-black text-[#ff2a2a] p-8 shadow-[8px_8px_0_0_#ff2a2a] max-w-md mx-auto">
                <h2 class="text-xl font-bold font-mono uppercase">SYSTEM_ERROR</h2>
                <p class="mt-4 font-mono text-xs text-white">An unexpected error occurred.</p>
            </div>`;
    }
}

export function navigate(url) {
    window.history.pushState({}, '', url);
    router();
}

window.addEventListener('popstate', router);

document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.classList.contains('nav-link')) {
        e.preventDefault();
        navigate(link.getAttribute('href'));
    }
});

document.getElementById('login-btn').addEventListener('click', () => {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `${API_BASE}/auth/login?returnTo=${encodeURIComponent(currentPath)}`; 
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await apiCall('/auth/logout', 'POST');
    currentUser = null;
    navigate('/');
    window.location.reload();
});

document.addEventListener('DOMContentLoaded', router);
