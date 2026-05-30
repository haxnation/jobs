import { currentUser } from '../app.js';
import { navigate } from '../app.js';

function createContainer(id, classes) {
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.className = classes;
        document.body.appendChild(container);
    }
    return container;
}

export function showToast(message, type = 'success') {
    const container = createContainer('toast-container', 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none');
    
    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    
    // Ensure message is <= 7 words for success per UX checklist
    let displayMessage = message;
    if (isSuccess) {
        const words = message.split(' ');
        if (words.length > 7) displayMessage = words.slice(0, 7).join(' ') + '...';
    }

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 font-mono text-sm font-bold shadow-[4px_4px_0_0_#0b0b0b] border-2 border-ink animate-[slideIn_0.2s_ease-out] ${
        isSuccess ? 'bg-success text-ink' : 'bg-danger text-white'
    }`;

    toast.innerHTML = `
        <span>${isSuccess ? '✓' : '⚠'}</span>
        <span>${displayMessage}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        toast.style.transition = 'all 0.2s ease-out';
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

export function showModal({ title, what, why, nextStepLabel, nextStepAction, type = 'error', isSystemFault = false }) {
    const isSuccess = type === 'success';
    
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]';
    
    const modal = document.createElement('div');
    modal.className = `bg-white border-4 border-ink p-6 max-w-md w-full shadow-[8px_8px_0_0_#0b0b0b] ${
        isSuccess ? 'border-success' : 'border-danger'
    }`;
    
    let roleAwareNextStepAction = nextStepAction;

    // Role-aware override (prevent appliers from being asked to create jobs)
    if (currentUser?.role === 'applier' && nextStepAction === '/jobs/create') {
        nextStepLabel = 'Browse Jobs';
        roleAwareNextStepAction = '/jobs';
    }

    modal.innerHTML = `
        <h2 class="font-mono text-xl font-bold uppercase mb-4 flex items-center gap-2 ${isSuccess ? 'text-success' : 'text-danger'}">
            ${isSuccess ? '✓' : '⚠'} ${title}
        </h2>
        
        <div class="space-y-4 font-mono text-sm mb-6">
            ${what ? `<p><strong>What happened:</strong> ${what}</p>` : ''}
            ${why ? `<p><strong>Why:</strong> ${why}</p>` : ''}
        </div>

        <div class="flex flex-wrap gap-3">
            <button id="modal-next-btn" class="${isSuccess ? 'btn-primary' : 'btn-danger'} flex-1">
                ${nextStepLabel}
            </button>
            ${isSystemFault ? `
                <a href="mailto:support@haxnation.org?subject=System Error: ${title}" class="btn-secondary text-center flex-1">
                    Contact Us
                </a>
            ` : ''}
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('modal-next-btn').addEventListener('click', () => {
        overlay.remove();
        if (typeof roleAwareNextStepAction === 'function') {
            roleAwareNextStepAction();
        } else if (typeof roleAwareNextStepAction === 'string') {
            navigate(roleAwareNextStepAction);
        }
    });
}
