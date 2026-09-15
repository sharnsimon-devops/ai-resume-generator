import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_HTML_PATH = path.join(__dirname, '../templates/html/resume-template.html');
const TEMPLATE_CSS_PATH = path.join(__dirname, '../templates/html/resume-template.css');

let browserPromise;

export function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    browserPromise = undefined;
    await browser.close();
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatText(value) {
  return escapeHtml(value).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function renderContact(contact = {}) {
  const name = contact.name ? `<div class="name">${escapeHtml(contact.name).toUpperCase()}</div>` : '';

  const lineParts = [
    contact.phone ? escapeHtml(contact.phone) : '',
    contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : '',
    contact.location ? escapeHtml(contact.location) : '',
    ...(contact.links || []).map((l) => `<a href="${escapeHtml(l.url)}">${escapeHtml(l.url)}</a>`)
  ].filter(Boolean);

  const contactLine = lineParts.length > 0 ? `<div class="contact-line">${lineParts.join(' | ')}</div>` : '';

  return name || contactLine ? `${name}\n${contactLine}` : '';
}

function renderSummary(summary) {
  if (!summary) return '';
  return `
    <h2 class="section">Professional Profile</h2>
    <p class="profile">${formatText(summary)}</p>`;
}

function renderWorkHistory(workHistory = []) {
  if (workHistory.length === 0) return '';

  const entries = workHistory
    .map((entry) => {
      const bullets =
        (entry.bullets || []).length > 0
          ? `<ul class="bullets">${entry.bullets.map((b) => `<li>${formatText(b)}</li>`).join('')}</ul>`
          : '';
      
      const companyHtml = entry.organization ? `<span class="role-company">| ${escapeHtml(entry.organization)}</span>` : '';
      const titleHtml = entry.title ? `<span class="role-title">${escapeHtml(entry.title)} ${companyHtml}</span>` : companyHtml;
      
      const dates = [entry.startDate, entry.endDate].filter(Boolean).map(escapeHtml).join(' – ');
      return `
        <div class="role-block">
          <div class="role-header">
            ${titleHtml}
            <span class="role-dates">${dates}</span>
          </div>
          ${bullets}
        </div>`;
    })
    .join('');

  return `
    <h2 class="section">Career Summary</h2>
    ${entries}`;
}

function renderSkills(skills = []) {
  if (skills.length === 0) return '';
  
  const rows = [];
  const uncategorized = [];
  
  skills.forEach(skill => {
    const colonIndex = skill.indexOf(':');
    if (colonIndex !== -1) {
      const category = skill.substring(0, colonIndex).trim();
      const details = skill.substring(colonIndex + 1).trim();
      
      const formattedCategory = formatText(category);
      const formattedDetails = formatText(details);
      rows.push(`<tr><td class="label">${formattedCategory}</td><td>${formattedDetails}</td></tr>`);
    } else {
      uncategorized.push(formatText(skill));
    }
  });

  if (uncategorized.length > 0) {
    rows.push(`<tr><td class="label">Core Skills</td><td>${uncategorized.join(', ')}</td></tr>`);
  }

  return `
    <h2 class="section">Technical Skills</h2>
    <table class="skills">
      ${rows.join('\n')}
    </table>`;
}

function renderEducation(education = []) {
  if (education.length === 0) return '';

  const entries = education
    .map(
      (entry) => {
        const degField = [entry.credential, entry.field].filter(Boolean).map(escapeHtml).join(', ');
        const institutionHtml = entry.institution ? `<span class="project-sub">${escapeHtml(entry.institution)}</span>` : '';
        const dates = [entry.startDate, entry.endDate].filter(Boolean).map(escapeHtml).join(' – ');
        return `
          <div class="edu-block">
            <div class="edu-header">
              <span>${degField} ${institutionHtml}</span>
              <span>${dates}</span>
            </div>
          </div>`;
      }
    )
    .join('');

  return `
    <h2 class="section">Education</h2>
    ${entries}`;
}

function renderAchievements(achievements = []) {
  if (achievements.length === 0) return '';
  return `
    <h2 class="section">Key Projects / Achievements</h2>
    <div class="project-block">
      <ul class="bullets">${achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
    </div>`;
}

function renderAdditionalSections(sections = []) {
  return sections
    .filter((section) => section.title && (section.items || []).length > 0)
    .map(
      (section) => `
        <h2 class="section">${escapeHtml(section.title).toUpperCase()}</h2>
        <div class="project-block">
          <ul class="bullets">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>`
    )
    .join('');
}

function buildBodyHtml(resume) {
  return [
    renderContact(resume.contact),
    renderSummary(resume.summary),
    renderWorkHistory(resume.workHistory),
    renderSkills(resume.skills),
    renderEducation(resume.education),
    renderAchievements(resume.achievements),
    renderAdditionalSections(resume.additionalSections),
  ]
    .filter(Boolean)
    .join('\n');
}

export async function renderResumeToPdf(verifiedResumeJson) {
  const [templateHtml, templateCss] = await Promise.all([
    fs.readFile(TEMPLATE_HTML_PATH, 'utf8'),
    fs.readFile(TEMPLATE_CSS_PATH, 'utf8'),
  ]);

  const html = templateHtml
    .replace('{{STYLES}}', `<style>${templateCss}</style>`)
    .replace('{{BODY}}', buildBodyHtml(verifiedResumeJson));

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // Wait until network is idle so Google Fonts have time to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Crucial: emulate print media BEFORE measuring so margins and paddings match the PDF
    await page.emulateMediaType('print');

    // Auto-scale font size to fit exactly on one page
    await page.evaluate(async () => {
      // Ensure fonts are fully loaded before measuring layout
      await document.fonts.ready;
      
      const htmlEl = document.documentElement;
      const body = document.body;
      
      // Target max height: 29.7cm (A4 height) - 1.4cm top and 1.4cm bottom padding (28mm) = 269mm.
      // 269mm at 96 DPI is approx 1016px.
      const TARGET_HEIGHT_PX = 1016; 
      
      // Define limits for how small or large the font can get
      const MIN_FONT_PT = 8.0;
      const MAX_FONT_PT = 13.5;
      
      // Base font size
      let currentFontSize = 11.0;
      htmlEl.style.fontSize = currentFontSize + 'pt';
      
      // If content exceeds one page, shrink it
      if (body.offsetHeight > TARGET_HEIGHT_PX) {
        while (body.offsetHeight > TARGET_HEIGHT_PX && currentFontSize > MIN_FONT_PT) {
            currentFontSize -= 0.1;
            htmlEl.style.fontSize = currentFontSize + 'pt';
        }
      } 
      // If content is too short (takes less than 85% of the page), grow it slightly
      else if (body.offsetHeight < TARGET_HEIGHT_PX * 0.85) {
        // Grow until it fills about 92% of the page, but don't exceed MAX_FONT_PT
        while (body.offsetHeight < TARGET_HEIGHT_PX * 0.92 && currentFontSize < MAX_FONT_PT) {
            currentFontSize += 0.1;
            htmlEl.style.fontSize = currentFontSize + 'pt';
        }
      }
    });

    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '16mm', right: '16mm' },
    });
    return Buffer.from(pdfBytes);
  } finally {
    await page.close();
  }
}
