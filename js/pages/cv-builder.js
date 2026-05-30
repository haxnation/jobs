import { currentUser } from '../app.js';
import { apiCall } from '../api.js';

let cvData = {
    personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
    education: [],
    experience: [],
    skills: [],
    customSections: []
};

function emptyEdu() { return { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '' }; }
function emptyExp() { return { company: '', title: '', location: '', startDate: '', endDate: '', description: '' }; }
function emptyCustomItem() { return { title: '', subtitle: '', date: '', description: '' }; }
function emptyCustomSection() { return { title: 'New Section', items: [emptyCustomItem()] }; }

export async function renderCvBuilder(skipFetch = false) {
    // Load existing CV if not skipping
    if (!skipFetch) {
        const res = await apiCall('/cv');
        if (res.success && res.data?.cv) {
            cvData = { ...cvData, ...res.data.cv };
            if (!cvData.customSections) cvData.customSections = [];
        }
    }

    return `
        <div class="mb-8">
            <p class="font-mono text-xs font-bold uppercase tracking-widest text-white mb-2 bg-black inline-block px-2 border-2 border-black">CV Builder</p>
            <h1 class="text-4xl sm:text-5xl font-black text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-4">
                Build Your CV
            </h1>
        </div>

        <!-- Action Bar -->
        <div class="flex flex-wrap gap-3 mb-8">
            <button id="cv-save-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-black text-white border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#5ce1e6] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#5ce1e6] transition-all duration-75">💾 Save CV</button>
            <button id="cv-export-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-[#5ce1e6] text-black border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">📄 Export PDF</button>
            <button id="cv-upload-btn" class="font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">📤 Import PDF</button>
            <input type="file" id="cv-pdf-input" accept=".pdf" class="hidden">
            <a href="#" onclick="event.preventDefault(); window.history.length > 2 ? window.history.back() : window.location.href='/dashboard'" class="nav-link font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">← Go Back</a>
        </div>
        <p id="cv-status" class="mb-4 font-mono text-xs font-bold hidden"></p>

        <!-- Personal Info -->
        <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] mb-6">
            <h3 class="font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${personalField('cv-name', 'Full Name', cvData.personalInfo.name)}
                ${personalField('cv-email', 'Email', cvData.personalInfo.email, 'email')}
                ${personalField('cv-phone', 'Phone', cvData.personalInfo.phone, 'tel')}
                ${personalField('cv-location', 'Location', cvData.personalInfo.location)}
                ${personalField('cv-linkedin', 'LinkedIn URL', cvData.personalInfo.linkedin, 'url')}
                ${personalField('cv-website', 'Website', cvData.personalInfo.website, 'url')}
            </div>
            <div class="mt-4">
                <label class="font-mono text-xs font-bold uppercase block mb-1">Professional Summary</label>
                <textarea id="cv-summary" rows="3" class="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">${esc(cvData.personalInfo.summary)}</textarea>
            </div>
        </div>

        <!-- Education -->
        <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] mb-6">
            <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                <h3 class="font-bold uppercase tracking-widest">Education</h3>
                <button id="add-edu-btn" class="font-mono text-xs font-bold uppercase bg-[#5ce1e6] text-black border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors duration-0">+ Add</button>
            </div>
            <div id="edu-list">${cvData.education.map((e, i) => eduBlock(e, i)).join('')}</div>
        </div>

        <!-- Experience -->
        <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] mb-6">
            <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                <h3 class="font-bold uppercase tracking-widest">Work Experience</h3>
                <button id="add-exp-btn" class="font-mono text-xs font-bold uppercase bg-[#5ce1e6] text-black border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors duration-0">+ Add</button>
            </div>
            <div id="exp-list">${cvData.experience.map((e, i) => expBlock(e, i)).join('')}</div>
        </div>

        <!-- Skills -->
        <div class="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] mb-6">
            <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                <h3 class="font-bold uppercase tracking-widest">Skills</h3>
            </div>
            <div class="flex flex-wrap gap-2 mb-3" id="skills-tags">${cvData.skills.map((s, i) => `<span class="inline-flex items-center gap-1 bg-black text-white font-mono text-xs px-3 py-1 border-2 border-black">${esc(s)} <button class="remove-skill ml-1 text-[#ff2a2a] font-bold hover:text-white" data-idx="${i}">×</button></span>`).join('')}</div>
            <div class="flex gap-2">
                <input id="skill-input" type="text" placeholder="Add a skill..." class="flex-1 border-2 border-black p-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]">
                <button id="add-skill-btn" class="font-mono text-xs font-bold uppercase bg-black text-white border-2 border-black px-4 py-2 hover:bg-[#5ce1e6] hover:text-black transition-colors duration-0">Add</button>
            </div>
        </div>

        <!-- Custom Sections (Custom Columns) -->
        <div id="custom-sections-container">
            ${(cvData.customSections || []).map((sec, sIdx) => customSectionBlock(sec, sIdx)).join('')}
        </div>
        <button id="add-custom-section-btn" class="mb-8 font-mono text-xs font-bold uppercase bg-white text-black border-2 border-black px-4 py-2 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">+ Add Custom Section</button>
    `;
}

