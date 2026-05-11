import { apiCall } from '../api.js';
import { navigate } from '../app.js';

export async function renderJobCreate() {
    return `
        <div class="max-w-2xl mx-auto mt-10">
            <div class="bg-white border-4 border-black shadow-[12px_12px_0_0_#5ce1e6] p-0">
                <div class="bg-black text-white p-4 font-mono font-bold flex justify-between items-center border-b-4 border-black">
                    <span class="uppercase tracking-widest">Post a New Job</span>
                    <a href="/dashboard" class="nav-link text-white hover:bg-[#5ce1e6] hover:text-black px-2 py-1 transition-colors duration-0 border border-transparent hover:border-black uppercase">[X] Cancel</a>
                </div>

                <div class="p-6 sm:p-10">
                    <div class="mb-6">
                        <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">
                            Job Title *
                        </label>
                        <input
                            id="job-title"
                            type="text"
                            placeholder="e.g. Senior Backend Engineer"
                            class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"
                        >
                    </div>

                    <div class="mb-6">
                        <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">
                            Description *
                        </label>
                        <textarea
                            id="job-description"
                            rows="6"
                            placeholder="Describe the role, responsibilities, and requirements..."
                            class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6] resize-y"
                        ></textarea>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">
                                Location *
                            </label>
                            <input
                                id="job-location"
                                type="text"
                                placeholder="e.g. Mumbai, India"
                                class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"
                            >
                        </div>

                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">
                                Location Type
                            </label>

                            <select
                                id="job-location-type"
                                class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6] bg-white"
                            >
                                <option value="remote">Remote</option>
                                <option value="onsite">On-site</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">
                                Min Experience (years)
                            </label>

                            <input
                                id="job-exp-min"
                                type="number"
                                min="0"
                                max="30"
                                placeholder="2"
                                class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"
                            >
                        </div>

                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">
                                Skills (comma separated)
                            </label>

                            <input
                                id="job-skills"
                                type="text"
                                placeholder="Node.js, AWS, React"
                                class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"
                            >
                        </div>
                    </div>

                    <!-- Custom Questions -->
                    <div class="mb-6 border-2 border-black">
                        <div class="bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest flex justify-between items-center">
                            <span>
                                Custom Application Questions
                                <span class="text-[#5ce1e6]">(optional, max 5)</span>
                            </span>

                            <button
                                id="add-question-btn"
                                type="button"
                                class="bg-[#5ce1e6] text-black border border-black px-3 py-0.5 hover:bg-white transition-colors duration-0 font-bold"
                            >
                                + Add
                            </button>
                        </div>

                        <div id="questions-list" class="divide-y-2 divide-black"></div>

                        <p
                            id="questions-limit-msg"
                            class="hidden font-mono text-[10px] text-red-600 font-bold uppercase px-4 py-2"
                        >
                            Maximum 5 questions reached.
                        </p>
                    </div>

                    <button
                        id="create-job-btn"
                        class="w-full font-mono uppercase tracking-widest font-bold bg-[#5ce1e6] text-black border-2 border-black px-8 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75"
                    >
                        Create Job Opening
                    </button>

                    <p id="create-job-status" class="mt-3 font-mono text-xs hidden"></p>

                    <p class="mt-4 font-mono text-[10px] text-gray-500 uppercase">
                        Note: Jobs are created as private. Use the Pricing page to list them on the public board.
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Question types supported by the backend
const QUESTION_TYPES = [
    { value: 'short_text', label: 'Short Text' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'yes_no', label: 'Yes / No' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
];

// In-memory store for questions while the form is open
let questions = [];

function renderQuestionRow(q, index) {
    const typeOptions = QUESTION_TYPES.map(t =>
        `<option value="${t.value}" ${q.type === t.value ? 'selected' : ''}>${t.label}</option>`
    ).join('');

    const showOptions = q.type === 'multiple_choice';

    return `
        <div class="p-4 bg-white" data-question-index="${index}">
            <div class="flex gap-2 mb-2">
                <input
                    type="text"
                    class="question-text flex-1 border-2 border-black px-3 py-1.5 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"
                    placeholder="Question text..."
                    value="${q.question.replace(/"/g, '&quot;')}"
                    maxlength="300"
                >

                <button
                    type="button"
                    class="remove-question-btn font-mono text-xs font-bold uppercase bg-white border-2 border-black px-3 py-1 hover:bg-red-100 transition-colors duration-0"
                    data-index="${index}"
                >
                    ✕
                </button>
            </div>

            <div class="flex flex-wrap gap-3 items-center">
                <select
                    class="question-type border-2 border-black px-2 py-1 font-mono text-xs bg-white focus:outline-none focus:border-[#5ce1e6]"
                    data-index="${index}"
                >
                    ${typeOptions}
                </select>

                <label class="flex items-center gap-1.5 font-mono text-xs font-bold uppercase cursor-pointer select-none">
                    <input
                        type="checkbox"
                        class="question-required w-4 h-4 border-2 border-black accent-black"
                        ${q.required ? 'checked' : ''}
                    >
                    Required
                </label>
            </div>

            ${showOptions ? `
            <div class="mt-2">
                <input
                    type="text"
                    class="question-options w-full border-2 border-black px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-[#5ce1e6]"
                    placeholder="Options (comma separated, max 5)..."
                    value="${(q.options || []).join(', ')}"
                >
            </div>` : ''}
        </div>
    `;
}

function syncQuestionsFromDOM() {
    const rows = document.querySelectorAll('#questions-list [data-question-index]');

    questions = Array.from(rows).map((row, i) => {
        const type = row.querySelector('.question-type')?.value || 'short_text';

        const optionsRaw = row.querySelector('.question-options')?.value || '';

        const options = type === 'multiple_choice'
            ? optionsRaw
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .slice(0, 5)
            : undefined;

        return {
            id: questions[i]?.id || crypto.randomUUID(),
            question: row.querySelector('.question-text')?.value?.trim() || '',
            type,
            required: row.querySelector('.question-required')?.checked || false,
            ...(options !== undefined ? { options } : {}),
        };
    });
}

function refreshQuestionsList() {
    const list = document.getElementById('questions-list');
    const limitMsg = document.getElementById('questions-limit-msg');
    const addBtn = document.getElementById('add-question-btn');

    if (!list) return;

    list.innerHTML = questions
        .map((q, i) => renderQuestionRow(q, i))
        .join('');

    const atLimit = questions.length >= 5;

    limitMsg?.classList.toggle('hidden', !atLimit);

    if (addBtn) {
        addBtn.disabled = atLimit;
    }

    // Remove question
    list.querySelectorAll('.remove-question-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            syncQuestionsFromDOM();

            const idx = parseInt(btn.dataset.index, 10);

            questions.splice(idx, 1);

            refreshQuestionsList();
        });
    });

    // Type change
    list.querySelectorAll('.question-type').forEach(select => {
        select.addEventListener('change', () => {
            syncQuestionsFromDOM();
            refreshQuestionsList();
        });
    });
}

export function attachJobCreateEvents() {
    // Reset questions state each time the page mounts
    questions = [];

    const btn = document.getElementById('create-job-btn');
    const status = document.getElementById('create-job-status');
    const addBtn = document.getElementById('add-question-btn');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (questions.length >= 5) return;

            syncQuestionsFromDOM();

            questions.push({
                id: crypto.randomUUID(),
                question: '',
                type: 'short_text',
                required: false
            });

            refreshQuestionsList();
        });
    }

    if (btn) {
        btn.addEventListener('click', async () => {
            const title =
                document.getElementById('job-title')?.value?.trim();

            const description =
                document.getElementById('job-description')?.value?.trim();

            const location =
                document.getElementById('job-location')?.value?.trim();

            if (!title || !description || !location) {
                status.textContent =
                    'Title, description and location are required.';

                status.className =
                    'mt-3 font-mono text-xs font-bold text-red-600';

                status.classList.remove('hidden');

                return;
            }

            // Sync and validate custom questions before submitting
            syncQuestionsFromDOM();

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];

                if (!q.question) {
                    status.textContent =
                        `Question ${i + 1} is missing its text.`;

                    status.className =
                        'mt-3 font-mono text-xs font-bold text-red-600';

                    status.classList.remove('hidden');

                    return;
                }

                if (
                    q.type === 'multiple_choice' &&
                    (!q.options || q.options.length < 2)
                ) {
                    status.textContent =
                        `Question ${i + 1} (multiple choice) needs at least 2 options.`;

                    status.className =
                        'mt-3 font-mono text-xs font-bold text-red-600';

                    status.classList.remove('hidden');

                    return;
                }
            }

            const payload = {
                title,
                description,
                location,
                locationType:
                    document.getElementById('job-location-type')?.value || 'remote',

                experienceMin:
                    parseInt(document.getElementById('job-exp-min')?.value) || 0,

                skills:
                    (document.getElementById('job-skills')?.value || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean),

                // Only include customQuestions when the user has added at least one
                ...(questions.length > 0
                    ? { customQuestions: questions }
                    : {}),
            };

            btn.disabled = true;
            btn.innerText = 'CREATING...';

            const res = await apiCall('/jobs', 'POST', payload);

            if (res.success) {
                status.textContent =
                    '✓ Job created! Redirecting...';

                status.className =
                    'mt-3 font-mono text-xs font-bold text-green-700';

                status.classList.remove('hidden');

                setTimeout(() => navigate('/my-jobs'), 1000);
            } else {
                status.textContent =
                    res.error || 'Failed to create job.';

                status.className =
                    'mt-3 font-mono text-xs font-bold text-red-600';

                status.classList.remove('hidden');

                btn.disabled = false;
                btn.innerText = 'Create Job Opening';
            }
        });
    }
}
