import { apiCall } from '../api.js';
import { currentUser } from '../app.js';

const PLANS = [
    { id: 'SUB_PRO', name: 'Pro Subscription', price: '₹499/mo', description: 'Unlimited job postings, priority support, and advanced analytics.', cta: 'Upgrade to Pro' },
    { id: 'JOB_STANDARD', name: 'Standard Listing', price: '₹999', description: 'List your job on the public board for 30 days with standard visibility.', cta: 'List Job', needsJobId: true },
    { id: 'JOB_FEATURED', name: 'Featured Listing', price: '₹2,999', description: 'Featured placement on the board with highlighted card and top ranking.', cta: 'Feature Job', needsJobId: true },
    { id: 'EXT_CAP', name: 'Application Cap Extension', price: '₹500', description: 'Remove the application cap on a specific job posting.', cta: 'Extend Cap', needsJobId: true },
];

export async function renderPricing() {
    return `
        <div class="mb-10">
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">Pricing</p>
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Plans & Upgrades
            </h1>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${PLANS.map(plan => `
                <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] flex flex-col">
                    <div class="flex justify-between items-start border-b-2 border-black pb-3 mb-4">
                        <h3 class="font-black text-xl uppercase tracking-tighter">${plan.name}</h3>
                        <span class="font-mono text-lg font-bold bg-[#5ce1e6] px-2 border-2 border-black">${plan.price}</span>
                    </div>
                    <p class="font-sans text-sm flex-1 mb-6">${plan.description}</p>
                    ${plan.needsJobId ? `
                        <input type="text" placeholder="Enter Job ID" class="pricing-job-id w-full border-2 border-black px-3 py-2 font-mono text-xs mb-3 focus:outline-none focus:border-[#5ce1e6]" data-plan="${plan.id}">
                    ` : ''}
                    <button class="pricing-buy-btn font-mono text-xs font-bold uppercase tracking-widest bg-black text-white border-2 border-black px-4 py-2 hover:bg-[#5ce1e6] hover:text-black transition-colors duration-0" data-plan="${plan.id}">
                        ${plan.cta}
                    </button>
                    <p class="pricing-status mt-2 font-mono text-xs hidden" data-plan="${plan.id}"></p>
                </div>
            `).join('')}
        </div>
    `;
}

export function attachPricingEvents() {
    const buttons = document.querySelectorAll('.pricing-buy-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const planType = btn.dataset.plan;
            let jobId = null;

            const plan = PLANS.find(p => p.id === planType);
            if (plan?.needsJobId) {
                const input = document.querySelector(`.pricing-job-id[data-plan="${planType}"]`);
                jobId = input?.value?.trim();
                if (!jobId) {
                    const status = document.querySelector(`.pricing-status[data-plan="${planType}"]`);
                    status.textContent = 'Please enter a Job ID.';
                    status.className = 'pricing-status mt-2 font-mono text-xs font-bold text-red-600';
                    status.classList.remove('hidden');
                    return;
                }
            }

            btn.disabled = true;
            btn.innerText = 'PROCESSING...';

            const payload = { planType };
            if (jobId) payload.jobId = jobId;

            const res = await apiCall('/payments/initiate', 'POST', payload);
            const status = document.querySelector(`.pricing-status[data-plan="${planType}"]`);

            if (res.success && res.data) {
                status.textContent = `✓ Payment initiated! Order: ${res.data.orderId} — Token: ${res.data.txnToken.substring(0, 8)}...`;
                status.className = 'pricing-status mt-2 font-mono text-xs font-bold text-green-700';
                status.classList.remove('hidden');
                // In production, integrate Paytm Checkout JS SDK here
                btn.innerText = 'INITIATED ✓';
            } else {
                status.textContent = res.error || 'Payment failed.';
                status.className = 'pricing-status mt-2 font-mono text-xs font-bold text-red-600';
                status.classList.remove('hidden');
                btn.disabled = false;
                btn.innerText = plan.cta;
            }
        });
    });
}