function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function personalField(id, label, val, type = 'text') {
    return `<div><label class="font-mono text-xs font-bold uppercase block mb-1">${label}</label><input id="${id}" type="${type}" value="${esc(val)}" class="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"></div>`;
}

function eduBlock(e, i) {
    return `<div class="edu-entry border-2 border-dashed border-gray-400 p-4 mb-3" data-idx="${i}">
        <div class="flex justify-between mb-2"><span class="font-mono text-xs font-bold uppercase text-gray-500">Education #${i + 1}</span><button class="remove-edu font-mono text-xs font-bold text-[#ff2a2a] uppercase" data-idx="${i}">Remove</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">School</label><input class="edu-school w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.school)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Degree</label><input class="edu-degree w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.degree)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Field of Study</label><input class="edu-field w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.field)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">GPA</label><input class="edu-gpa w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.gpa)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Start Date</label><input class="edu-start w-full border-2 border-black p-2 font-mono text-sm" placeholder="e.g. Sep 2020" value="${esc(e.startDate)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">End Date</label><input class="edu-end w-full border-2 border-black p-2 font-mono text-sm" placeholder="e.g. Jun 2024" value="${esc(e.endDate)}"></div>
        </div>
        <div class="mt-2"><label class="font-mono text-xs font-bold uppercase block mb-1">Description</label><textarea class="edu-desc w-full border-2 border-black p-2 font-mono text-sm" rows="2">${esc(e.description)}</textarea></div>
    </div>`;
}

function expBlock(e, i) {
    return `<div class="exp-entry border-2 border-dashed border-gray-400 p-4 mb-3" data-idx="${i}">
        <div class="flex justify-between mb-2"><span class="font-mono text-xs font-bold uppercase text-gray-500">Experience #${i + 1}</span><button class="remove-exp font-mono text-xs font-bold text-[#ff2a2a] uppercase" data-idx="${i}">Remove</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Company</label><input class="exp-company w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.company)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Job Title</label><input class="exp-title w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.title)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Location</label><input class="exp-location w-full border-2 border-black p-2 font-mono text-sm" value="${esc(e.location)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Start Date</label><input class="exp-start w-full border-2 border-black p-2 font-mono text-sm" placeholder="e.g. Jan 2022" value="${esc(e.startDate)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">End Date</label><input class="exp-end w-full border-2 border-black p-2 font-mono text-sm" placeholder="e.g. Present" value="${esc(e.endDate)}"></div>
        </div>
        <div class="mt-2"><label class="font-mono text-xs font-bold uppercase block mb-1">Description</label><textarea class="exp-desc w-full border-2 border-black p-2 font-mono text-sm" rows="3">${esc(e.description)}</textarea></div>
    </div>`;
}

