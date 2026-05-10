import { currentUser } from '../app.js';
import { apiCall } from '../api.js';

export async function renderDashboard() {
    return `
        <div class="mb-10">
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">Dashboard</p>
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Welcome, ${currentUser.name}
            </h1>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <h3 class="font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Your Profile</h3>
                <p class="font-mono text-sm mb-2"><strong>Email:</strong> ${currentUser.email}</p>
                <p class="font-mono text-sm mb-4"><strong>Type:</strong> ${currentUser.type || 'APPLIER'}</p>
                <button id="upload-cv-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">
                    Upload New CV
                </button>
            </div>
            
            <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b]">
                <h3 class="font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Quick Actions</h3>
                ${currentUser.type === 'MANAGER' || currentUser.type === 'ORG' ? `
                    <a href="/jobs/new" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-[#5ce1e6] text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white hover:border-white transition-colors duration-0">Post a Job</a>
                    <a href="/dashboard/my-jobs" class="nav-link block text-center font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">Manage My Jobs</a>
                ` : `
                    <a href="/jobs" class="nav-link block text-center mb-2 font-mono text-xs font-bold uppercase tracking-widest bg-[#5ce1e6] text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white hover:border-white transition-colors duration-0">Find Jobs</a>
                    <a href="/dashboard/applications" class="nav-link block text-center font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-4 py-2 shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-colors duration-0">My Applications</a>
                `}
            </div>
        </div>
    `;
}

export function attachDashboardEvents() {
    const uploadBtn = document.getElementById('upload-cv-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            alert('Upload CV flow to be implemented');
        });
    }
}
