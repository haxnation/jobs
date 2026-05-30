import { apiCall } from '../api.js';

export async function renderJobs() {
    return `
        <div class="mb-10">
            <h1 class="text-4xl sm:text-5xl font-black text-ink uppercase tracking-tighter leading-none border-b-4 border-ink pb-4">
                Job Openings
            </h1>
        </div>
        
        <div id="jobs-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="col-span-full py-16 text-center border-2 border-ink bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                <p class="font-mono text-sm font-bold uppercase tracking-widest text-ink animate-pulse">Loading Jobs...</p>
            </div>
        </div>
    `;
}

export function attachJobsEvents() {
    async function loadJobs() {
        const container = document.getElementById('jobs-container');
        const res = await apiCall('/jobs');

        // Backend returns { items: [...], nextCursor }
        const jobs = res.data?.items;
        if (res.success && Array.isArray(jobs)) {
            if (jobs.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-16 text-center border-2 border-ink bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                        <div class="mb-4 text-4xl">🔍</div>
                        <h3 class="font-bold text-xl uppercase tracking-tighter mb-2">No Openings Available</h3>
                        <p class="font-mono text-sm mb-6 max-w-md mx-auto text-gray-600">There are no job openings posted at the moment. Everything is working fine, please check back later!</p>
                        <a href="/dashboard" class="nav-link inline-block btn-primary">Go to Dashboard</a>
                    </div>`;
                return;
            }

            container.innerHTML = jobs.map(job => {
                const roleBadge = job.managerRole === 'referring'
                    ? '<span class="border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-[#ffd700] text-ink shadow-[2px_2px_0_0_#0b0b0b] group-hover:shadow-[2px_2px_0_0_#ffd700] group-hover:border-white">🤝 Referral</span>'
                    : '<span class="border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase bg-cyan text-ink shadow-[2px_2px_0_0_#0b0b0b] group-hover:shadow-[2px_2px_0_0_#0b0b0b] group-hover:border-white">🏢 Hiring</span>';

                return `
                <a href="/jobs/${job.jobId}" class="nav-link bg-white border-2 border-ink p-6 rounded-none shadow-[6px_6px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white transition-all duration-75 flex flex-col cursor-pointer group">
                    <div class="flex justify-between items-start mb-3 border-b-2 border-ink group-hover:border-white pb-2 gap-2">
                        <h3 class="font-black text-2xl uppercase tracking-tighter">${job.title}</h3>
                        <span class="border-2 border-ink px-2 py-1 font-mono text-[10px] whitespace-nowrap font-bold uppercase shadow-[2px_2px_0_0_#0b0b0b] bg-cyan text-ink group-hover:shadow-[2px_2px_0_0_#0b0b0b] group-hover:border-white">
                            ${job.location || 'Remote'}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 mb-3">
                        <span class="font-mono text-sm font-bold">${job.clientCompany || 'Company'}</span>
                        ${roleBadge}
                    </div>
                    <div class="font-mono text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-gray-300 mt-auto">
                        View Details →
                    </div>
                </a>`;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="col-span-full py-16 text-center border-2 border-ink bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                    <p class="font-mono text-sm font-bold uppercase tracking-widest text-white bg-danger inline-block px-4 py-2 border-2 border-ink">Failed to load jobs</p>
                </div>`;
        }
    }
    loadJobs();
}