function customSectionBlock(sec, sIdx) {
    return `
        <div class="custom-section bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#0b0b0b] mb-6" data-sidx="${sIdx}">
            <div class="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                <input class="custom-sec-title font-bold uppercase tracking-widest text-lg border-none focus:outline-none focus:border-b-2 focus:border-[#5ce1e6] bg-transparent" value="${esc(sec.title)}" placeholder="Section Title">
                <div class="flex gap-2">
                    <button class="add-custom-item font-mono text-xs font-bold uppercase bg-black text-white border-2 border-black px-3 py-1 hover:bg-[#5ce1e6] hover:text-black transition-colors duration-0" data-sidx="${sIdx}">+ Add Item</button>
                    <button class="remove-custom-section font-mono text-xs font-bold text-[#ff2a2a] uppercase border-2 border-[#ff2a2a] px-3 py-1 hover:bg-[#ff2a2a] hover:text-white bg-white" data-sidx="${sIdx}">Remove Section</button>
                </div>
            </div>
            <div class="custom-items-list" data-sidx="${sIdx}">
                ${sec.items.map((item, iIdx) => customItemBlock(item, sIdx, iIdx)).join('')}
            </div>
        </div>
    `;
}

function customItemBlock(item, sIdx, iIdx) {
    return `<div class="custom-item border-2 border-dashed border-gray-400 p-4 mb-3" data-sidx="${sIdx}" data-iidx="${iIdx}">
        <div class="flex justify-between mb-2"><span class="font-mono text-xs font-bold uppercase text-gray-500">Item #${iIdx + 1}</span><button class="remove-custom-item font-mono text-xs font-bold text-[#ff2a2a] uppercase" data-sidx="${sIdx}" data-iidx="${iIdx}">Remove</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Title</label><input class="ci-title w-full border-2 border-black p-2 font-mono text-sm" value="${esc(item.title)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Subtitle</label><input class="ci-subtitle w-full border-2 border-black p-2 font-mono text-sm" value="${esc(item.subtitle)}"></div>
            <div><label class="font-mono text-xs font-bold uppercase block mb-1">Date / Details</label><input class="ci-date w-full border-2 border-black p-2 font-mono text-sm" value="${esc(item.date)}"></div>
        </div>
        <div class="mt-2"><label class="font-mono text-xs font-bold uppercase block mb-1">Description</label><textarea class="ci-desc w-full border-2 border-black p-2 font-mono text-sm" rows="2">${esc(item.description)}</textarea></div>
    </div>`;
}

function gatherFormData() {
    cvData.personalInfo = {
        name: document.getElementById('cv-name')?.value || '',
        email: document.getElementById('cv-email')?.value || '',
        phone: document.getElementById('cv-phone')?.value || '',
        location: document.getElementById('cv-location')?.value || '',
        linkedin: document.getElementById('cv-linkedin')?.value || '',
        website: document.getElementById('cv-website')?.value || '',
        summary: document.getElementById('cv-summary')?.value || ''
    };
    cvData.education = Array.from(document.querySelectorAll('.edu-entry')).map(el => ({
        school: el.querySelector('.edu-school')?.value || '',
        degree: el.querySelector('.edu-degree')?.value || '',
        field: el.querySelector('.edu-field')?.value || '',
        gpa: el.querySelector('.edu-gpa')?.value || '',
        startDate: el.querySelector('.edu-start')?.value || '',
        endDate: el.querySelector('.edu-end')?.value || '',
        description: el.querySelector('.edu-desc')?.value || ''
    }));
    cvData.experience = Array.from(document.querySelectorAll('.exp-entry')).map(el => ({
        company: el.querySelector('.exp-company')?.value || '',
        title: el.querySelector('.exp-title')?.value || '',
        location: el.querySelector('.exp-location')?.value || '',
        startDate: el.querySelector('.exp-start')?.value || '',
        endDate: el.querySelector('.exp-end')?.value || '',
        description: el.querySelector('.exp-desc')?.value || ''
    }));
    cvData.customSections = Array.from(document.querySelectorAll('.custom-section')).map(sec => ({
        title: sec.querySelector('.custom-sec-title')?.value || '',
        items: Array.from(sec.querySelectorAll('.custom-item')).map(item => ({
            title: item.querySelector('.ci-title')?.value || '',
            subtitle: item.querySelector('.ci-subtitle')?.value || '',
            date: item.querySelector('.ci-date')?.value || '',
            description: item.querySelector('.ci-desc')?.value || ''
        }))
    }));
    // skills are managed via add/remove, already in cvData
}

