export async function renderHome() {
    return `
        <div class="py-16">
            <div class="mb-10 max-w-3xl">
                <p class="font-mono text-xs font-bold uppercase tracking-widest text-black mb-2 bg-[#5ce1e6] inline-block px-2 border-2 border-black">HaxNation Jobs</p>
                <h1 class="text-5xl sm:text-7xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                    Find Your Next Role<span class="inline-block w-4 h-[0.8em] bg-[#5ce1e6] animate-pulse align-middle ml-2 border-2 border-black"></span>
                </h1>
            </div>
            
            <p class="text-xl mb-10 font-sans max-w-2xl leading-relaxed">
                Join the most dynamic tech teams. Apply with one click, get AI-driven fit scores, and track your applications in real time.
            </p>

            <div class="flex flex-wrap gap-4 font-mono font-bold uppercase">
                <a href="/jobs" class="nav-link block bg-[#5ce1e6] text-black border-2 border-black px-8 py-4 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-75">
                    Browse Openings
                </a>
                <a href="/dashboard" class="nav-link block bg-white text-black border-2 border-black px-8 py-4 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] hover:bg-black hover:text-white transition-all duration-75">
                    Go to Dashboard
                </a>
            </div>
        </div>
    `;
}
