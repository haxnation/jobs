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
                        <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Job Title *</label>
                        <input id="job-title" type="text" placeholder="e.g. Senior Backend Engineer" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                    </div>
                    <div class="mb-6">
                        <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Description *</label>
                        <textarea id="job-description" rows="6" placeholder="Describe the role, responsibilities, and requirements..." class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6] resize-y"></textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Location *</label>
                            <input id="job-location" type="text" placeholder="e.g. Mumbai, India" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Location Type</label>
                            <select id="job-location-type" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6] bg-white">
                                <option value="remote">Remote</option>
                                <option value="onsite">On-site</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Min Experience (years)</label>
                            <input id="job-exp-min" type="number" min="0" max="30" placeholder="2" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                        <div>
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Skills (comma separated)</label>
                            <input id="job-skills" type="text" placeholder="Node.js, AWS, React" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                    </div>

                    <button id="create-job-btn" class="w-full font-mono uppercase tracking-widest font-bold bg-[#5ce1e6] text-black border-2 border-black px-8 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75">
                        Create Job Opening
                    </button>
                    <p id="create-job-status" class="mt-3 font-mono text-xs hidden"></p>
                    <p class="mt-4 font-mono text-[10px] text-gray-500 uppercase">Note: Jobs are created as private. Use the Pricing page to list them on the public board.</p>
                </div>
            </div>
        </div>
    `;
}

export function attachJobCreateEvents() {
    const btn = document.getElementById('create-job-btn');
    const status = document.getElementById('create-job-status');

    if (btn) {
        btn.addEventListener('click', async () => {
            const title = document.getElementById('job-title')?.value?.trim();
            const description = document.getElementById('job-description')?.value?.trim();
            const location = document.getElementById('job-location')?.value?.trim();

            if (!title || !description || !location) {
                status.textContent = 'Title, description and location are required.';
                status.className = 'mt-3 font-mono text-xs font-bold text-red-600';
                status.classList.remove('hidden');
                return;
            }

            const payload = {
                title,
                description,
                location,
                locationType: document.getElementById('job-location-type')?.value || 'remote',
                experienceMin: parseInt(document.getElementById('job-exp-min')?.value) || 0,
                skills: (document.getElementById('job-skills')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
            };

            btn.disabled = true;
            btn.innerText = 'CREATING...';

            const res = await apiCall('/jobs', 'POST', payload);

            if (res.success) {
                status.textContent = '✓ Job created! Redirecting...';
                status.className = 'mt-3 font-mono text-xs font-bold text-green-700';
                status.classList.remove('hidden');
                setTimeout(() => navigate('/my-jobs'), 1000);
            } else {
                status.textContent = res.error || 'Failed to create job.';
                status.className = 'mt-3 font-mono text-xs font-bold text-red-600';
                status.classList.remove('hidden');
                btn.disabled = false;
                btn.innerText = 'Create Job Opening';
            }
        });
    }
}