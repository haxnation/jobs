import { apiCall } from '../api.js';
import { navigate } from '../app.js';
import { setupFormValidation } from '../components/forms.js';
import { renderButtonSpinner } from '../components/skeleton.js';
import { showToast, showModal } from '../components/notifications.js';

export async function renderOnboarding() {
    return `
        <div class="max-w-2xl mx-auto mt-10">
            <div class="bg-white border-4 border-ink shadow-[12px_12px_0_0_#0b0b0b] p-0">
                <div class="bg-ink text-white p-4 font-mono font-bold uppercase tracking-widest border-b-4 border-ink">
                    Complete Your Profile
                </div>
                <form id="onboard-form" class="p-6 sm:p-10" novalidate>
                    <p class="font-mono text-sm mb-8">Set up your account to get started on HaxNation Jobs.</p>

                    <div class="mb-6">
                        <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2 border-b border-ink pb-1">Account Type *</label>
                        <div class="flex flex-wrap gap-4" id="onboard-role-toggles">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="w-4 h-4 border-2 border-ink cursor-pointer onboard-role" value="APPLIER" checked>
                                <span class="font-mono text-sm font-bold uppercase">Applier (Find Jobs)</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="w-4 h-4 border-2 border-ink cursor-pointer onboard-role" value="MANAGER">
                                <span class="font-mono text-sm font-bold uppercase">Manager (Post Jobs)</span>
                            </label>
                        </div>
                    </div>

                    <div id="applier-fields">
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Headline</label>
                            <input id="onboard-headline" type="text" placeholder="e.g. Senior Backend Engineer" class="w-full border-2 border-ink px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan" required>
                        </div>
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Location</label>
                            <input id="onboard-location" type="text" placeholder="e.g. Mumbai, India" class="w-full border-2 border-ink px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan" required>
                        </div>
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Years of Experience</label>
                            <input id="onboard-experience" type="number" min="0" max="50" placeholder="3" class="w-full border-2 border-ink px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan">
                        </div>
                        <div class="mb-6">
                            <label class="block font-mono text-xs font-bold uppercase tracking-widest mb-2">Skills (comma separated)</label>
                            <input id="onboard-skills" type="text" placeholder="JavaScript, React, AWS" class="w-full border-2 border-ink px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyan">
                        </div>
                    </div>

                    <button id="onboard-submit-btn" type="submit" class="btn-primary w-full submit-btn">
                        Complete Setup
                    </button>
                </form>
            </div>
        </div>
    `;
}

export function attachOnboardingEvents() {
    const form = document.getElementById('onboard-form');
    const submitBtn = document.getElementById('onboard-submit-btn');

    if (form) {
        setupFormValidation(form, async () => {
            const roleCheckboxes = document.querySelectorAll('.onboard-role');
            const roles = Array.from(roleCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

            if (roles.length === 0) {
                showToast('Please select at least one account type.', 'error');
                return;
            }

            const payload = {
                accountType: roles,
                headline: document.getElementById('onboard-headline')?.value || '',
                currentLocation: document.getElementById('onboard-location')?.value || '',
                experienceYears: parseInt(document.getElementById('onboard-experience')?.value) || 0,
                skills: (document.getElementById('onboard-skills')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
            };

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = renderButtonSpinner('SETTING UP');

            const res = await apiCall('/users/onboarding', 'POST', payload);

            if (res.success) {
                showToast('Profile created! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                showModal({
                    title: 'Setup Failed',
                    what: res.error?.what || 'Failed to set up your profile.',
                    why: res.error?.why,
                    nextStepLabel: res.error?.nextStepLabel || 'Try Again',
                    nextStepAction: res.error?.nextStepAction || null,
                    isSystemFault: res.error?.isSystemFault || false
                });
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
}
