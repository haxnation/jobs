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

        <!-- Custom Sections (Custom Columns) -->
        <div id="custom-sections-container">
            ${(cvData.customSections || []).map((sec, sIdx) => customSectionBlock(sec, sIdx)).join('')}
        </div>
        <button id="add-custom-section-btn" class="mb-8 font-mono text-xs font-bold uppercase bg-white text-black border-2 border-black px-4 py-2 shadow-[4px_4px_0_0_#0b0b0b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0b0b0b] transition-all duration-75">+ Add Custom Section</button>
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
        <div class="flex justify-between mb-2"><span class="font-mono text-xs font-bold uppercase text-gray-500">Item #${iIdx+1}</span><button class="remove-custom-item font-mono text-xs font-bold text-[#ff2a2a] uppercase" data-sidx="${sIdx}" data-iidx="${iIdx}">Remove</button></div>
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

    if (cvData.skills && cvData.skills.length) {
        addText('SKILLS', 11, true); addLine();
        addText(cvData.skills.join('  •  '), 9, false);
        y += 2;
    }

    if (cvData.customSections && cvData.customSections.length) {
        cvData.customSections.forEach(sec => {
            if (!sec.title) return;
            addText(sec.title.toUpperCase(), 11, true); addLine();
            sec.items.forEach(item => {
                addText(`${item.title}${item.subtitle ? ' — ' + item.subtitle : ''}`, 10, true);
                if (item.date) addText(item.date, 8, false);
                if (item.description) addText(item.description, 9, false, 4);
                y += 2;
            });
        });
    }

    doc.save(`${(p.name || 'resume').replace(/\s+/g, '_')}_CV.pdf`);
    showStatus('✓ PDF exported successfully!', true);
}

// --- PDF Import & Parse (Using OpenResume Library) ---
async function importPdf(file) {
    showStatus('Parsing PDF with OpenResume library...', true);
    try {
        // Dynamically import the OpenResume PDF parser library from esm.sh
        const { parseResumeFromPdf } = await import('https://esm.sh/@prolaxu/open-resume-pdf-parser@0.1.2');
        
        // Ensure pdf.js worker is properly configured for the library by using the exact internal URL esm.sh resolves
        const pdfjsLib = await import('https://esm.sh/pdfjs-dist@^5.4.449?target=es2022');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@5.4.449/build/pdf.worker.mjs?target=es2022';
        window.pdfjsLib = pdfjsLib;

        const url = URL.createObjectURL(file);
        const resume = await parseResumeFromPdf(url);
        URL.revokeObjectURL(url);
        
        console.log("OpenResume Extracted:", resume);

        const parsed = { personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' }, education: [], experience: [], skills: [], customSections: [] };

        if (resume.profile) {
            parsed.personalInfo.name = resume.profile.name || '';
            parsed.personalInfo.email = resume.profile.email || '';
            parsed.personalInfo.phone = resume.profile.phone || '';
            parsed.personalInfo.location = resume.profile.location || '';
            parsed.personalInfo.linkedin = resume.profile.url || '';
            parsed.personalInfo.summary = resume.profile.summary || '';
        }

        if (resume.educations) {
            parsed.education = resume.educations.map(e => {
                const dates = (e.date || '').split(/[-–—]| to /i);
                return {
                    school: e.school || '',
                    degree: e.degree || '',
                    field: '', 
                    gpa: e.gpa || '',
                    startDate: dates[0]?.trim() || '',
                    endDate: dates[1]?.trim() || '',
                    description: (e.descriptions || []).join('\n')
                };
            });
        }

        if (resume.workExperiences) {
            parsed.experience = resume.workExperiences.map(e => {
                const dates = (e.date || '').split(/[-–—]| to /i);
                return {
                    company: e.company || '',
                    title: e.jobTitle || '',
                    location: '',
                    startDate: dates[0]?.trim() || '',
                    endDate: dates[1]?.trim() || '',
                    description: (e.descriptions || []).join('\n')
                };
            });
        }

        if (resume.skills && resume.skills.featuredSkills) {
            parsed.skills = resume.skills.featuredSkills.map(s => s.skill).filter(Boolean);
            if (resume.skills.descriptions && resume.skills.descriptions.length > 0) {
                const otherSkills = resume.skills.descriptions.join(', ').split(/[,•·|;]/).map(s => s.trim()).filter(Boolean);
                parsed.skills = [...new Set([...parsed.skills, ...otherSkills])].slice(0, 30);
            }
        }
        
        if (resume.projects && resume.projects.length > 0) {
            parsed.customSections.push({
                title: 'PROJECTS',
                items: resume.projects.map(p => ({
                    title: p.project || '',
                    subtitle: '',
                    date: p.date || '',
                    description: (p.descriptions || []).join('\n')
                }))
            });
        }
        
        if (resume.certifications && resume.certifications.length > 0) {
            parsed.customSections.push({
                title: 'CERTIFICATIONS',
                items: [{ title: '', subtitle: '', date: '', description: resume.certifications.join('\n') }]
            });
        }
        
        if (resume.languages && resume.languages.length > 0) {
            parsed.customSections.push({
                title: 'LANGUAGES',
                items: [{ title: '', subtitle: '', date: '', description: resume.languages.join(', ') }]
            });
        }

        // Preserve any custom sections from existing data if not overwritten
        const existingCustomTitles = parsed.customSections.map(s => s.title.toLowerCase());
        (cvData.customSections || []).forEach(sec => {
            if (!existingCustomTitles.includes(sec.title.toLowerCase())) {
                parsed.customSections.push(sec);
            }
        });
        
        cvData = parsed;
        showStatus('✓ PDF parsed using OpenResume library!', true);
        // Re-render form with parsed data, passing true to skip fetching from backend
        const app = document.getElementById('app');
        const { renderCvBuilder, attachCvBuilderEvents } = await import('./cv-builder.js');
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
