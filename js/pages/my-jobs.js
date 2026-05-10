import { apiCall } from '../api.js';

export async function renderMyJobs() {
    return `
        <div class="mb-10">
            <div class="flex justify-between items-end border-b-4 border-black pb-4">
                <div>
                    <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">Manager</p>
                    <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none">My Jobs</h1>
                </div>
                <a href="/jobs/create" class="nav-link font-mono text-xs font-bold uppercase tracking-widest bg-[#5ce1e6] text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">+ New Job</a>
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
                <div class="py-16 text-center border-2 border-black bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                    <p class="font-mono text-sm font-bold uppercase tracking-widest mb-4">No Jobs Posted Yet</p>
                    <a href="/jobs/create" class="nav-link inline-block font-mono text-xs font-bold uppercase bg-[#5ce1e6] text-black border-2 border-black px-6 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">Create Your First Job</a>
                </div>`;
            return;
        }

        container.innerHTML = res.data.map(job => `
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] flex flex-col sm:flex-row justify-between items-start gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-black text-xl uppercase tracking-tighter">${job.title}</h3>
                        <span class="border-2 border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${job.status === 'active' ? 'bg-green-200' : job.status === 'closed' ? 'bg-gray-200' : 'bg-yellow-200'}">${job.status}</span>
                        <span class="border-2 border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${job.visibility === 'listed' ? 'bg-[#5ce1e6]' : 'bg-white'}">${job.visibility}</span>
                    </div>
                    <p class="font-mono text-xs text-gray-500">${job.location || 'Remote'} · ${job.applicationCount || 0} applications · Created ${new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="flex gap-2">
                    <a href="/kanban/${job.jobId}" class="nav-link font-mono text-[10px] font-bold uppercase bg-black text-white border-2 border-black px-3 py-1.5 hover:bg-[#5ce1e6] hover:text-black transition-colors duration-0">Pipeline</a>
                    <a href="/jobs/${job.jobId}" class="nav-link font-mono text-[10px] font-bold uppercase bg-white text-black border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors duration-0">View</a>
                </div>
            </div>
        `).join('');
    }
    load();
}
