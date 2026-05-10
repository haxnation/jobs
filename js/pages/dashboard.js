import { currentUser } from '../app.js';
import { apiCall } from '../api.js';

export async function renderDashboard() {
    const userName = currentUser?.name || 'User';
    const userEmail = currentUser?.email || '';
    const accountTypes = Array.isArray(currentUser?.accountType) ? currentUser.accountType : (currentUser?.accountType ? currentUser.accountType.split(',') : ['APPLIER']);
    const isManager = accountTypes.includes('MANAGER');
    const isApplier = accountTypes.includes('APPLIER');

    return `
        <div class="mb-10">
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">Dashboard</p>
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Welcome, ${userName}
            </h1>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <h3 class="font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Your Profile</h3>
                <p class="font-mono text-sm mb-2"><strong>Email:</strong> ${userEmail}</p>
                <p class="font-mono text-sm mb-4"><strong>Roles:</strong> ${accountTypes.join(', ')}</p>
                <button id="upload-cv-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">
                    Upload New CV
                </button>
                <input type="file" id="cv-file-input" accept=".pdf,.docx" class="hidden">
                <p id="cv-upload-status" class="mt-2 font-mono text-xs hidden"></p>
            </div>
            
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <h3 class="font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Quick Actions</h3>
                ${isManager ? `
                    <a href="/jobs/create" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-[#5ce1e6] text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white hover:border-white transition-colors duration-0">Post a Job</a>
                    <a href="/my-jobs" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">Manage My Jobs</a>
                ` : ''}
                ${isApplier ? `
                    <a href="/jobs" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-[#5ce1e6] text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white hover:border-white transition-colors duration-0">Find Jobs</a>
                    <a href="/my-applications" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">My Applications</a>
                ` : ''}
                <a href="/pricing" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">Pricing & Upgrades</a>
                <a href="/analytics" class="nav-link block text-center font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">Analytics</a>
            </div>
            
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] md:col-span-2 border-dashed">
                <h3 class="font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Account Roles</h3>
                <p class="font-mono text-xs mb-4">Manage your account roles to switch between finding jobs and posting jobs:</p>
                <div class="flex flex-wrap gap-4" id="role-toggles">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="w-4 h-4 border-2 border-black checked:bg-black focus:ring-0 cursor-pointer role-checkbox" value="APPLIER" ${accountTypes.includes('APPLIER') ? 'checked' : ''}>
                        <span class="font-mono text-sm font-bold uppercase">Applier</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="w-4 h-4 border-2 border-black checked:bg-black focus:ring-0 cursor-pointer role-checkbox" value="MANAGER" ${accountTypes.includes('MANAGER') ? 'checked' : ''}>
                        <span class="font-mono text-sm font-bold uppercase">Manager</span>
                    </label>
                </div>
                <button id="save-roles-btn" class="mt-4 font-mono text-xs font-bold uppercase tracking-widest bg-black text-white border-2 border-black px-4 py-2 hover:bg-white hover:text-black transition-colors duration-0">
                    Save Roles
                </button>
                <p id="role-save-status" class="mt-2 font-mono text-xs hidden"></p>
            </div>
        </div>
    `;
}

export function attachDashboardEvents() {
    // --- CV Upload ---
    const uploadBtn = document.getElementById('upload-cv-btn');
    const fileInput = document.getElementById('cv-file-input');
    const cvStatus = document.getElementById('cv-upload-status');

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;

            const ext = file.name.split('.').pop().toLowerCase();
            if (!['pdf', 'docx'].includes(ext)) {
                cvStatus.textContent = 'Only PDF and DOCX files are allowed.';
                cvStatus.className = 'mt-2 font-mono text-xs font-bold text-red-600';
                cvStatus.classList.remove('hidden');
                return;
            }

            cvStatus.textContent = 'Getting upload URL...';
            cvStatus.className = 'mt-2 font-mono text-xs font-bold text-black';
            cvStatus.classList.remove('hidden');
            uploadBtn.disabled = true;

            const contentType = ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const urlRes = await apiCall('/cv/upload-url', 'POST', { extension: ext, contentType });

            if (!urlRes.success) {
                cvStatus.textContent = urlRes.error || 'Failed to get upload URL.';
                cvStatus.className = 'mt-2 font-mono text-xs font-bold text-red-600';
                uploadBtn.disabled = false;
                return;
            }

            cvStatus.textContent = 'Uploading CV...';
            try {
                const uploadRes = await fetch(urlRes.data.uploadUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': contentType },
                    body: file
                });
                if (!uploadRes.ok) throw new Error('S3 upload failed');
            } catch (err) {
                cvStatus.textContent = 'Upload failed. Please try again.';
                cvStatus.className = 'mt-2 font-mono text-xs font-bold text-red-600';
                uploadBtn.disabled = false;
                return;
            }

            cvStatus.textContent = 'Confirming upload...';
            const confirmRes = await apiCall('/cv/confirm', 'POST', { s3Key: urlRes.data.key });
            if (confirmRes.success) {
                cvStatus.textContent = '✓ CV uploaded and queued for parsing!';
                cvStatus.className = 'mt-2 font-mono text-xs font-bold text-green-700';
            } else {
                cvStatus.textContent = confirmRes.error || 'Confirmation failed.';
                cvStatus.className = 'mt-2 font-mono text-xs font-bold text-red-600';
            }
            uploadBtn.disabled = false;
        });
    }

    // --- Save Roles ---
    const saveRolesBtn = document.getElementById('save-roles-btn');
    const roleStatus = document.getElementById('role-save-status');

    if (saveRolesBtn) {
        saveRolesBtn.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.role-checkbox');
            const newRoles = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value.trim().toUpperCase());
            
            if (newRoles.length === 0) {
                alert("Please select at least one role.");
                return;
            }
            
            saveRolesBtn.innerText = "SAVING...";
            saveRolesBtn.disabled = true;
            
            const res = await apiCall('/users/me', 'PUT', { accountType: newRoles });
            
            if (res.success) {
                roleStatus.textContent = '✓ Roles updated successfully!';
                roleStatus.className = 'mt-2 font-mono text-xs font-bold text-green-700';
                roleStatus.classList.remove('hidden');
                setTimeout(() => window.location.reload(), 800);
            } else {
                roleStatus.textContent = res.error || 'Failed to update roles.';
                roleStatus.className = 'mt-2 font-mono text-xs font-bold text-red-600';
                roleStatus.classList.remove('hidden');
                saveRolesBtn.innerText = "Save Roles";
                saveRolesBtn.disabled = false;
            }
        });
    }
}
