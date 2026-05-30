export function renderSkeleton(route = '') {
    // Default skeleton layout (e.g. for dashboard, jobs list)
    let content = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            ${Array(6).fill('').map(() => `
                <div class="bg-white border-2 border-ink p-6 shadow-[6px_6px_0_0_#0b0b0b]">
                    <div class="h-6 bg-gray-200 w-3/4 mb-4"></div>
                    <div class="h-4 bg-gray-200 w-1/2 mb-2"></div>
                    <div class="h-4 bg-gray-200 w-full mb-6"></div>
                    <div class="flex gap-2">
                        <div class="h-8 bg-gray-200 w-24"></div>
                        <div class="h-8 bg-gray-200 w-24"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (route.includes('/kanban')) {
        content = `
            <div class="mb-4 flex justify-between items-end border-b-4 border-ink pb-4 gap-4 animate-pulse">
                <div class="h-10 bg-gray-200 w-64"></div>
                <div class="h-10 bg-gray-200 w-48 border-2 border-ink"></div>
            </div>
            <div class="mb-6 h-16 bg-gray-200 border-2 border-ink shadow-[4px_4px_0_0_#0b0b0b] w-full animate-pulse"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 items-start animate-pulse">
                ${Array(4).fill('').map(() => `
                    <div class="bg-canvas border-2 border-ink shadow-[4px_4px_0_0_#0b0b0b] flex flex-col">
                        <div class="bg-ink p-3 border-b-2 border-ink h-10 w-full"></div>
                        <div class="p-3 flex-1 flex flex-col gap-3">
                            ${Array(3).fill('').map(() => `
                                <div class="bg-white border-2 border-ink p-3 shadow-[2px_2px_0_0_#0b0b0b] flex flex-col gap-2">
                                    <div class="h-6 bg-gray-200 w-3/4"></div>
                                    <div class="h-3 bg-gray-200 w-1/2 mt-1"></div>
                                    <div class="h-10 bg-gray-200 w-full mt-2"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (route.includes('/create') || route.includes('/cv-builder')) {
        // Form/Single view skeleton
        content = `
            <div class="max-w-2xl mx-auto mt-10 animate-pulse">
                <div class="bg-white border-4 border-ink shadow-[12px_12px_0_0_#0b0b0b] p-0">
                    <div class="bg-gray-300 h-14 border-b-4 border-ink w-full"></div>
                    <div class="p-6 sm:p-10 space-y-6">
                        <div>
                            <div class="h-4 bg-gray-200 w-32 mb-2"></div>
                            <div class="h-10 bg-gray-200 w-full border-2 border-ink"></div>
                        </div>
                        <div>
                            <div class="h-4 bg-gray-200 w-32 mb-2"></div>
                            <div class="h-32 bg-gray-200 w-full border-2 border-ink"></div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <div class="h-4 bg-gray-200 w-24 mb-2"></div>
                                <div class="h-10 bg-gray-200 w-full border-2 border-ink"></div>
                            </div>
                            <div>
                                <div class="h-4 bg-gray-200 w-24 mb-2"></div>
                                <div class="h-10 bg-gray-200 w-full border-2 border-ink"></div>
                            </div>
                        </div>
                        <div class="h-12 bg-gray-300 w-full mt-6"></div>
                    </div>
                </div>
            </div>
        `;
    }

    return content;
}

export function renderButtonSpinner(text = "Loading") {
    return `
        <span class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${text}...
        </span>
    `;
}
