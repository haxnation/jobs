import { apiCall, API_BASE } from './api.js';

const app = document.getElementById('app');

import { renderSkeleton } from './components/skeleton.js';

function showLoading(path = '') {
    app.innerHTML = renderSkeleton(path);
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
            showLoading(path);
            const { renderHome } = await import('./pages/home.js');
            app.innerHTML = await renderHome();
            return;
        }

        if (path === '/jobs') {
            showLoading(path);
            const { renderJobs, attachJobsEvents } = await import('./pages/jobs.js');
            app.innerHTML = await renderJobs();
            attachJobsEvents();
            return;
        }

        // /jobs/create must be checked BEFORE /jobs/:id
        if (path === '/jobs/create') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderJobCreate, attachJobCreateEvents } = await import('./pages/job-create.js');
            app.innerHTML = await renderJobCreate();
            attachJobCreateEvents();
            return;
        }

        if (path.startsWith('/jobs/')) {
            showLoading(path);
            const jobId = path.split('/jobs/')[1];
            const { renderJobDetails, attachJobDetailsEvents } = await import('./pages/job-details.js');
            app.innerHTML = await renderJobDetails(jobId);
            attachJobDetailsEvents(jobId);
            return;
        }

        if (path === '/dashboard') {
            if (!currentUser) { navigate('/'); return; }
            if (currentUser.onboarded === false) { navigate('/onboarding'); return; }
            showLoading(path);
            const { renderDashboard, attachDashboardEvents } = await import('./pages/dashboard.js');
            app.innerHTML = await renderDashboard();
            attachDashboardEvents();
            return;
        }

        if (path === '/onboarding') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderOnboarding, attachOnboardingEvents } = await import('./pages/onboarding.js');
            app.innerHTML = await renderOnboarding();
            attachOnboardingEvents();
            return;
        }

        if (path === '/my-jobs') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderMyJobs, attachMyJobsEvents } = await import('./pages/my-jobs.js');
            app.innerHTML = await renderMyJobs();
            attachMyJobsEvents();
            return;
        }

        if (path === '/my-applications') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderMyApplications, attachMyApplicationsEvents } = await import('./pages/my-applications.js');
            app.innerHTML = await renderMyApplications();
            attachMyApplicationsEvents();
            return;
        }

        if (path === '/pricing') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderPricing, attachPricingEvents } = await import('./pages/pricing.js');
            app.innerHTML = await renderPricing();
            attachPricingEvents();
            return;
        }

        if (path === '/org-settings') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderOrgSettings, attachOrgSettingsEvents } = await import('./pages/org-settings.js');
            app.innerHTML = await renderOrgSettings();
            attachOrgSettingsEvents();
            return;
        }


        if (path.startsWith('/kanban/')) {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const jobId = path.split('/kanban/')[1];
            const { renderKanban, attachKanbanEvents } = await import('./pages/kanban.js');
            app.innerHTML = await renderKanban(jobId);
            attachKanbanEvents(jobId);
            return;
        }

        if (path === '/cv-builder') {
            if (!currentUser) { navigate('/'); return; }
            showLoading(path);
            const { renderCvBuilder, attachCvBuilderEvents } = await import('./pages/cv-builder.js');
            app.innerHTML = await renderCvBuilder();
            attachCvBuilderEvents();
            return;
        }

        app.innerHTML = `
            <div class="text-center mt-20 border-4 border-ink bg-white p-8 shadow-[8px_8px_0_0_#0b0b0b] max-w-md mx-auto">
                <h2 class="text-2xl font-bold uppercase tracking-tight border-b-2 border-ink pb-2 mb-4 text-danger">⚠ 404 - NOT FOUND</h2>
                <div class="font-mono text-sm mb-6 text-left leading-relaxed">
                    <p>The page you are looking for does not exist. You may have followed a broken link or entered a URL incorrectly (Client Error). Please return to the homepage to continue browsing.</p>
                </div>
                <a href="/" class="nav-link block btn-primary w-full">RETURN TO HOME</a>
            </div>`;

    } catch (error) {
        console.error("Routing error:", error);
        app.innerHTML = `
            <div class="text-center mt-20 border-4 border-ink bg-ink text-danger p-8 shadow-[8px_8px_0_0_#0b0b0b] max-w-md mx-auto">
                <h2 class="text-xl font-bold font-mono uppercase">SYSTEM_ERROR</h2>
                <p class="mt-4 font-mono text-xs text-white">An unexpected error occurred.</p>
            </div>`;
    }
}

export function navigate(url) {
    window.history.pushState({}, '', url);
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
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
    // Show progressive auth loader
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="flex items-center justify-center min-h-[50vh]">
            <div class="flex flex-col items-center justify-center animate-pulse">
                <span class="flex items-center bg-ink border-4 border-ink px-6 py-3 shadow-[8px_8px_0_0_#0b0b0b]">
                    <img src="https://haxnation.org/images/logo_wt.png" alt="HAXNATION" class="h-10 w-auto block object-contain">
                </span>
                <p id="auth-loading-text" class="font-mono text-xs font-bold uppercase tracking-widest mt-8 bg-cyan px-2 border-2 border-ink shadow-[2px_2px_0_0_#0b0b0b]">Starting...</p>
            </div>
        </div>
    `;

    const texts = [
        "Starting...",
        "Loading account...",
        "Connecting to secure server...",
        "Almost there...",
        "Just a moment more..."
    ];
    let idx = 0;
    setInterval(() => {
        const textEl = document.getElementById('auth-loading-text');
        if (textEl) {
            idx = (idx + 1) % texts.length;
            textEl.innerText = texts[idx];
        }
    }, 2000);

    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `${API_BASE}/auth/login?returnTo=${encodeURIComponent(currentPath)}`; 
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await apiCall('/auth/logout', 'POST');
    currentUser = null;
    navigate('/');
    window.location.reload();
});

const mobileMenuBtn = document.getElementById('btn-mobile-menu');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
}

document.addEventListener('DOMContentLoaded', router);
