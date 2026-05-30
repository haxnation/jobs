import { apiCall } from '../api.js';
import { currentUser } from '../app.js';
import { showToast, showModal } from '../components/notifications.js';
import { renderButtonSpinner } from '../components/skeleton.js';

export async function renderOrgSettings() {
    const res = await apiCall('/orgs');
    
    if (!res.success || !res.data) {
        return `
            <div class="text-center mt-20 border-4 border-ink bg-white p-8 shadow-[8px_8px_0_0_#0b0b0b] max-w-md mx-auto">
                <h2 class="text-2xl font-bold uppercase tracking-tight border-b-2 border-ink pb-2 mb-4 text-danger">⚠ Setup Required</h2>
                <div class="font-mono text-sm mb-6 text-left leading-relaxed">
                    <p>You do not belong to an organization or your organization profile could not be loaded.</p>
                </div>
                <a href="/dashboard" class="nav-link block btn-primary w-full text-center">RETURN TO DASHBOARD</a>
            </div>
        `;
    }

    const org = res.data;
    const isCustom = org.seatsLimit === Infinity;

    return `
        <div class="mb-10 text-center">
            <div class="mb-4 text-left">
                <a href="/dashboard" class="nav-link font-mono text-xs font-bold uppercase tracking-widest bg-white text-ink border-2 border-ink px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#0b0b0b] transition-all duration-75 inline-block">← Dashboard</a>
            </div>
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-ink inline-block px-2 border-2 border-ink">ORG Settings</p>
            <h1 class="text-4xl sm:text-5xl font-black text-ink uppercase tracking-tighter leading-none border-b-4 border-ink pb-4">
                ${org.name || 'Your Organization'}
            </h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <!-- Quotas Panel -->
            <div class="lg:col-span-2 flex flex-col gap-6">
                <div class="bg-white border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                    <h3 class="font-bold uppercase tracking-widest mb-6 flex items-center justify-between border-b-2 border-ink pb-2">
                        Organization Quotas
                        <span class="font-mono text-[10px] bg-cyan border-2 border-ink px-2 py-0.5">${org.tier.replace('org_', '').toUpperCase()} TIER</span>
                    </h3>
                    
                    <div class="space-y-6">
                        <!-- Seats -->
                        <div>
                            <div class="flex justify-between font-mono text-xs font-bold mb-1">
                                <span>Seats Used</span>
                                <span>${org.seatsUsed} / ${isCustom ? 'Unlimited' : org.seatsLimit}</span>
                            </div>
                            <div class="w-full bg-canvas border-2 border-ink h-4">
                                <div class="bg-ink h-full" style="width: ${isCustom ? 100 : Math.min(100, (org.seatsUsed / org.seatsLimit) * 100)}%"></div>
                            </div>
                        </div>

                        <!-- Applications -->
                        <div>
                            <div class="flex justify-between font-mono text-xs font-bold mb-1">
                                <span>Applications Received</span>
                                <span>${(org.totalApplicationsReceived || 0).toLocaleString()} / ${isCustom ? 'Unlimited' : org.totalApplicationsLimit.toLocaleString()}</span>
                            </div>
                            <div class="w-full bg-canvas border-2 border-ink h-4">
                                <div class="bg-cyan border-r-2 border-ink h-full" style="width: ${isCustom ? 100 : Math.min(100, ((org.totalApplicationsReceived || 0) / org.totalApplicationsLimit) * 100)}%"></div>
                            </div>
                        </div>

                        <!-- Featured Jobs -->
                        <div>
                            <div class="flex justify-between font-mono text-xs font-bold mb-1">
                                <span>Active Featured Jobs</span>
                                <span>${org.activeFeaturedJobs || 0} / ${isCustom ? 'Unlimited' : org.featuredJobsLimit}</span>
                            </div>
                            <div class="w-full bg-canvas border-2 border-ink h-4">
                                <div class="bg-[#ff00ff] border-r-2 border-ink h-full" style="width: ${isCustom ? 100 : Math.min(100, ((org.activeFeaturedJobs || 0) / org.featuredJobsLimit) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team Management Panel -->
            <div class="bg-white border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <h3 class="font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-3 h-3 bg-ink border-2 border-ink inline-block"></span> Manage Team
                </h3>
                <p class="font-mono text-xs mb-6 text-gray-700 leading-relaxed">
                    Grant ORG permissions to team members. They will immediately inherit the ability to create jobs, view candidates, and consume organization quotas.
                </p>
                
                <form id="add-member-form" class="flex flex-col gap-4">
                    <div>
                        <label class="block font-mono text-xs font-bold mb-1">Team Member Email</label>
                        <input type="email" id="member-email" required placeholder="colleague@company.com" class="w-full border-2 border-ink px-3 py-2 font-mono text-sm focus:outline-none focus:border-cyan shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                    </div>
                    <button type="submit" id="add-member-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-ink text-white border-2 border-ink px-4 py-3 hover:bg-cyan hover:text-ink transition-colors duration-0 w-full mt-2">
                        Grant Access
                    </button>
                </form>
            </div>
        </div>
    `;
}

export function attachOrgSettingsEvents() {
    const form = document.getElementById('add-member-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('add-member-btn');
            const emailInput = document.getElementById('member-email');
            const email = emailInput.value.trim();

            if (!email) {
                showToast("Email is required", "error");
                return;
            }

            const originalText = btn.innerHTML;
            btn.innerHTML = renderButtonSpinner('ADDING');
            btn.disabled = true;

            const res = await apiCall('/orgs/members', 'POST', { email });

            if (res.success) {
                showToast(res.data.message || 'Permissions granted successfully!');
                emailInput.value = '';
                // Reload to refresh quotas
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showModal({
                    title: 'Action Failed',
                    what: res.error?.error || 'Failed to add member.',
                    why: res.error?.message,
                    nextStepLabel: 'Close',
                    isSystemFault: false
                });
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
}
