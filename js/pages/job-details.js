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

            // Build custom questions markup
            const questionsHtml = buildQuestionsHtml(job.customQuestions);

            content.innerHTML = `
                <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter mb-6 border-b-2 border-black pb-2">${job.title}</h1>
                <div class="flex flex-wrap gap-4 font-mono text-xs font-bold uppercase mb-8 pb-6 border-b-2 border-black">
                    <span class="border-2 border-black bg-[#fafafa] px-3 py-1 shadow-[2px_2px_0_0_#0b0b0b]">${job.companyName || job.locationType || 'Company'}</span>
                    <span class="border-2 border-black bg-[#fafafa] px-3 py-1 shadow-[2px_2px_0_0_#0b0b0b]">${job.location || 'Remote'}</span>
                    ${job.experienceMin ? `<span class="border-2 border-black bg-[#fafafa] px-3 py-1 shadow-[2px_2px_0_0_#0b0b0b]">${job.experienceMin}+ yrs exp</span>` : ''}
                </div>
                <div class="text-black font-sans leading-relaxed mb-8 text-lg">
                    ${job.description || 'No description provided.'}
                </div>
                ${job.skills && job.skills.length ? `
                <div class="mb-8">
                    <h3 class="font-bold uppercase tracking-widest text-sm mb-3 border-b border-black pb-1">Required Skills</h3>
                    <div class="flex flex-wrap gap-2">
                        ${job.skills.map(s => `<span class="border-2 border-black bg-[#5ce1e6] px-2 py-1 font-mono text-[10px] font-bold uppercase">${s}</span>`).join('')}
                    </div>
                </div>` : ''}
                <div class="border-2 border-black bg-[#fafafa] p-6 mt-8 shadow-[4px_4px_0_0_#0b0b0b]">
                    ${job.jobUrl ? `<p class="font-mono text-[10px] text-gray-500 uppercase mb-4">Share: <span class="select-all">${job.jobUrl}</span></p>` : ''}
                    ${questionsHtml}
                    <button id="apply-btn" class="font-mono uppercase tracking-widest font-bold bg-[#5ce1e6] text-black border-2 border-black px-8 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75 ${questionsHtml ? 'mt-6 w-full' : ''}">
                        Apply Now
                    </button>
                    <p id="apply-status" class="mt-3 font-mono text-xs hidden"></p>
                </div>
            `;

            // Wire up the Apply button
            const applyBtn = document.getElementById('apply-btn');
            const applyStatus = document.getElementById('apply-status');
            if (applyBtn) {
                applyBtn.addEventListener('click', async () => {
                    // Collect and validate custom question answers
                    const { customAnswers, error } = collectAnswers(job.customQuestions);
                    if (error) {
                        applyStatus.textContent = error;
                        applyStatus.className = 'mt-3 font-mono text-xs font-bold text-red-600';
                        applyStatus.classList.remove('hidden');
                        return;
                    }

                    applyBtn.disabled = true;
                    applyBtn.innerText = 'SUBMITTING...';

                    const applyRes = await apiCall(`/jobs/${jobId}/apply`, 'POST', { customAnswers });
                    applyStatus.classList.remove('hidden');

                    if (applyRes.success) {
                        applyStatus.textContent = '✓ Application submitted successfully!';
                        applyStatus.className = 'mt-3 font-mono text-xs font-bold text-green-700';
                        applyBtn.innerText = 'APPLIED ✓';
                    } else {
                        applyStatus.textContent = applyRes.error || 'Failed to apply.';
                        applyStatus.className = 'mt-3 font-mono text-xs font-bold text-red-600';
                        applyBtn.disabled = false;
                        applyBtn.innerText = 'Apply Now';
                    }
                });
            }
        } else {
            content.innerHTML = `<p class="font-mono text-red-600">Failed to load job details.</p>`;
        }
    }
    loadJob();
}

// ─── Custom Questions Helpers ─────────────────────────────────────────────────

/**
 * Render HTML for custom questions. Returns an empty string if there are none.
 */
function buildQuestionsHtml(questions) {
    if (!questions?.length) return '';

    const fields = questions.map(q => {
        const requiredMark = q.required ? '<span class="text-red-600 ml-0.5">*</span>' : '';
        const label = `<label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">${q.question}${requiredMark}</label>`;

        let input = '';
        switch (q.type) {
            case 'short_text':
                input = `<input
                    data-question-id="${q.id}"
                    data-question-type="short_text"
                    type="text"
                    class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"
                    placeholder="Your answer…"
                >`;
                break;

            case 'long_text':
                input = `<textarea
                    data-question-id="${q.id}"
                    data-question-type="long_text"
                    rows="4"
                    class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6] resize-y"
                    placeholder="Your answer…"
                ></textarea>`;
                break;

            case 'yes_no':
                input = `<div class="flex gap-6 font-mono text-sm" data-question-id="${q.id}" data-question-type="yes_no">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="q_${q.id}" value="yes" class="accent-black"> Yes
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="q_${q.id}" value="no" class="accent-black"> No
                    </label>
                </div>`;
                break;

            case 'multiple_choice':
                input = `<div class="flex flex-col gap-2 font-mono text-sm" data-question-id="${q.id}" data-question-type="multiple_choice">
                    ${(q.options || []).map(opt => `
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="q_${q.id}" value="${escapeHtml(opt)}" class="accent-black">
                        ${escapeHtml(opt)}
                    </label>`).join('')}
                </div>`;
                break;

            default:
                input = '';
        }

        return `<div class="mb-5">${label}${input}</div>`;
    }).join('');

    return `
        <div id="custom-questions" class="mb-6 border-t-2 border-black pt-6">
            <h3 class="font-mono text-xs font-bold uppercase tracking-widest mb-5">Application Questions</h3>
            ${fields}
        </div>
    `;
}

/**
 * Walk the rendered question fields and collect answers.
 * Returns { customAnswers, error } — error is a string if validation fails.
 */
function collectAnswers(questions) {
    if (!questions?.length) return { customAnswers: [], error: null };

    const customAnswers = [];

    for (const q of questions) {
        let answer = null;

        if (q.type === 'short_text') {
            const el = document.querySelector(`input[data-question-id="${q.id}"]`);
            answer = el?.value?.trim() || null;
        } else if (q.type === 'long_text') {
            const el = document.querySelector(`textarea[data-question-id="${q.id}"]`);
            answer = el?.value?.trim() || null;
        } else if (q.type === 'yes_no' || q.type === 'multiple_choice') {
            const checked = document.querySelector(`input[name="q_${q.id}"]:checked`);
            answer = checked?.value || null;
        }

        if (q.required && !answer) {
            return { customAnswers: null, error: `Please answer: "${q.question}"` };
        }

        if (answer !== null) {
            customAnswers.push({ questionId: q.id, answer });
        }
    }

    return { customAnswers, error: null };
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}