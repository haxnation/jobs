import { apiCall } from '../api.js';

let searchQuery = '';
let pageState = {
    submitted: 1,
    reviewing: 1,
    shortlisted: 1,
    interview: 1,
    offer: 1,
    hired: 1,
    rejected: 1
};
const statuses = ['submitted', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

export async function renderKanban(jobId) {
    // Reset state on load
    searchQuery = '';
    for(const key in pageState) pageState[key] = 1;

    return `
        <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-ink pb-4 gap-4">
            <div>
                <h1 class="text-3xl font-black text-ink uppercase tracking-tighter leading-none">
                    Applicant Pipeline <span class="text-gray-500 text-lg">Job #${jobId}</span>
                </h1>
            </div>
            <div class="w-full sm:w-auto">
                <input type="text" id="kanban-search" placeholder="Search by ID or Name..." class="w-full sm:w-64 border-2 border-ink p-2 font-mono text-sm focus:outline-none focus:border-cyan">
            </div>
        </div>
        <div id="kanban-board" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            ${statuses.map(status => `
                <div class="bg-canvas border-2 border-ink shadow-[4px_4px_0_0_#0b0b0b] flex flex-col" data-status="${status}">
                    <div class="bg-ink text-white p-3 font-bold uppercase tracking-widest border-b-2 border-ink flex justify-between items-center">
                        <span>${status}</span>
                        <span class="kanban-count text-[10px] bg-cyan text-ink px-2 py-0.5 border border-ink">0</span>
                    </div>
                    <div class="p-3 flex-1 flex flex-col gap-3 kanban-column" data-status="${status}">
                        <div class="kanban-placeholder text-sm font-mono text-gray-500 italic">Loading...</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Application Details Modal -->
        <div id="app-modal" class="hidden fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
            <div class="bg-white border-4 border-ink shadow-[8px_8px_0_0_#0b0b0b] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button id="close-modal-btn" class="absolute top-4 right-4 font-black text-2xl hover:text-danger transition-colors">&times;</button>
                <div id="app-modal-content"></div>
            </div>
        </div>
    `;
}

export function attachKanbanEvents(jobId) {
    const searchInput = document.getElementById('kanban-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            // Reset page state on search
            for(const key in pageState) pageState[key] = 1;
            loadAllColumns(jobId);
        });
    }

    async function loadAllColumns(jobId) {
        await Promise.all(statuses.map(s => loadColumn(jobId, s)));
    }

    async function loadColumn(jobId, status) {
        const page = pageState[status] || 1;
        const col = document.querySelector(`.kanban-column[data-status="${status}"]`);
        
        if (col) {
            col.innerHTML = '<div class="kanban-placeholder text-sm font-mono text-gray-500 italic">Loading...</div>';
        }

        const res = await apiCall(`/jobs/${jobId}/applications?status=${status}&page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
        
        if (!res.success) {
            if (col) col.innerHTML = '<div class="kanban-placeholder text-danger italic font-bold">Failed to load</div>';
            return;
        }

        renderColumn(jobId, status, res.data.items || res.data, res.data.pagination);
    }

    function renderColumn(jobId, status, apps, pagination) {
        const col = document.querySelector(`.kanban-column[data-status="${status}"]`);
        if (!col) return;

        const countEl = col.parentElement.querySelector('.kanban-count');
        if (countEl) countEl.textContent = pagination ? pagination.totalItems : apps.length;

        if (!apps || apps.length === 0) {
            col.innerHTML = `<div class="kanban-placeholder text-sm font-mono text-gray-500 italic">No candidates</div>`;
            return;
        }

        let html = apps.map(app => {
            const nameStr = app.applicantName && app.applicantName !== 'Unknown' ? ` - ${app.applicantName}` : '';
            return `
            <div class="bg-white border-2 border-ink p-3 shadow-[2px_2px_0_0_#0b0b0b] flex flex-col gap-2 kanban-card" data-app-id="${app.applicationId}" data-job-id="${jobId}">
                <p class="font-mono text-xs font-bold uppercase">ID: ${app.applicantId?.substring(0, 8)}${nameStr}</p>
                ${app.aiScore ? `<p class="font-mono text-[10px] text-gray-600">AI Score: <span class="font-bold text-ink">${app.aiScore}</span></p>` : ''}
                <p class="font-mono text-[10px] text-gray-400">${new Date(app.createdAt).toLocaleDateString()}</p>
                
                <div class="flex gap-2 mt-2 pt-2 border-t border-dashed border-gray-300">
                    <select class="status-shift font-mono text-[10px] uppercase border-2 border-ink p-1 flex-1 cursor-pointer focus:outline-none" data-app-id="${app.applicationId}" data-current-status="${status}">
                        ${statuses.map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <button class="view-app-btn font-mono text-[10px] uppercase bg-ink text-white border-2 border-ink px-2 py-1 hover:bg-cyan hover:text-ink transition-colors" data-app-id="${app.applicationId}">View</button>
                </div>
            </div>
            `}).join('');

        if (pagination && pagination.totalPages > 1) {
            html += `
            <div class="flex justify-between items-center mt-2 font-mono text-[10px] uppercase border-2 border-ink bg-white p-1">
                <button class="page-btn bg-ink text-white px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan hover:text-ink transition-colors" data-status="${status}" data-page="${pagination.currentPage - 1}" ${pagination.currentPage === 1 ? 'disabled' : ''}>&lt; Prev</button>
                <span class="font-bold tracking-widest px-2">Pg ${pagination.currentPage}/${pagination.totalPages}</span>
                <button class="page-btn bg-ink text-white px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan hover:text-ink transition-colors" data-status="${status}" data-page="${pagination.currentPage + 1}" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}>Next &gt;</button>
            </div>
            `;
        }

        col.innerHTML = html;
        attachColumnEvents(col, jobId);
    }

    function attachColumnEvents(col, jobId) {
        col.querySelectorAll('.status-shift').forEach(select => {
            select.addEventListener('change', async (e) => {
                const appId = e.target.dataset.appId;
                const newStatus = e.target.value;
                const currentStatus = e.target.dataset.currentStatus;
                
                e.target.disabled = true;
                const res = await apiCall(`/applications/${appId}/status`, 'POST', {
                    jobId,
                    status: newStatus
                });
                
                if (res.success) {
                    // Reload both the old column and the new column to reflect state accurately
                    loadColumn(jobId, currentStatus);
                    loadColumn(jobId, newStatus);
                } else {
                    alert(res.error || 'Failed to update status');
                    e.target.value = currentStatus;
                    e.target.disabled = false;
                }
            });
        });

        col.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                const newPage = parseInt(e.currentTarget.dataset.page, 10);
                if (!isNaN(newPage) && newPage > 0) {
                    pageState[status] = newPage;
                    loadColumn(jobId, status);
                }
            });
        });

        col.querySelectorAll('.view-app-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appId = e.target.dataset.appId;
                const modal = document.getElementById('app-modal');
                const content = document.getElementById('app-modal-content');
                
                modal.classList.remove('hidden');
                content.innerHTML = '<p class="font-mono animate-pulse uppercase tracking-widest border-2 border-ink p-4 text-center">Fetching candidate details...</p>';
                
                const res = await apiCall(`/jobs/${jobId}/applications/${appId}`);
                if (res.success) {
                    const app = res.data;
                    const cv = app.cvData || {};
                    const p = cv.personalInfo || {};
                    
                    let customSectionsHtml = '';
                    if (cv.customSections && cv.customSections.length) {
                        customSectionsHtml = cv.customSections.map(sec => {
                            if (!sec.title) return '';
                            return `
                                <div class="mb-6 bg-white border-2 border-ink p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                                    <h3 class="font-bold uppercase tracking-widest text-sm bg-ink text-white inline-block px-3 py-1 mb-3">${sec.title}</h3>
                                    <div class="space-y-4">
                                        ${sec.items.map(item => `
                                            <div class="border-l-4 border-ink pl-3 font-mono text-sm">
                                                <p class="font-bold uppercase text-base">${item.title} ${item.subtitle ? `(${item.subtitle})` : ''}</p>
                                                ${item.date ? `<p class="text-xs text-gray-500 mb-1">${item.date}</p>` : ''}
                                                ${item.description ? `<p class="text-sm whitespace-pre-wrap mt-1">${item.description}</p>` : ''}
                                            </div>`).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('');
                    }

                    content.innerHTML = `
                        <h2 class="text-3xl font-black uppercase border-b-4 border-ink pb-2 mb-6">Candidate Details</h2>
                        
                        <div class="mb-6 bg-canvas border-2 border-ink p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-ink text-white inline-block px-3 py-1 mb-3">Personal Info</h3>
                            <p class="font-mono text-sm mb-1"><strong>Name:</strong> ${p.name || 'N/A'}</p>
                            <p class="font-mono text-sm mb-1"><strong>Email:</strong> ${p.email || 'N/A'}</p>
                            <p class="font-mono text-sm mb-1"><strong>Phone:</strong> ${p.phone || 'N/A'}</p>
                            <p class="font-mono text-sm mb-1"><strong>Location:</strong> ${p.location || 'N/A'}</p>
                            ${p.linkedin ? `<p class="font-mono text-sm mb-1"><strong>LinkedIn:</strong> <a href="${p.linkedin}" target="_blank" class="text-blue-600 hover:underline">${p.linkedin}</a></p>` : ''}
                            ${p.website ? `<p class="font-mono text-sm mb-1"><strong>Website:</strong> <a href="${p.website}" target="_blank" class="text-blue-600 hover:underline">${p.website}</a></p>` : ''}
                            ${p.summary ? `<p class="font-mono text-sm mt-2 whitespace-pre-wrap">${p.summary}</p>` : ''}
                            ${app.aiScore ? `<p class="font-mono text-sm mt-2 text-cyan bg-ink inline-block px-2 py-1"><strong>AI Score:</strong> ${app.aiScore}</p>` : ''}
                        </div>

                        ${app.customAnswers && app.customAnswers.length ? `
                        <div class="mb-6 bg-white border-2 border-ink p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-ink text-white inline-block px-3 py-1 mb-3">Q&A</h3>
                            <ul class="space-y-3 font-mono text-sm">
                                ${app.customAnswers.map(ans => `
                                    <li class="border-l-4 border-cyan pl-3">
                                        <div class="font-bold mb-1">Q: ${ans.questionId}</div>
                                        <div class="text-gray-700 whitespace-pre-wrap">A: ${ans.answer}</div>
                                    </li>`).join('')}
                            </ul>
                        </div>` : ''}

                        ${cv.skills && cv.skills.length ? `
                        <div class="mb-6 bg-white border-2 border-ink p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-ink text-white inline-block px-3 py-1 mb-3">Skills</h3>
                            <div class="flex flex-wrap gap-2">
                                ${cv.skills.map(s => `<span class="bg-gray-200 text-ink border border-ink font-mono text-xs px-2 py-1">${s}</span>`).join('')}
                            </div>
                        </div>` : ''}

                        ${cv.experience && cv.experience.length ? `
                        <div class="mb-6 bg-white border-2 border-ink p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-ink text-white inline-block px-3 py-1 mb-3">Experience</h3>
                            <div class="space-y-4">
                                ${cv.experience.map(e => `
                                    <div class="border-l-4 border-ink pl-3 font-mono text-sm">
                                        <p class="font-bold uppercase text-base">${e.title} at ${e.company}</p>
                                        <p class="text-xs text-gray-500 mb-1">${e.startDate} - ${e.endDate}</p>
                                        ${e.description ? `<p class="text-sm whitespace-pre-wrap mt-1">${e.description}</p>` : ''}
                                    </div>`).join('')}
                            </div>
                        </div>` : ''}

                        ${cv.education && cv.education.length ? `
                        <div class="mb-6 bg-white border-2 border-ink p-4 shadow-[4px_4px_0_0_#0b0b0b]">
                            <h3 class="font-bold uppercase tracking-widest text-sm bg-ink text-white inline-block px-3 py-1 mb-3">Education</h3>
                            <div class="space-y-4">
                                ${cv.education.map(e => `
                                    <div class="border-l-4 border-ink pl-3 font-mono text-sm">
                                        <p class="font-bold uppercase text-base">${e.degree} in ${e.field}</p>
                                        <p class="text-sm">${e.school}</p>
                                        <p class="text-xs text-gray-500 mb-1">${e.startDate} - ${e.endDate}</p>
                                        ${e.description ? `<p class="text-sm whitespace-pre-wrap mt-1">${e.description}</p>` : ''}
                                    </div>`).join('')}
                            </div>
                        </div>` : ''}

                        ${customSectionsHtml}
                    `;
                } else {
                    content.innerHTML = `<p class="font-mono font-bold text-danger uppercase border-2 border-danger p-4 text-center">Failed to load details: ${res.error}</p>`;
                }
            });
        });
    }

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        document.getElementById('app-modal')?.classList.add('hidden');
    });

    document.getElementById('app-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'app-modal') {
            e.target.classList.add('hidden');
        }
    });

    // Start fetching
    loadAllColumns(jobId);
}