function showStatus(msg, ok) {
    const el = document.getElementById('cv-status');
    if (!el) return;
    el.textContent = msg;
    el.className = `mb-4 font-mono text-xs font-bold ${ok ? 'text-green-700' : 'text-[#ff2a2a]'}`;
    el.classList.remove('hidden');
    if (ok) setTimeout(() => el.classList.add('hidden'), 3000);
}

// --- PDF Export using jsPDF — Compact MIT CV Format ---
// Times Roman font, 0.5-inch margins, centered header, tight spacing,
// bullet-pointed description lines for maximum single-page density.
async function exportPdf() {
    gatherFormData();
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { showStatus('jsPDF not loaded. Please wait and try again.', false); return; }

    const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // US Letter, points
    const PW = 612;                    // page width  in pt
    const PH = 792;                    // page height in pt
    const M  = 36;                     // 0.5 inch margin
    const CW = PW - 2 * M;            // content width
    const BOTTOM = PH - M;            // bottom margin boundary
    let y = M;

    // --- helpers ---
    const LH = 1.15;                   // line-height multiplier

    /** Check page break; add new page if needed. Returns new y. */
    function ensureSpace(needed) {
        if (y + needed > BOTTOM) { doc.addPage(); y = M; }
    }

    /** Render wrapped text. Returns y after text. */
    function text(str, size, style = 'normal', opts = {}) {
        const { indent = 0, align = 'left', maxWidth = CW } = opts;
        doc.setFont('times', style);
        doc.setFontSize(size);
        const w = maxWidth - indent;
        const lines = doc.splitTextToSize(str, w);
        const lineH = size * LH;
        ensureSpace(lines.length * lineH);
        const xBase = M + indent;
        for (const line of lines) {
            let x = xBase;
            if (align === 'center') x = PW / 2;
            doc.text(line, x, y, { align });
            y += lineH;
        }
        return y;
    }

    /** Thin horizontal rule spanning the content width. */
    function rule() {
        ensureSpace(6);
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(M, y, PW - M, y);
        y += 6;
    }

    /** Section heading: UPPERCASE bold, then thin rule 1pt below. */
    function sectionHead(title) {
        y += 9;
        ensureSpace(18);
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text(title.toUpperCase(), M, y);
        y += 2 * LH;
        // Rule 1pt below the text baseline
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(M, y + 1, PW - M, y + 1);
        y += 17; // gap after rule before content
    }

    /** Render multi-line description as bullet points (•). */
    function bullets(desc, size = 9) {
        if (!desc) return;
        const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            const bullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('–')
                ? line.replace(/^[•\-–]\s*/, '• ')
                : '• ' + line;
            text(bullet, size, 'normal', { indent: 8 });
        }
    }

    // =========== HEADER ===========
    const p = cvData.personalInfo;
    if (p.name) {
        text(p.name, 16, 'bold', { align: 'center' });
    }
    const contact = [p.email, p.phone, p.location].filter(Boolean);
    if (contact.length) {
        text(contact.join('  ·  '), 9, 'normal', { align: 'center' });
    }
    const links = [p.linkedin, p.website].filter(Boolean);
    if (links.length) {
        text(links.join('  ·  '), 9, 'normal', { align: 'center' });
    }
    y += 4; // small gap before first section

    // =========== SUMMARY ===========
    if (p.summary) {
        sectionHead('Summary');
        text(p.summary, 9);
    }

    // =========== EDUCATION ===========
    if (cvData.education.length) {
        sectionHead('Education');
        cvData.education.forEach(e => {
            ensureSpace(12);
            // Row 1: Degree + field (bold, left) + dates (right)
            const degreeLine = `${e.degree || ''}${e.field ? ' in ' + e.field : ''}`.trim();
            const dates = [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ');
            doc.setFont('times', 'bold'); doc.setFontSize(9.5);
            if (degreeLine) doc.text(degreeLine, M, y);
            if (dates) { doc.setFont('times', 'normal'); doc.setFontSize(9); doc.text(dates, PW - M, y, { align: 'right' }); }
            y += 11;
            // Row 2: School name italic
            if (e.school) { text(e.school, 9, 'italic', { indent: 4 }); }
            if (e.gpa) { text('GPA: ' + e.gpa, 9, 'normal', { indent: 4 }); }
            bullets(e.description);
            y += 2;
        });
    }

    // =========== EXPERIENCE ===========
    if (cvData.experience.length) {
        sectionHead('Experience');
        cvData.experience.forEach(e => {
            ensureSpace(12);
            // Row 1: Bold job title (left) + date range (right)
            const dates = [e.startDate, e.endDate].filter(Boolean).join(' \u2013 ');
            doc.setFont('times', 'bold'); doc.setFontSize(9.5);
            if (e.title) doc.text(e.title, M, y);
            if (dates) { doc.setFont('times', 'normal'); doc.setFontSize(9); doc.text(dates, PW - M, y, { align: 'right' }); }
            y += 11;
            // Row 2: Italic company + location
            const compLine = [e.company, e.location].filter(Boolean).join('  \u2014  ');
            if (compLine) { text(compLine, 9, 'italic', { indent: 4 }); }
            bullets(e.description);
            y += 2;
        });
    }

    // =========== SKILLS ===========
    if (cvData.skills?.length) {
        sectionHead('Skills');
        // Render skills as wrapped comma-separated text respecting content width
        const skillStr = cvData.skills.join(',  ');
        text(skillStr, 9, 'normal', { maxWidth: CW });
        y += 2;
    }

    // =========== CUSTOM SECTIONS ===========
    if (cvData.customSections?.length) {
        cvData.customSections.forEach(sec => {
            if (!sec.title) return;
            sectionHead(sec.title);
            sec.items.forEach(item => {
                ensureSpace(12);
                // Row 1: Title (bold, left) + date (right)
                if (item.title || item.date) {
                    doc.setFont('times', 'bold'); doc.setFontSize(9.5);
                    if (item.title) doc.text(item.title, M, y);
                    if (item.date) { doc.setFont('times', 'normal'); doc.setFontSize(9); doc.text(item.date, PW - M, y, { align: 'right' }); }
                    y += 11;
                }
                // Row 2: Subtitle italic
                if (item.subtitle) { text(item.subtitle, 9, 'italic', { indent: 4 }); }
                bullets(item.description);
                y += 2;
            });
        });
    }

    doc.save(`${(p.name || 'resume').replace(/\s+/g, '_')}_CV.pdf`);
    showStatus('✓ PDF exported successfully!', true);
}

