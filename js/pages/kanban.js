import { apiCall } from '../api.js';

export async function renderKanban(jobId) {
    return `
        <div class="mb-8">
            <h1 class="text-3xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Applicant Pipeline <span class="text-gray-500 text-lg">Job #${jobId}</span>
            </h1>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-4" style="min-height: 60vh;">
            ${['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'].map(status => `
                <div class="flex-shrink-0 w-80 bg-[#fafafa] border-2 border-black shadow-[4px_4px_0_0_#0b0b0b] flex flex-col">
                    <div class="bg-black text-white p-3 font-bold uppercase tracking-widest border-b-2 border-black">
                        ${status}
                    </div>
                    <div class="p-3 flex-1 flex flex-col gap-3">
                        <div class="text-sm font-mono text-gray-500 italic">No candidates</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

export function attachKanbanEvents(jobId) {
    // Pipeline loading logic goes here
}
