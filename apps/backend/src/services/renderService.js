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

function renderContact(contact = {}) {
  const name = contact.name ? `<div class="name">${escapeHtml(contact.name).toUpperCase()}</div>` : '';

  const lineParts = [
    contact.phone ? escapeHtml(contact.phone) : '',
    contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : '',
    contact.location ? escapeHtml(contact.location) : '',
    ...(contact.links || []).map((l) => `<a href="${escapeHtml(l.url)}">${escapeHtml(l.url)}</a>`)
  ].filter(Boolean);

  const line = lineParts.length > 0 ? `<div class="contact">${lineParts.join(' | ')}</div>` : '';

  return name || line ? `${name}\n${line}` : '';
}

function renderSummary(summary) {
  if (!summary) return '';
  return `
    <div class="sec">PROFESSIONAL PROFILE</div>
    <p class="profile">${escapeHtml(summary)}</p>`;
}

function renderWorkHistory(workHistory = []) {
  if (workHistory.length === 0) return '';

  const entries = workHistory
    .map((entry) => {
      const bullets =
        (entry.bullets || []).length > 0
          ? `<ul>${entry.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
          : '';
      const titleOrg = [entry.title, entry.organization].filter(Boolean).map(escapeHtml).join(' | ');
      const dates = [entry.startDate, entry.endDate].filter(Boolean).map(escapeHtml).join(' – ');
      return `
        <div class="entry"><span class="title">${titleOrg}</span><span class="meta">${dates}</span></div>
        ${bullets}`;
    })
    .join('');

  return `
    <div class="sec">CAREER SUMMARY</div>
    ${entries}`;
}

function renderSkills(skills = []) {
  if (skills.length === 0) return '';
  return `
    <div class="sec">TECHNICAL SKILLS</div>
    <div class="skills">
      <div class="srow"><div class="k">Core Skills</div><div class="v">${skills.map(escapeHtml).join(', ')}</div></div>
    </div>`;
}

function renderEducation(education = []) {
  if (education.length === 0) return '';

  const entries = education
    .map(
      (entry) => {
        const degField = [entry.credential, entry.field].filter(Boolean).map(escapeHtml).join(', ');
        const dates = [entry.startDate, entry.endDate].filter(Boolean).map(escapeHtml).join(' – ');
        return `
          <div class="edu">
            <span class="deg">${degField}</span>
            <span class="inst">${escapeHtml(entry.institution)}</span>
            <span class="yr">${dates}</span>
          </div>`;
      }
    )
    .join('');

  return `
    <div class="sec">EDUCATION</div>
    ${entries}`;
}

function renderAchievements(achievements = []) {
  if (achievements.length === 0) return '';
  return `
    <div class="sec">ACHIEVEMENTS</div>
    <ul>${achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`;
}

function renderAdditionalSections(sections = []) {
  return sections
    .filter((section) => section.title && (section.items || []).length > 0)
    .map(
      (section) => `
        <div class="sec">${escapeHtml(section.title).toUpperCase()}</div>
        <ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
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
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Auto-scale font size to fit exactly on one page
    await page.evaluate(() => {
      const htmlEl = document.documentElement;
      const wrapper = document.querySelector('.content-wrapper');
      
      // Target max height: 29.7cm (A4 height) - 1.6cm (top/bottom padding) approx 1062px
      const TARGET_HEIGHT_PX = 1062; 
      const MIN_FONT_PT = 7.5;
      const MAX_FONT_PT = 11.5;
      let currentFontSize = MAX_FONT_PT;
      
      htmlEl.style.fontSize = currentFontSize + 'pt';
      
      // Decrease font size until content fits within the page or hits minimum size
      while (wrapper.offsetHeight > TARGET_HEIGHT_PX && currentFontSize > MIN_FONT_PT) {
          currentFontSize -= 0.1;
          htmlEl.style.fontSize = currentFontSize + 'pt';
      }
    });

    const pdfBytes = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' },
    });
    return Buffer.from(pdfBytes);
  } finally {
    await page.close();
  }
}
