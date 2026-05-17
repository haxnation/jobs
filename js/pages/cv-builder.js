import { currentUser } from '../app.js';
import { apiCall } from '../api.js';

let cvData = {
    personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
    education: [],
    experience: [],
    skills: []
};

function emptyEdu() { return { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '' }; }
function emptyExp() { return { company: '', title: '', location: '', startDate: '', endDate: '', description: '' }; }

export async function renderCvBuilder() {
    // Load existing CV
    const res = await apiCall('/cv');
    if (res.success && res.data?.cv) {
        cvData = { ...cvData, ...res.data.cv };
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
            <a href="/dashboard" class="nav-link font-mono text-xs font-bold uppercase tracking-widest bg-white text-black border-2 border-black px-6 py-3 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">← Dashboard</a>
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
    `;
}

function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function personalField(id, label, val, type='text') {
    return `<div><label class="font-mono text-xs font-bold uppercase block mb-1">${label}</label><input id="${id}" type="${type}" value="${esc(val)}" class="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none focus:border-[#5ce1e6]"></div>`;
}

function eduBlock(e, i) {
    return `<div class="edu-entry border-2 border-dashed border-gray-400 p-4 mb-3" data-idx="${i}">
        <div class="flex justify-between mb-2"><span class="font-mono text-xs font-bold uppercase text-gray-500">Education #${i+1}</span><button class="remove-edu font-mono text-xs font-bold text-[#ff2a2a] uppercase" data-idx="${i}">Remove</button></div>
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
        <div class="flex justify-between mb-2"><span class="font-mono text-xs font-bold uppercase text-gray-500">Experience #${i+1}</span><button class="remove-exp font-mono text-xs font-bold text-[#ff2a2a] uppercase" data-idx="${i}">Remove</button></div>
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

// --- PDF Export using jsPDF ---
async function exportPdf() {
    gatherFormData();
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { showStatus('jsPDF not loaded. Please wait and try again.', false); return; }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, M = 20;
    let y = M;
    const maxW = W - 2 * M;

    function addText(text, size, bold, indent = 0) {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxW - indent);
        if (y + lines.length * (size * 0.45) > 280) { doc.addPage(); y = M; }
        doc.text(lines, M + indent, y);
        y += lines.length * (size * 0.45) + 1;
    }

    function addLine() {
        doc.setDrawColor(0); doc.setLineWidth(0.5);
        doc.line(M, y, W - M, y); y += 3;
    }

    // Header
    const p = cvData.personalInfo;
    if (p.name) addText(p.name, 18, true);
    const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean);
    if (contactParts.length) addText(contactParts.join('  |  '), 9, false);
    y += 2; addLine();

    if (p.summary) { addText('PROFESSIONAL SUMMARY', 11, true); addText(p.summary, 9, false); y += 2; }

    if (cvData.experience.length) {
        addText('WORK EXPERIENCE', 11, true); addLine();
        cvData.experience.forEach(e => {
            addText(`${e.title}${e.company ? ' — ' + e.company : ''}`, 10, true);
            const meta = [e.location, [e.startDate, e.endDate].filter(Boolean).join(' – ')].filter(Boolean).join('  |  ');
            if (meta) addText(meta, 8, false);
            if (e.description) addText(e.description, 9, false, 4);
            y += 2;
        });
    }

    if (cvData.education.length) {
        addText('EDUCATION', 11, true); addLine();
        cvData.education.forEach(e => {
            addText(`${e.degree}${e.field ? ' in ' + e.field : ''}${e.school ? ' — ' + e.school : ''}`, 10, true);
            const meta = [[e.startDate, e.endDate].filter(Boolean).join(' – '), e.gpa ? 'GPA: ' + e.gpa : ''].filter(Boolean).join('  |  ');
            if (meta) addText(meta, 8, false);
            if (e.description) addText(e.description, 9, false, 4);
            y += 2;
        });
    }

    if (cvData.skills.length) {
        addText('SKILLS', 11, true); addLine();
        addText(cvData.skills.join('  •  '), 9, false);
    }

    doc.save(`${(p.name || 'resume').replace(/\s+/g, '_')}_CV.pdf`);
    showStatus('✓ PDF exported successfully!', true);
}