// --- PDF Import & Parse using xitanggg/open-resume (open-resume-lib) ---
// Uses the parseResumeFromPdf function from the open-resume library by xitanggg.
// The library internally handles pdfjs text extraction, line grouping, section
// detection, and structured field extraction — giving far more accurate results
// than a hand-rolled heuristic parser.
async function importPdf(file) {
    showStatus('Parsing PDF — loading open-resume parser...', true);
    try {
        // Dynamically import open-resume-lib from esm.sh (xitanggg/open-resume)
        const { parseResumeFromPdf } = await import(
            'https://esm.sh/open-resume-lib@1.0.3'
        );

        // parseResumeFromPdf expects a URL string; create an Object URL from
        // the uploaded File so the library's internal pdfjs can fetch it.
        const fileUrl = URL.createObjectURL(file);

        showStatus('Parsing PDF...', true);
        let resume;
        try {
            resume = await parseResumeFromPdf(fileUrl);
        } finally {
            URL.revokeObjectURL(fileUrl);
        }

        console.log('open-resume parsed result:', resume);

        // --- Map open-resume Resume → our cvData structure ---
        const profile = resume.profile || {};

        // Split the date string "Sep 2020 - Jun 2024" into start/end
        const splitDate = (dateStr) => {
            if (!dateStr) return { start: '', end: '' };
            const parts = dateStr.split(/\s*[-–—]\s*/);
            return { start: parts[0]?.trim() || '', end: parts[1]?.trim() || '' };
        };

        const parsed = {
            personalInfo: {
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                linkedin: (profile.url && /linkedin/i.test(profile.url)) ? profile.url : '',
                website: (profile.url && !/linkedin/i.test(profile.url)) ? profile.url : '',
                summary: profile.summary || '',
            },
            education: (resume.educations || []).map(edu => {
                const d = splitDate(edu.date);
                return {
                    school: edu.school || '',
                    degree: edu.degree || '',
                    field: '',
                    gpa: edu.gpa || '',
                    startDate: d.start,
                    endDate: d.end,
                    description: (edu.descriptions || []).join('\n'),
                };
            }),
            experience: (resume.workExperiences || []).map(exp => {
                const d = splitDate(exp.date);
                return {
                    company: exp.company || '',
                    title: exp.jobTitle || '',
                    location: exp.location || '',
                    startDate: d.start,
                    endDate: d.end,
                    description: (exp.descriptions || []).join('\n'),
                };
            }),
            skills: [],
            customSections: [],
        };

        // Skills: open-resume returns { featuredSkills: [{skill, rating}], descriptions: [] }
        const sk = resume.skills || {};
        if (sk.featuredSkills?.length) {
            parsed.skills.push(...sk.featuredSkills.filter(fs => fs?.skill).map(fs => fs.skill));
        }
        if (sk.descriptions?.length) {
            // Skill description lines often contain comma-separated lists
            for (const line of sk.descriptions) {
                if (!line) continue;
                const parts = line.split(/[,•·|;]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60);
                parsed.skills.push(...parts);
            }
        }
        parsed.skills = [...new Set(parsed.skills)].slice(0, 40);

        // Projects → custom section
        if (resume.projects?.length) {
            parsed.customSections.push({
                title: 'Projects',
                items: resume.projects.map(p => ({
                    title: p.project || '',
                    subtitle: '',
                    date: p.date || '',
                    description: (p.descriptions || []).join('\n'),
                })),
            });
        }

        // Custom section (catch-all from open-resume)
        if (resume.custom?.descriptions?.length) {
            parsed.customSections.push({
                title: 'Additional',
                items: [{
                    title: '',
                    subtitle: '',
                    date: '',
                    description: resume.custom.descriptions.join('\n'),
                }],
            });
        }

        cvData = parsed;
        showStatus('✓ PDF imported via open-resume! Review and correct any fields.', true);
        const app = document.getElementById('app');
        app.innerHTML = await renderCvBuilder(true);
        attachCvBuilderEvents();
    } catch (err) {
        console.error('PDF parse error:', err);
        showStatus('Failed to parse PDF: ' + err.message, false);
    }
}

