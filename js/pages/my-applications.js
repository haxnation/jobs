import { apiCall } from '../api.js';

export async function renderMyApplications() {
    return `
        <div class="mb-10">
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">Applier</p>
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                My Applications
            </h1>
        </div>
        <div id="my-apps-container" class="space-y-4">
            <p class="font-mono text-sm animate-pulse">Loading your applications...</p>
        </div>
    `;
}

export function attachMyApplicationsEvents() {
    async function load() {
        const container = document.getElementById('my-apps-container');
        const res = await apiCall('/applications/mine');

        if (!res.success || !Array.isArray(res.data)) {
            container.innerHTML = `<p class="font-mono text-sm text-red-600">Failed to load applications.</p>`;
            return;
        }

        if (res.data.length === 0) {
            container.innerHTML = `
                <div class="py-16 text-center border-2 border-black bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                    <p class="font-mono text-sm font-bold uppercase tracking-widest mb-4">No Applications Yet</p>
                    <a href="/jobs" class="nav-link inline-block font-mono text-xs font-bold uppercase bg-[#5ce1e6] text-black border-2 border-black px-6 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">Browse Jobs</a>
                </div>`;
            return;
        }

        container.innerHTML = res.data.map(app => {
            const statusColors = {
                submitted: 'bg-blue-200',
                reviewing: 'bg-yellow-200',
                shortlisted: 'bg-green-200',
                interview: 'bg-purple-200',
                offer: 'bg-[#5ce1e6]',
                hired: 'bg-green-400',
                rejected: 'bg-red-200'
            };
            const statusClass = statusColors[app.status] || 'bg-gray-200';
            // Extract jobId from PK (format: JOB#uuid)
            const jobId = app.PK?.replace('JOB#', '') || app.jobId;

            return `
                <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="font-black text-lg uppercase tracking-tighter">Job: ${jobId?.substring(0, 8)}...</h3>
                            <span class="border-2 border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${statusClass}">${app.status}</span>
                        </div>
                        <p class="font-mono text-xs text-gray-500">Applied ${new Date(app.createdAt).toLocaleDateString()}</p>
                        ${app.aiScore ? `<p class="font-mono text-xs mt-1">AI Score: <span class="font-bold">${app.aiScore}</span></p>` : ''}
                    </div>
                    <a href="/jobs/${jobId}" class="nav-link font-mono text-[10px] font-bold uppercase bg-white text-black border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors duration-0">View Job</a>
                </div>
            `;
        }).join('');
    }
    load();
}
