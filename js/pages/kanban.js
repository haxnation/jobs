import { apiCall } from '../api.js';

export async function renderKanban(jobId) {
    return `
        <div class="mb-8">
            <h1 class="text-3xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Applicant Pipeline <span class="text-gray-500 text-lg">Job #${jobId}</span>
            </h1>
        </div>
        <div id="kanban-board" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            ${['submitted', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'].map(status => `
                <div class="bg-[#fafafa] border-2 border-black shadow-[4px_4px_0_0_#0b0b0b] flex flex-col" data-status="${status}">
                    <div class="bg-black text-white p-3 font-bold uppercase tracking-widest border-b-2 border-black flex justify-between items-center">
                        <span>${status}</span>
                        <span class="kanban-count text-[10px] bg-[#5ce1e6] text-black px-2 py-0.5 border border-black">0</span>
                    </div>
                    <div class="p-3 flex-1 flex flex-col gap-3 kanban-column" data-status="${status}">
                        <div class="kanban-placeholder text-sm font-mono text-gray-500 italic">Loading...</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Application Details Modal -->
        <div id="app-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#0b0b0b] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button id="close-modal-btn" class="absolute top-4 right-4 font-black text-2xl hover:text-[#ff2a2a] transition-colors">&times;</button>
                <div id="app-modal-content"></div>
            </div>
        </div>
    `;
}

export function attachKanbanEvents(jobId) {
    async function loadApplications() {
        const res = await apiCall(`/jobs/${jobId}/applications`);

        // Clear all placeholders
        document.querySelectorAll('.kanban-placeholder').forEach(el => {
            el.textContent = 'No candidates';
        });

        let applications = [];
        if (!res.success || (!Array.isArray(res.data) && (!res.data || !Array.isArray(res.data.items)))) {
            document.querySelectorAll('.kanban-placeholder').forEach(el => {
                el.textContent = 'Failed to load';
            });
            return;
        }

        applications = Array.isArray(res.data) ? res.data : res.data.items;

        // Group applications by status
        const grouped = {};
        for (const app of applications) {
            const status = (app.status || 'submitted').toLowerCase();
            if (!grouped[status]) grouped[status] = [];
            grouped[status].push(app);
        }

        // Render cards into columns
        for (const [status, apps] of Object.entries(grouped)) {
            const column = document.querySelector(`.kanban-column[data-status="${status}"]`);
            if (!column) continue;

            const countEl = column.closest('[data-status]').querySelector('.kanban-count');
            if (countEl) countEl.textContent = apps.length;

            column.innerHTML = apps.map(app => {
                const nameStr = app.applicantName && app.applicantName !== 'Unknown' ? ` - ${app.applicantName}` : '';
                return `
                <div class="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#0b0b0b] flex flex-col gap-2 kanban-card" data-app-id="${app.applicationId}" data-job-id="${jobId}">
                    <p class="font-mono text-xs font-bold uppercase">ID: ${app.applicantId?.substring(0, 8)}${nameStr}</p>
                    ${app.aiScore ? `<p class="font-mono text-[10px] text-gray-600">AI Score: <span class="font-bold text-black">${app.aiScore}</span></p>` : ''}
                    <p class="font-mono text-[10px] text-gray-400">${new Date(app.createdAt).toLocaleDateString()}</p>
                    
                    <div class="flex gap-2 mt-2 pt-2 border-t border-dashed border-gray-300">
                        <select class="status-shift font-mono text-[10px] uppercase border-2 border-black p-1 flex-1 cursor-pointer focus:outline-none" data-app-id="${app.applicationId}">
                            ${['submitted', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'].map(s => 
                                `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`
                            ).join('')}
                        </select>
                        <button class="view-app-btn font-mono text-[10px] uppercase bg-black text-white border-2 border-black px-2 py-1 hover:bg-[#5ce1e6] hover:text-black transition-colors" data-app-id="${app.applicationId}">View</button>
                    </div>
                </div>
            `}).join('');
        }

        // Update counts for empty columns
        document.querySelectorAll('.kanban-column').forEach(col => {
            const status = col.dataset.status;
            if (!grouped[status]) {
                const countEl = col.closest('[data-status]').querySelector('.kanban-count');
                if (countEl) countEl.textContent = '0';
            }
        });

        attachCardEvents();
    }

    function attachCardEvents() {
        document.querySelectorAll('.status-shift').forEach(select => {
            select.addEventListener('change', async (e) => {
                const appId = e.target.dataset.appId;
                const newStatus = e.target.value;
                e.target.disabled = true;
                const res = await apiCall(`/applications/${appId}/status`, 'PATCH', {
                    jobId,
                    status: newStatus
                });
                if (res.success) {
                    loadApplications();
                } else {
                    alert(res.error || 'Failed to update status');
                    e.target.disabled = false;
                }
            });
        });

        document.querySelectorAll('.view-app-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appId = e.target.dataset.appId;
                const modal = document.getElementById('app-modal');
                const content = document.getElementById('app-modal-content');
                
                modal.classList.remove('hidden');
                content.innerHTML = '<p class="font-mono animate-pulse uppercase tracking-widest">Fetching candidate details...</p>';
                
                const res = await apiCall(`/jobs/${jobId}/applications/${appId}`);
                if (res.success) {
                    const app = res.data;
                    const cv = app.cvData || {};
                    const p = cv.personalInfo || {};
                    
                    content.innerHTML = `
                        <h2 class="text-3xl font-black uppercase border-b-4 border-black pb-2 mb-6">Candidate Details</h2>
                        
                        <div class="mb-6 bg-[#fafafa] border-2 border-black p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-black text-white inline-block px-3 py-1 mb-3">Personal Info</h3>
                            <p class="font-mono text-sm mb-1"><strong>Name:</strong> ${p.name || 'N/A'}</p>
                            <p class="font-mono text-sm mb-1"><strong>Email:</strong> ${p.email || 'N/A'}</p>
                            <p class="font-mono text-sm mb-1"><strong>Phone:</strong> ${p.phone || 'N/A'}</p>
                            <p class="font-mono text-sm mb-1"><strong>Location:</strong> ${p.location || 'N/A'}</p>
                            ${app.aiScore ? `<p class="font-mono text-sm mt-2 text-[#5ce1e6] bg-black inline-block px-2 py-1"><strong>AI Score:</strong> ${app.aiScore}</p>` : ''}
                        </div>

                        ${app.customAnswers && app.customAnswers.length ? `
                        <div class="mb-6 bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-black text-white inline-block px-3 py-1 mb-3">Q&A</h3>
                            <ul class="space-y-3 font-mono text-sm">
                                ${app.customAnswers.map(ans => `
                                    <li class="border-l-4 border-[#5ce1e6] pl-3">
                                        <div class="font-bold mb-1">Q: ${ans.questionId}</div>
                                        <div class="text-gray-700">A: ${ans.answer}</div>
                                    </li>`).join('')}
                            </ul>
                        </div>` : ''}

                        ${cv.experience && cv.experience.length ? `
                        <div class="mb-6 bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-black text-white inline-block px-3 py-1 mb-3">Experience</h3>
                            <div class="space-y-4">
                                ${cv.experience.map(e => `
                                    <div class="border-l-4 border-black pl-3 font-mono text-sm">
                                        <p class="font-bold uppercase text-base">${e.title} at ${e.company}</p>
                                        <p class="text-xs text-gray-500 mb-1">${e.startDate} - ${e.endDate}</p>
                                        ${e.description ? `<p class="text-sm whitespace-pre-wrap">${e.description}</p>` : ''}
                                    </div>`).join('')}
                            </div>
                        </div>` : ''}

                        ${cv.education && cv.education.length ? `
                        <div class="mb-6 bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-black text-white inline-block px-3 py-1 mb-3">Education</h3>
                            <div class="space-y-4">
                                ${cv.education.map(e => `
                                    <div class="border-l-4 border-black pl-3 font-mono text-sm">
                                        <p class="font-bold uppercase text-base">${e.degree} in ${e.field}</p>
                                        <p class="text-sm">${e.school}</p>
                                        <p class="text-xs text-gray-500">${e.startDate} - ${e.endDate}</p>
                                    </div>`).join('')}
                            </div>
                        </div>` : ''}
                    `;
                } else {
                    content.innerHTML = `<p class="font-mono font-bold text-[#ff2a2a] uppercase border-2 border-[#ff2a2a] p-4 text-center">Failed to load details: ${res.error}</p>`;
                }
            });
        });
    }

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        document.getElementById('app-modal')?.classList.add('hidden');
    });

    // Close modal on click outside
    document.getElementById('app-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'app-modal') {
            e.target.classList.add('hidden');
        }
    });

    loadApplications();
}
