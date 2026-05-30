import { apiCall } from '../api.js';
import { showModal } from '../components/notifications.js';

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
let pipelineCounts = { total: 0 };
const statuses = ['submitted', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

function updatePipelineSummary() {
    const summaryEl = document.getElementById('pipeline-summary');
    if (!summaryEl) return;
    
    let total = 0;
    const items = statuses.map(s => {
        const c = pipelineCounts[s] || 0;
        total += c;
        return `<div class="flex flex-col items-center p-2 min-w-[80px]">
            <span class="font-bold text-xl uppercase tracking-tighter">${c}</span>
            <span class="font-mono text-[9px] uppercase tracking-widest text-gray-600">${s}</span>
        </div>`;
    });
    
    summaryEl.innerHTML = `
        <div class="flex flex-col items-center p-2 min-w-[90px] border-r-2 border-ink mr-2 pr-4 bg-cyan">
            <span class="font-black text-2xl uppercase tracking-tighter">${total}</span>
            <span class="font-mono text-[9px] uppercase tracking-widest text-ink font-bold">Total Applicants</span>
        </div>
        ${items.join('')}
    `;
}

export async function renderKanban(jobId) {
    // Reset state on load
    searchQuery = '';
    for(const key in pageState) pageState[key] = 1;

    return `
        <div class="mb-4">
            <a href="#" onclick="event.preventDefault(); window.history.length > 2 ? window.history.back() : window.location.href='/dashboard'" class="font-mono text-xs font-bold uppercase tracking-widest bg-white text-ink border-2 border-ink px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#0b0b0b] transition-all duration-75 inline-block">← Go Back</a>
        </div>
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-ink pb-4 gap-4">
            <div>
                <h1 class="text-3xl font-black text-ink uppercase tracking-tighter leading-none">
                    Applicant Pipeline <span class="text-gray-500 text-lg">Job #${jobId}</span>
                </h1>
            </div>
            <div class="w-full sm:w-auto">
                <input type="text" id="kanban-search" placeholder="Search by ID or Name..." class="w-full sm:w-64 border-2 border-ink p-2 font-mono text-sm focus:outline-none focus:border-cyan">
            </div>
        </div>

        <div class="mb-6 border-2 border-ink shadow-[4px_4px_0_0_#0b0b0b] bg-white flex overflow-x-auto whitespace-nowrap" id="pipeline-summary">
            <!-- Summary populated dynamically -->
        </div>

        <div id="kanban-board" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 items-start">
            ${statuses.map(status => `
                <div class="bg-canvas border-2 border-ink shadow-[4px_4px_0_0_#0b0b0b] flex flex-col" data-status="${status}">
                    <div class="bg-ink text-white p-3 font-bold uppercase tracking-widest border-b-2 border-ink flex justify-between items-center">
                        <span>${status}</span>
                        <span class="kanban-count text-[10px] bg-cyan text-ink px-2 py-0.5 border border-ink">0</span>
                    </div>
                    <div class="p-3 flex-1 flex flex-col gap-3 kanban-column" data-status="${status}">
                        ${Array(3).fill('').map(() => `
                            <div class="bg-white border-2 border-ink p-3 shadow-[2px_2px_0_0_#0b0b0b] flex flex-col gap-2 animate-pulse">
                                <div class="h-6 bg-gray-200 w-3/4"></div>
                                <div class="h-3 bg-gray-200 w-1/2 mt-1"></div>
                                <div class="h-10 bg-gray-200 w-full mt-2"></div>
                            </div>
                        `).join('')}
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
            col.innerHTML = Array(3).fill('').map(() => `
                <div class="bg-white border-2 border-ink p-3 shadow-[2px_2px_0_0_#0b0b0b] flex flex-col gap-2 animate-pulse">
                    <div class="h-6 bg-gray-200 w-3/4"></div>
                    <div class="h-3 bg-gray-200 w-1/2 mt-1"></div>
                    <div class="h-10 bg-gray-200 w-full mt-2"></div>
                </div>
            `).join('');
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
        
        if (pagination) {
            pipelineCounts[status] = pagination.totalItems;
            updatePipelineSummary();
        }

        if (!apps || apps.length === 0) {
            if (searchQuery) {
                col.innerHTML = `<div class="kanban-placeholder text-xs font-mono text-gray-500 italic p-2 border-2 border-dashed border-gray-300">No matches for "${searchQuery}". Try searching by ID instead.</div>`;
            } else {
                col.innerHTML = `<div class="kanban-placeholder text-xs font-mono text-gray-500 italic p-2 border-2 border-dashed border-gray-300">No candidates</div>`;
            }
            return;
        }

        let html = apps.map(app => {
            const sum = app.candidateSummary || {};
            const name = app.applicantName || 'Unknown Candidate';
            const role = sum.role || 'No Role Specified';
            const loc = sum.location || 'Remote/Unknown';
            const exp = sum.experienceLevel || 'Entry Level';
            const skills = (sum.topSkills || []).map(s => `<span class="bg-gray-200 text-ink px-1 border border-ink whitespace-nowrap">${s}</span>`).join(' ');
            
            const ind = sum.indicators || {};
            let indHtml = '';
            if (ind.hasResume) indHtml += `<span class="px-1 border border-ink bg-white font-bold" title="Resume Uploaded">📄</span> `;
            if (ind.hasPortfolio) indHtml += `<span class="px-1 border border-ink bg-white font-bold" title="Portfolio">🔗</span> `;
            if (ind.hasLinkedIn) indHtml += `<span class="px-1 border border-ink bg-white font-bold" title="LinkedIn">in</span> `;
            if (ind.hasAssessment) indHtml += `<span class="px-1 border border-ink bg-white font-bold" title="Assessment">📝</span> `;
            if (app.aiScore) indHtml += `<span class="px-1 border border-ink bg-cyan font-bold" title="AI Match Score">★ ${app.aiScore}</span> `;

            const currentIdx = statuses.indexOf(status);
            
            let quickActionsHtml = '';
            if (status !== 'rejected' && status !== 'hired') {
                const advanceStatus = currentIdx < statuses.length - 2 ? statuses[currentIdx + 1] : null;
                quickActionsHtml = `
                    <div class="flex gap-1 mt-2 pt-2 border-t border-dashed border-gray-300" onclick="event.stopPropagation()">
                        ${advanceStatus ? `<button class="quick-action-btn font-mono text-[9px] uppercase bg-cyan text-ink border border-ink px-2 py-1 font-bold flex-1 hover:bg-ink hover:text-white transition-colors" data-app-id="${app.applicationId}" data-current-status="${status}" data-new-status="${advanceStatus}">Advance to ${advanceStatus}</button>` : ''}
                        <button class="quick-action-btn font-mono text-[9px] uppercase bg-white text-danger border border-danger px-2 py-1 font-bold hover:bg-danger hover:text-white transition-colors" data-app-id="${app.applicationId}" data-current-status="${status}" data-new-status="rejected">Reject</button>
                    </div>
                `;
            }

            return `
            <div class="bg-white border-2 border-ink p-3 shadow-[2px_2px_0_0_#0b0b0b] flex flex-col gap-2 kanban-card group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#0b0b0b] transition-all duration-75 cursor-pointer relative" data-app-id="${app.applicationId}" data-job-id="${jobId}">
                <!-- Explicit View Profile Indicator on Hover -->
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="font-mono text-[9px] uppercase bg-ink text-white px-2 py-1 font-bold pointer-events-none">View Profile ↗</span>
                </div>

                <div>
                    <h3 class="font-black text-lg uppercase tracking-tighter leading-tight pr-20">${name}</h3>
                    <p class="font-mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">${role}</p>
                </div>
                
                <div class="flex flex-col gap-0.5 mt-1">
                    <p class="font-mono text-[10px] uppercase"><span class="font-bold">Loc:</span> ${loc}</p>
                    <p class="font-mono text-[10px] uppercase"><span class="font-bold">Exp:</span> ${exp}</p>
                    <p class="font-mono text-[10px] uppercase text-gray-500">Applied ${new Date(app.createdAt).toLocaleDateString()}</p>
                </div>

                ${skills ? `<div class="font-mono text-[8px] uppercase flex flex-wrap gap-1 mt-1">${skills}</div>` : ''}
                ${indHtml ? `<div class="font-mono text-[10px] flex gap-1 mt-1">${indHtml}</div>` : ''}
                
                ${quickActionsHtml}
                
                <div class="flex gap-2 ${quickActionsHtml ? 'mt-1' : 'mt-2 pt-2 border-t border-dashed border-gray-300'}" onclick="event.stopPropagation()">
                    <select class="status-shift font-mono text-[10px] uppercase border border-ink bg-canvas p-1 flex-1 cursor-pointer focus:outline-none" data-app-id="${app.applicationId}" data-current-status="${status}">
                        <option value="" disabled>Move to...</option>
                        ${statuses.map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
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
        // Shared Status Update Logic with Optimistic UI
        const handleStatusChange = async (appId, currentStatus, newStatus, cardEl, selectEl = null, btnEl = null) => {
            if (currentStatus === newStatus) return;
            
            const sourceCol = document.querySelector(`.kanban-column[data-status="${currentStatus}"]`);
            const targetCol = document.querySelector(`.kanban-column[data-status="${newStatus}"]`);
            
            // Disable inputs during network request
            if (selectEl) selectEl.disabled = true;
            if (btnEl) btnEl.disabled = true;

            // 1. Optimistic UI Update: Move Card & Update Counts
            if (cardEl && targetCol && sourceCol) {
                targetCol.appendChild(cardEl);
                pipelineCounts[currentStatus]--;
                pipelineCounts[newStatus]++;
                updatePipelineSummary();
                
                const srcCount = sourceCol.parentElement.querySelector('.kanban-count');
                const tgtCount = targetCol.parentElement.querySelector('.kanban-count');
                if (srcCount) srcCount.textContent = parseInt(srcCount.textContent) - 1;
                if (tgtCount) tgtCount.textContent = parseInt(tgtCount.textContent) + 1;
            }

            // 2. Perform Network Request
            const res = await apiCall(`/applications/${appId}/status`, 'POST', { jobId, status: newStatus });
            
            // 3. Rollback on Failure
            if (!res.success) {
                if (cardEl && targetCol && sourceCol) {
                    sourceCol.appendChild(cardEl);
                    pipelineCounts[currentStatus]++;
                    pipelineCounts[newStatus]--;
                    updatePipelineSummary();
                    
                    const srcCount = sourceCol.parentElement.querySelector('.kanban-count');
                    const tgtCount = targetCol.parentElement.querySelector('.kanban-count');
                    if (srcCount) srcCount.textContent = parseInt(srcCount.textContent) + 1;
                    if (tgtCount) tgtCount.textContent = parseInt(tgtCount.textContent) - 1;
                }
                showModal({
                    title: 'Update Failed',
                    what: res.error?.what || 'Failed to update candidate status.',
                    why: res.error?.why || 'An unknown error occurred.',
                    nextStepLabel: res.error?.nextStepLabel || 'Dismiss',
                    nextStepAction: res.error?.nextStepAction,
                    isSystemFault: res.error?.isSystemFault
                });
                if (selectEl) {
                    selectEl.value = currentStatus;
                    selectEl.disabled = false;
                }
                if (btnEl) btnEl.disabled = false;
            } else {
                // Trigger a background refresh to correct pagination without blocking the user
                loadColumn(jobId, currentStatus);
                loadColumn(jobId, newStatus);
            }
        };

        col.querySelectorAll('.status-shift').forEach(select => {
            select.addEventListener('change', (e) => {
                const appId = e.target.dataset.appId;
                const newStatus = e.target.value;
                const currentStatus = e.target.dataset.currentStatus;
                const cardEl = e.target.closest('.kanban-card');
                handleStatusChange(appId, currentStatus, newStatus, cardEl, e.target);
            });
        });

        col.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = e.currentTarget.dataset.appId;
                const newStatus = e.currentTarget.dataset.newStatus;
                const currentStatus = e.currentTarget.dataset.currentStatus;
                const cardEl = e.currentTarget.closest('.kanban-card');
                handleStatusChange(appId, currentStatus, newStatus, cardEl, null, e.currentTarget);
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

        col.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                // Prevent opening modal if clicking the select dropdown or buttons
                if (e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'option' || e.target.tagName.toLowerCase() === 'button') return;
                
                const appId = card.dataset.appId;
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
                    content.innerHTML = `
                        <div class="py-12 text-center">
                            <h3 class="font-black text-2xl uppercase tracking-tighter mb-4 text-danger">Details Unavailable</h3>
                            <p class="font-mono text-sm mb-2 text-ink">${res.error?.what || 'Failed to load details.'}</p>
                            ${res.error?.why ? `<p class="font-mono text-sm text-gray-600 mb-6">${res.error.why}</p>` : ''}
                            <button id="modal-dismiss-btn" class="font-mono uppercase tracking-widest font-bold bg-white text-ink border-2 border-ink px-6 py-2 hover:bg-ink hover:text-white transition-colors duration-0 shadow-[4px_4px_0_0_#0b0b0b]">Dismiss</button>
                        </div>
                    `;
                    document.getElementById('modal-dismiss-btn')?.addEventListener('click', () => {
                        document.getElementById('app-modal').classList.add('hidden');
                    });
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
