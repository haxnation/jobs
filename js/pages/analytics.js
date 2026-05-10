import { apiCall } from '../api.js';

export async function renderAnalytics() {
    return `
        <div class="mb-10">
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">Insights</p>
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Analytics
            </h1>
        </div>
        <div id="analytics-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p class="font-mono text-sm animate-pulse col-span-full">Loading analytics...</p>
        </div>
    `;
}

export function attachAnalyticsEvents() {
    async function load() {
        const container = document.getElementById('analytics-container');
        const res = await apiCall('/analytics/account');

        if (!res.success || !res.data) {
            container.innerHTML = `<p class="font-mono text-sm text-red-600 col-span-full">Failed to load analytics.</p>`;
            return;
        }

        const d = res.data;
        container.innerHTML = `
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Jobs Posted</p>
                <p class="text-5xl font-black">${d.totalJobsPosted}</p>
            </div>
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Active Jobs</p>
                <p class="text-5xl font-black">${d.activeJobs}</p>
            </div>
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Avg Time to Hire</p>
                <p class="text-5xl font-black">${d.avgTimeToHireDays}<span class="text-lg ml-1">days</span></p>
            </div>
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <p class="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">App → Interview Rate</p>
                <p class="text-5xl font-black">${d.conversionRateAppToInterview}<span class="text-lg ml-1">%</span></p>
            </div>
        `;
    }
    load();
}
