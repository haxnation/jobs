import { apiCall } from '../api.js';

export async function renderKanban(jobId) {
    return `
        <div class="mb-8">
            <h1 class="text-3xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Applicant Pipeline <span class="text-gray-500 text-lg">Job #${jobId}</span>
            </h1>
        </div>
        <div id="kanban-board" class="flex gap-4 overflow-x-auto pb-4" style="min-height: 60vh;">
            ${['submitted', 'reviewing', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'].map(status => `
                <div class="flex-shrink-0 w-80 bg-[#fafafa] border-2 border-black shadow-[4px_4px_0_0_#0b0b0b] flex flex-col" data-status="${status}">
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
    `;
}

export function attachKanbanEvents(jobId) {
    async function loadApplications() {
        const res = await apiCall(`/jobs/${jobId}/applications`);

        // Clear all placeholders
        document.querySelectorAll('.kanban-placeholder').forEach(el => {
            el.textContent = 'No candidates';
        });

        if (!res.success || !Array.isArray(res.data)) {
            document.querySelectorAll('.kanban-placeholder').forEach(el => {
                el.textContent = 'Failed to load';
            });
            return;
        }

        // Group applications by status
        const grouped = {};
        for (const app of res.data) {
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

            column.innerHTML = apps.map(app => `
                <div class="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#0b0b0b] cursor-grab hover:shadow-[1px_1px_0_0_#0b0b0b] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-75 kanban-card" 
                     draggable="true" data-app-id="${app.applicationId}" data-job-id="${jobId}">
                    <p class="font-mono text-xs font-bold uppercase mb-1">Applicant: ${app.applicantId?.substring(0, 8) || 'Unknown'}...</p>
                    ${app.aiScore ? `<p class="font-mono text-[10px] text-gray-600">AI Score: <span class="font-bold text-black">${app.aiScore}</span></p>` : ''}
                    <p class="font-mono text-[10px] text-gray-400 mt-1">${new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
            `).join('');
        }

        // Update counts for empty columns
        document.querySelectorAll('.kanban-column').forEach(col => {
            const status = col.dataset.status;
            if (!grouped[status]) {
                const countEl = col.closest('[data-status]').querySelector('.kanban-count');
                if (countEl) countEl.textContent = '0';
            }
        });

        // --- Drag and Drop ---
        setupDragAndDrop(jobId);
    }

    function setupDragAndDrop(jobId) {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.kanban-column');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    appId: card.dataset.appId,
                    jobId: card.dataset.jobId
                }));
                card.classList.add('opacity-50');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('opacity-50');
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('bg-[#5ce1e6]/20');
            });
            column.addEventListener('dragleave', () => {
                column.classList.remove('bg-[#5ce1e6]/20');
            });
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('bg-[#5ce1e6]/20');

                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                const newStatus = column.dataset.status;

                const res = await apiCall(`/applications/${data.appId}/status`, 'PATCH', {
                    jobId: data.jobId,
                    status: newStatus
                });

                if (res.success) {
                    // Reload the board to reflect changes
                    loadApplications();
                } else {
                    alert(res.error || 'Failed to update status');
                }
            });
        });
    }

    loadApplications();
}