export function attachCvBuilderEvents() {
    // Save
    document.getElementById('cv-save-btn')?.addEventListener('click', async () => {
        gatherFormData();
        const btn = document.getElementById('cv-save-btn');
        btn.textContent = 'SAVING...'; btn.disabled = true;
        const res = await apiCall('/cv', 'PUT', { cv: cvData });
        if (res.success) { showStatus('✓ CV saved successfully!', true); }
        else { showStatus(res.error || 'Save failed.', false); }
        btn.textContent = '💾 Save CV'; btn.disabled = false;
    });

    // Export PDF
    document.getElementById('cv-export-btn')?.addEventListener('click', () => {
        gatherFormData();
        exportPdf();
    });

    // Import PDF
    const uploadBtn = document.getElementById('cv-upload-btn');
    const fileInput = document.getElementById('cv-pdf-input');
    uploadBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) importPdf(file);
    });

    // Add Education
    document.getElementById('add-edu-btn')?.addEventListener('click', () => {
        gatherFormData();
        cvData.education.push(emptyEdu());
        const list = document.getElementById('edu-list');
        list.innerHTML = cvData.education.map((e, i) => eduBlock(e, i)).join('');
        attachRemoveHandlers();
    });

    // Add Experience
    document.getElementById('add-exp-btn')?.addEventListener('click', () => {
        gatherFormData();
        cvData.experience.push(emptyExp());
        const list = document.getElementById('exp-list');
        list.innerHTML = cvData.experience.map((e, i) => expBlock(e, i)).join('');
        attachRemoveHandlers();
    });

    // Add Skill
    const addSkill = () => {
        const input = document.getElementById('skill-input');
        const val = input?.value?.trim();
        if (val && !cvData.skills.includes(val)) {
            cvData.skills.push(val);
            input.value = '';
            renderSkillTags();
        }
    };
    document.getElementById('add-skill-btn')?.addEventListener('click', addSkill);
    document.getElementById('skill-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });

    // Custom Sections
    document.getElementById('add-custom-section-btn')?.addEventListener('click', () => {
        gatherFormData();
        if (!cvData.customSections) cvData.customSections = [];
        cvData.customSections.push(emptyCustomSection());
        const list = document.getElementById('custom-sections-container');
        list.innerHTML = cvData.customSections.map((s, i) => customSectionBlock(s, i)).join('');
        attachRemoveHandlers();
    });

    attachRemoveHandlers();
}

