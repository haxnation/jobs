import { apiCall } from '../api.js';

export async function renderJobs() {
    return `
        <div class="mb-10">
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Job Openings
            </h1>
        </div>
        
        <div id="jobs-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="col-span-full py-16 text-center border-2 border-black bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                <p class="font-mono text-sm font-bold uppercase tracking-widest text-black animate-pulse">Loading Jobs...</p>
            </div>
        </div>
    `;
}

export function attachJobsEvents() {
    async function loadJobs() {
        const container = document.getElementById('jobs-container');
        const res = await apiCall('/jobs');
        
        if (res.success && res.data.jobs) {
            if (res.data.jobs.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-16 text-center border-2 border-black bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                        <p class="font-mono text-sm font-bold uppercase tracking-widest text-black">No Openings Available</p>
                    </div>`;
                return;
            }

            container.innerHTML = res.data.jobs.map(job => `
                <a href="/jobs/${job.id}" class="nav-link bg-white border-2 border-black p-6 rounded-none shadow-[6px_6px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-all duration-75 flex flex-col cursor-pointer group">
                    <div class="flex justify-between items-start mb-4 border-b-2 border-black group-hover:border-white pb-2 gap-2">
                        <h3 class="font-black text-2xl uppercase tracking-tighter">${job.title}</h3>
                        <span class="border-2 border-black px-2 py-1 font-mono text-[10px] whitespace-nowrap font-bold uppercase shadow-[2px_2px_0_0_#0b0b0b] bg-[#5ce1e6] text-black group-hover:shadow-[2px_2px_0_0_#5ce1e6] group-hover:border-white">
                            ${job.location || 'Remote'}
                        </span>
                    </div>
                    <p class="font-sans text-sm flex-1 mb-4">${job.companyName || 'Hiring Company'}</p>
                    <div class="font-mono text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-gray-300">
                        View Details →
                    </div>
                </a>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="col-span-full py-16 text-center border-2 border-black bg-white shadow-[4px_4px_0_0_#0b0b0b]">
                    <p class="font-mono text-sm font-bold uppercase tracking-widest text-white bg-[#ff2a2a] inline-block px-4 py-2 border-2 border-black">Failed to load jobs</p>
                </div>`;
        }
    }
    loadJobs();
}
