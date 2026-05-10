import { apiCall } from '../api.js';

export async function renderJobDetails(jobId) {
    return `
        <div class="bg-white border-4 border-black shadow-[12px_12px_0_0_#5ce1e6] p-0 max-w-4xl mx-auto mt-6 relative">
            <div class="bg-black text-white p-4 font-mono font-bold flex justify-between items-center border-b-4 border-black">
                <span class="uppercase tracking-widest">JOB DETAILS</span>
                <a href="/jobs" class="nav-link text-white hover:bg-[#5ce1e6] hover:text-black px-2 py-1 transition-colors duration-0 border border-transparent hover:border-black uppercase">
                    [X] Close
                </a>
            </div>
            <div class="p-6 sm:p-10" id="job-details-content">
                <p class="font-mono animate-pulse">Loading...</p>
            </div>
        </div>
    `;
}

export function attachJobDetailsEvents(jobId) {
    async function loadJob() {
        const content = document.getElementById('job-details-content');
        const res = await apiCall(`/jobs/${jobId}`);
        if (res.success && res.data) {
            const job = res.data;
            content.innerHTML = `
                <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter mb-6 border-b-2 border-black pb-2">${job.title}</h1>
                <div class="flex flex-wrap gap-4 font-mono text-xs font-bold uppercase mb-8 pb-6 border-b-2 border-black">
                    <span class="border-2 border-black bg-[#fafafa] px-3 py-1 shadow-[2px_2px_0_0_#0b0b0b]">${job.companyName || 'Company'}</span>
                    <span class="border-2 border-black bg-[#fafafa] px-3 py-1 shadow-[2px_2px_0_0_#0b0b0b]">${job.location || 'Remote'}</span>
                </div>
                <div class="text-black font-sans leading-relaxed mb-8 text-lg">
                    ${job.description || 'No description provided.'}
                </div>
                <div class="border-2 border-black bg-[#fafafa] p-6 mt-8 shadow-[4px_4px_0_0_#0b0b0b]">
                    <button class="font-mono uppercase tracking-widest font-bold bg-[#5ce1e6] text-black border-2 border-black px-8 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75">
                        Apply Now
                    </button>
                </div>
            `;
        } else {
            content.innerHTML = `<p class="font-mono text-red-600">Failed to load job details.</p>`;
        }
    }
    loadJob();
}
