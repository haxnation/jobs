import { apiCall } from '../api.js';
import { navigate } from '../app.js';

export async function renderOnboarding() {
    return `
        <div class="max-w-2xl mx-auto mt-10">
            <div class="bg-white border-4 border-black shadow-[12px_12px_0_0_#5ce1e6] p-0">
                <div class="bg-black text-white p-4 font-mono font-bold uppercase tracking-widest border-b-4 border-black">
                    Complete Your Profile
                </div>
                <div class="p-6 sm:p-10">
                    <p class="font-mono text-sm mb-8">Set up your account to get started on HaxNation Jobs.</p>

                    <div class="mb-6">
                        <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2 border-b border-black pb-1">Account Type *</label>
                        <div class="flex flex-wrap gap-4" id="onboard-role-toggles">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="w-4 h-4 border-2 border-black cursor-pointer onboard-role" value="APPLIER" checked>
                                <span class="font-mono text-sm font-bold uppercase">Applier (Find Jobs)</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="w-4 h-4 border-2 border-black cursor-pointer onboard-role" value="MANAGER">
                                <span class="font-mono text-sm font-bold uppercase">Manager (Post Jobs)</span>
                            </label>
                        </div>
                    </div>

                    <div id="applier-fields">
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Headline</label>
                            <input id="onboard-headline" type="text" placeholder="e.g. Senior Backend Engineer" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Location</label>
                            <input id="onboard-location" type="text" placeholder="e.g. Mumbai, India" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Years of Experience</label>
                            <input id="onboard-experience" type="number" min="0" max="50" placeholder="3" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Skills (comma separated)</label>
                            <input id="onboard-skills" type="text" placeholder="JavaScript, React, AWS" class="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                        </div>
                    </div>

                    <button id="onboard-submit-btn" class="w-full font-mono uppercase tracking-widest font-bold bg-[#5ce1e6] text-black border-2 border-black px-8 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75">
                        Complete Setup
                    </button>
                    <p id="onboard-status" class="mt-3 font-mono text-xs hidden"></p>
                </div>
            </div>
        </div>
    `;
}

export function attachOnboardingEvents() {
    const submitBtn = document.getElementById('onboard-submit-btn');
    const statusEl = document.getElementById('onboard-status');

    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const roleCheckboxes = document.querySelectorAll('.onboard-role');
            const roles = Array.from(roleCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

            if (roles.length === 0) {
                statusEl.textContent = 'Please select at least one account type.';
                statusEl.className = 'mt-3 font-mono text-xs font-bold text-red-600';
                statusEl.classList.remove('hidden');
                return;
            }

            const payload = {
                accountType: roles,
                headline: document.getElementById('onboard-headline')?.value || '',
                currentLocation: document.getElementById('onboard-location')?.value || '',
                experienceYears: parseInt(document.getElementById('onboard-experience')?.value) || 0,
                skills: (document.getElementById('onboard-skills')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
            };

            submitBtn.disabled = true;
            submitBtn.innerText = 'SETTING UP...';

            const res = await apiCall('/users/onboarding', 'POST', payload);

            if (res.success) {
                statusEl.textContent = '✓ Profile created! Redirecting...';
                statusEl.className = 'mt-3 font-mono text-xs font-bold text-green-700';
                statusEl.classList.remove('hidden');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                statusEl.textContent = res.error || 'Setup failed. Please try again.';
                statusEl.className = 'mt-3 font-mono text-xs font-bold text-red-600';
                statusEl.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Complete Setup';
            }
        });
    }
}