function attachRemoveHandlers() {
    document.querySelectorAll('.remove-edu').forEach(btn => {
        btn.addEventListener('click', () => {
            gatherFormData();
            cvData.education.splice(parseInt(btn.dataset.idx), 1);
            document.getElementById('edu-list').innerHTML = cvData.education.map((e, i) => eduBlock(e, i)).join('');
            attachRemoveHandlers();
        });
    });
    document.querySelectorAll('.remove-exp').forEach(btn => {
        btn.addEventListener('click', () => {
            gatherFormData();
            cvData.experience.splice(parseInt(btn.dataset.idx), 1);
            document.getElementById('exp-list').innerHTML = cvData.experience.map((e, i) => expBlock(e, i)).join('');
            attachRemoveHandlers();
        });
    });
    document.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', () => {
            cvData.skills.splice(parseInt(btn.dataset.idx), 1);
            renderSkillTags();
        });
    });

    // Custom Section Handlers
    document.querySelectorAll('.add-custom-item').forEach(btn => {
        btn.addEventListener('click', () => {
            gatherFormData();
            const sIdx = parseInt(btn.dataset.sidx);
            cvData.customSections[sIdx].items.push(emptyCustomItem());
            document.getElementById('custom-sections-container').innerHTML = cvData.customSections.map((s, i) => customSectionBlock(s, i)).join('');
            attachRemoveHandlers();
        });
    });
    document.querySelectorAll('.remove-custom-section').forEach(btn => {
        btn.addEventListener('click', () => {
            gatherFormData();
            const sIdx = parseInt(btn.dataset.sidx);
            cvData.customSections.splice(sIdx, 1);
            document.getElementById('custom-sections-container').innerHTML = cvData.customSections.map((s, i) => customSectionBlock(s, i)).join('');
            attachRemoveHandlers();
        });
    });
    document.querySelectorAll('.remove-custom-item').forEach(btn => {
        btn.addEventListener('click', () => {
            gatherFormData();
            const sIdx = parseInt(btn.dataset.sidx);
            const iIdx = parseInt(btn.dataset.iidx);
            cvData.customSections[sIdx].items.splice(iIdx, 1);
            document.getElementById('custom-sections-container').innerHTML = cvData.customSections.map((s, i) => customSectionBlock(s, i)).join('');
            attachRemoveHandlers();
        });
    });
}

function renderSkillTags() {
    const container = document.getElementById('skills-tags');
    if (!container) return;
    container.innerHTML = cvData.skills.map((s, i) => `<span class="inline-flex items-center gap-1 bg-black text-white font-mono text-xs px-3 py-1 border-2 border-black">${esc(s)} <button class="remove-skill ml-1 text-[#ff2a2a] font-bold hover:text-white" data-idx="${i}">×</button></span>`).join('');
    attachRemoveHandlers();
}