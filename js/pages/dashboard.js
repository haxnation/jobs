import { currentUser } from '../app.js';
import { apiCall } from '../api.js';
import { renderButtonSpinner } from '../components/skeleton.js';
import { showToast, showModal } from '../components/notifications.js';

export async function renderDashboard() {
    const userName = currentUser?.name || 'User';
    const userEmail = currentUser?.email || '';
    const accountTypes = Array.isArray(currentUser?.accountType) ? currentUser.accountType : (currentUser?.accountType ? currentUser.accountType.split(',') : ['APPLIER']);
    const isManager = accountTypes.includes('MANAGER');
    const isApplier = accountTypes.includes('APPLIER');

    return `
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-4 border-ink pb-4">
            <div>
                <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-ink inline-block px-2 border-2 border-ink">Dashboard</p>
                <h1 class="text-4xl sm:text-5xl font-black text-ink uppercase tracking-tighter leading-none">
                    Welcome, ${userName}
                </h1>
            </div>
            <!-- 1. Compact Profile Summary -->
            <div class="flex items-center gap-4 bg-white border-2 border-ink p-3 shadow-[4px_4px_0_0_#0b0b0b]">
                <div class="font-mono text-xs leading-relaxed">
                    <strong>Email:</strong> ${userEmail}<br>
                    <strong>Roles:</strong> ${accountTypes.join(', ')}
                </div>
            </div>
        </div>

        <!-- 2 & 3. Quick Actions as Primary Focal Area -->
        <div class="mb-10">
            <h3 class="font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><span class="w-3 h-3 bg-cyan border-2 border-ink inline-block"></span> Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <a href="/cv-builder" class="nav-link flex flex-col justify-center items-center text-center font-mono font-bold uppercase bg-cyan text-ink border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">
                    <span class="text-2xl lg:text-3xl font-black tracking-tighter mb-1">CV</span>
                    <span class="text-[10px] tracking-widest opacity-90">Manage Profile</span>
                </a>
                ${isApplier ? `
                    <a href="/jobs" class="nav-link flex flex-col justify-center items-center text-center font-mono font-bold uppercase bg-white text-ink border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">
                        <span class="text-2xl lg:text-3xl font-black tracking-tighter mb-1">FIND</span>
                        <span class="text-[10px] tracking-widest opacity-90">Job Openings</span>
                    </a>
                    <a href="/my-applications" class="nav-link flex flex-col justify-center items-center text-center font-mono font-bold uppercase bg-white text-ink border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">
                        <span class="text-2xl lg:text-3xl font-black tracking-tighter mb-1">APPS</span>
                        <span class="text-[10px] tracking-widest opacity-90">My Applications</span>
                    </a>
                ` : ''}
                ${isManager ? `
                    <a href="/jobs/create" class="nav-link flex flex-col justify-center items-center text-center font-mono font-bold uppercase bg-cyan text-ink border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">
                        <span class="text-2xl lg:text-3xl font-black tracking-tighter mb-1">POST</span>
                        <span class="text-[10px] tracking-widest opacity-90">A New Job</span>
                    </a>
                    <a href="/my-jobs" class="nav-link flex flex-col justify-center items-center text-center font-mono font-bold uppercase bg-white text-ink border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">
                        <span class="text-2xl lg:text-3xl font-black tracking-tighter mb-1">JOBS</span>
                        <span class="text-[10px] tracking-widest opacity-90">Manage Postings</span>
                    </a>
                ` : ''}

                <a href="/pricing" class="nav-link flex flex-col justify-center items-center text-center font-mono font-bold uppercase bg-white text-ink border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b] hover:bg-ink hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">
                    <span class="text-2xl lg:text-3xl font-black tracking-tighter mb-1">PRO</span>
                    <span class="text-[10px] tracking-widest opacity-90">Upgrades</span>
                </a>
            </div>
        </div>

        <!-- 5. Future Dashboard Content Placeholders -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            ${isApplier ? `
            <div class="bg-canvas border-2 border-dashed border-ink p-6 opacity-60">
                <h3 class="font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                    Recommended Jobs
                    <span class="font-mono text-[10px] bg-ink text-white px-2 py-0.5">Coming Soon</span>
                </h3>
                <p class="font-mono text-xs text-gray-600">AI-powered job recommendations based on your profile will appear here.</p>
            </div>
            ` : ''}
            


            <div class="bg-canvas border-2 border-dashed border-ink p-6 opacity-60">
                <h3 class="font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                    Recent Activity
                    <span class="font-mono text-[10px] bg-ink text-white px-2 py-0.5">Coming Soon</span>
                </h3>
                <p class="font-mono text-xs text-gray-600">An activity log of notifications, application status changes, and system alerts.</p>
            </div>
        </div>

        <!-- 4. Account Roles (Moved below primary content) -->
        <div class="bg-white border-2 border-ink p-6 shadow-[4px_4px_0_0_#0b0b0b]">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 class="font-bold uppercase tracking-widest mb-1">Account Roles</h3>
                    <p class="font-mono text-xs text-gray-600">Manage your active roles to switch contexts.</p>
                </div>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div class="flex gap-4" id="role-toggles">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 border-2 border-ink checked:bg-ink focus:ring-0 cursor-pointer role-checkbox" value="APPLIER" ${accountTypes.includes('APPLIER') ? 'checked' : ''}>
                            <span class="font-mono text-sm font-bold uppercase">Applier</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 border-2 border-ink checked:bg-ink focus:ring-0 cursor-pointer role-checkbox" value="MANAGER" ${accountTypes.includes('MANAGER') ? 'checked' : ''}>
                            <span class="font-mono text-sm font-bold uppercase">Manager</span>
                        </label>
                    </div>
                    <button id="save-roles-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-ink text-white border-2 border-ink px-4 py-2 hover:bg-white hover:text-ink transition-colors duration-0 whitespace-nowrap">
                        Save Roles
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function attachDashboardEvents() {
    // --- Save Roles ---
    const saveRolesBtn = document.getElementById('save-roles-btn');

    if (saveRolesBtn) {
        saveRolesBtn.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.role-checkbox');
            const newRoles = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value.trim().toUpperCase());
            
            if (newRoles.length === 0) {
                showToast("Please select at least one role.", "error");
                return;
            }
            
            const originalText = saveRolesBtn.innerHTML;
            saveRolesBtn.innerHTML = renderButtonSpinner('SAVING');
            saveRolesBtn.disabled = true;
            
            const res = await apiCall('/users/me', 'PUT', { accountType: newRoles });
            
            if (res.success) {
                showToast('Roles updated successfully!');
                setTimeout(() => window.location.reload(), 800);
            } else {
                showModal({
                    title: 'Update Failed',
                    what: res.error?.what || 'Failed to update roles.',
                    why: res.error?.why,
                    nextStepLabel: res.error?.nextStepLabel || 'Try Again',
                    nextStepAction: res.error?.nextStepAction || null,
                    isSystemFault: res.error?.isSystemFault || false
                });
                saveRolesBtn.innerHTML = originalText;
                saveRolesBtn.disabled = false;
            }
        });
    }
}
