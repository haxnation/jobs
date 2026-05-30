import { apiCall } from '../api.js';

export async function renderMyJobs() {
    return `
        <div class="mb-10">
            <div class="flex justify-between items-end border-b-4 border-ink pb-4">
                <div>
                    <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-ink inline-block px-2 border-2 border-ink">Manager</p>
                    <h1 class="text-4xl sm:text-5xl font-black text-ink uppercase tracking-tighter leading-none">My Jobs</h1>
                </div>
                <a href="/jobs/create" class="nav-link font-mono text-xs font-bold uppercase tracking-widest bg-cyan text-ink border-2 border-ink px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-ink hover:text-white transition-colors duration-0">+ New Job</a>
            </div>
        </div>
        <div id="my-jobs-container" class="space-y-4">
            <p class="font-mono text-sm animate-pulse">Loading your jobs...</p>
        </div>
    `;
}

export function attachMyJobsEvents() {
    async function load() {
        const container = document.getElementById('my-jobs-container');
        const res = await apiCall('/jobs/mine');

        if (!res.success || !Array.isArray(res.data)) {
            container.innerHTML = `<p class="font-mono text-sm text-red-600">Failed to load jobs.</p>`;
            return;
        }

        if (res.data.length === 0) {
            container.innerHTML = `
                <div class="py-16 text-center border-2 border-ink bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                    <div class="mb-4 text-4xl">📄</div>
                    <h3 class="font-bold text-xl uppercase tracking-tighter mb-2">No Jobs Posted Yet</h3>
                    <p class="font-mono text-sm mb-6 max-w-md mx-auto text-gray-600">Your jobs list is currently empty. The system is working correctly; you just haven't created any job openings yet.</p>
                    <a href="/jobs/create" class="nav-link inline-block btn-primary">Create Your First Job</a>
                </div>`;
            return;
        }

        container.innerHTML = res.data.map(job => `
            <div class="bg-white border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] flex flex-col sm:flex-row justify-between items-start gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-black text-xl uppercase tracking-tighter">${job.title}</h3>
                        <span class="border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-green-200' : job.status === 'closed' ? 'bg-gray-200' : 'bg-yellow-200'}">${job.status}</span>
                        <span class="border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${job.visibility === 'listed' ? 'bg-cyan' : 'bg-white'}">${job.visibility}</span>
                    </div>
                    <p class="font-mono text-xs text-gray-500">${job.location || 'Remote'} · ${job.applicationCount || 0} applications · Created ${new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="flex gap-2">
                    <a href="/kanban/${job.jobId}" class="nav-link font-mono text-[10px] font-bold uppercase bg-ink text-white border-2 border-ink px-3 py-1.5 hover:bg-cyan hover:text-ink transition-colors duration-0">Pipeline</a>
                    <a href="/jobs/${job.jobId}" class="nav-link font-mono text-[10px] font-bold uppercase bg-white text-ink border-2 border-ink px-3 py-1.5 hover:bg-ink hover:text-white transition-colors duration-0">View</a>
                </div>
            </div>
        `).join('');
    }
    load();
}