// --- PDF Import & Parse (heuristic, inspired by OpenResume) ---
async function importPdf(file) {
    showStatus('Parsing PDF...', true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) { showStatus('pdf.js not loaded yet. Please wait.', false); return; }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        // Heuristic parsing
        const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
        const parsed = { personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' }, education: [], experience: [], skills: [] };

        // Extract email
        const emailMatch = fullText.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
        if (emailMatch) parsed.personalInfo.email = emailMatch[0];

        // Extract phone
        const phoneMatch = fullText.match(/(\+?\d[\d\s\-().]{7,}\d)/);
        if (phoneMatch) parsed.personalInfo.phone = phoneMatch[0].trim();

        // Extract LinkedIn
        const linkedinMatch = fullText.match(/linkedin\.com\/in\/[\w-]+/i);
        if (linkedinMatch) parsed.personalInfo.linkedin = 'https://' + linkedinMatch[0];

        // Name is usually the first significant line
        if (lines.length) {
            const firstLine = lines[0].replace(/[|•·,]/g, '').trim();
            if (firstLine.length < 60 && !firstLine.includes('@') && !/\d{3}/.test(firstLine)) {
                parsed.personalInfo.name = firstLine;
            }
        }

        // Section detection via keywords
        const sectionKeywords = {
            experience: /^(work\s*experience|experience|employment|professional\s*experience|work\s*history)/i,
            education: /^(education|academic|qualifications)/i,
            skills: /^(skills|technical\s*skills|core\s*competencies|competencies|technologies)/i,
            summary: /^(summary|objective|profile|professional\s*summary|about)/i
        };

        let currentSection = null;
        let sectionLines = { experience: [], education: [], skills: [], summary: [] };

        for (const line of lines.slice(1)) {
            let matched = false;
            for (const [section, regex] of Object.entries(sectionKeywords)) {
                if (regex.test(line)) { currentSection = section; matched = true; break; }
            }
            if (!matched && currentSection) sectionLines[currentSection].push(line);
        }

        if (sectionLines.summary.length) {
            parsed.personalInfo.summary = sectionLines.summary.join(' ').substring(0, 500);
        }

        if (sectionLines.skills.length) {
            const skillText = sectionLines.skills.join(' ');
            parsed.skills = skillText.split(/[,;•·|]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40);
        }

        // Basic experience/education block splitting (by date patterns)
        const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\b.*\d{4}/i;

        if (sectionLines.experience.length) {
            let block = { company: '', title: '', location: '', startDate: '', endDate: '', description: '' };
            let descParts = [];
            for (const line of sectionLines.experience) {
                if (datePattern.test(line) && (block.title || block.company)) {
                    block.description = descParts.join(' ');
                    parsed.experience.push({ ...block });
                    block = { company: '', title: '', location: '', startDate: '', endDate: '', description: '' };
                    descParts = [];
                }
                if (!block.title && !datePattern.test(line)) { block.title = line; }
                else if (!block.company && !datePattern.test(line) && block.title) { block.company = line; }
                else if (datePattern.test(line)) {
                    const parts = line.split(/[-–—]/);
                    block.startDate = parts[0]?.trim() || '';
                    block.endDate = parts[1]?.trim() || '';
                } else { descParts.push(line); }
            }
            block.description = descParts.join(' ');
            if (block.title || block.company) parsed.experience.push(block);
        }

        if (sectionLines.education.length) {
            let block = emptyEdu();
            for (const line of sectionLines.education) {
                if (!block.school) { block.school = line; }
                else if (!block.degree) { block.degree = line; }
                else if (datePattern.test(line)) {
                    const parts = line.split(/[-–—]/);
                    block.startDate = parts[0]?.trim() || '';
                    block.endDate = parts[1]?.trim() || '';
                }
            }
            if (block.school) parsed.education.push(block);
        }

        cvData = parsed;
        showStatus('✓ PDF parsed! Review and save your data.', true);
        // Re-render form with parsed data
        const app = document.getElementById('app');
        const { renderCvBuilder, attachCvBuilderEvents } = await import('./cv-builder.js');
        app.innerHTML = await renderCvBuilder();
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
}

function renderSkillTags() {
    const container = document.getElementById('skills-tags');
    if (!container) return;
    container.innerHTML = cvData.skills.map((s, i) => `<span class="inline-flex items-center gap-1 bg-black text-white font-mono text-xs px-3 py-1 border-2 border-black">${esc(s)} <button class="remove-skill ml-1 text-[#ff2a2a] font-bold hover:text-white" data-idx="${i}">×</button></span>`).join('');
    attachRemoveHandlers();
}
