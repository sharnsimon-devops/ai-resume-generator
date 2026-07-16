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
  const name = contact.name ? `<div class="contact-name">${escapeHtml(contact.name)}</div>` : '';

  const lineParts = [contact.email, contact.phone, contact.location, ...(contact.links || []).map((l) => l.url)]
    .filter(Boolean)
    .map(escapeHtml);

  const line = lineParts.length > 0 ? `<div class="contact-line">${lineParts.join(' · ')}</div>` : '';

  return name || line ? `${name}${line}` : '';
}

function renderSummary(summary) {
  if (!summary) return '';
  return `
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${escapeHtml(summary)}</p>
    </div>`;
}

function renderWorkHistory(workHistory = []) {
  if (workHistory.length === 0) return '';

  const entries = workHistory
    .map((entry) => {
      const bullets =
        (entry.bullets || []).length > 0
          ? `<ul>${entry.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
          : '';
      return `
        <div class="entry">
          <div class="entry-header"><span>${escapeHtml(entry.title)}</span><span>${escapeHtml(entry.startDate)} – ${escapeHtml(entry.endDate)}</span></div>
          <div class="entry-subheader"><span>${escapeHtml(entry.organization)}</span><span>${escapeHtml(entry.location)}</span></div>
          ${bullets}
        </div>`;
    })
    .join('');

  return `
    <div class="section">
      <div class="section-title">Experience</div>
      ${entries}
    </div>`;
}

function renderSkills(skills = []) {
  if (skills.length === 0) return '';
  return `
    <div class="section">
      <div class="section-title">Skills</div>
      <p class="skills-list">${skills.map(escapeHtml).join(' · ')}</p>
    </div>`;
}

function renderEducation(education = []) {
  if (education.length === 0) return '';

  const entries = education
    .map(
      (entry) => `
        <div class="entry">
          <div class="entry-header"><span>${escapeHtml(entry.credential)}${entry.field ? ', ' + escapeHtml(entry.field) : ''}</span><span>${escapeHtml(entry.startDate)} – ${escapeHtml(entry.endDate)}</span></div>
          <div class="entry-subheader"><span>${escapeHtml(entry.institution)}</span></div>
        </div>`,
    )
    .join('');

  return `
    <div class="section">
      <div class="section-title">Education</div>
      ${entries}
    </div>`;
}

function renderAchievements(achievements = []) {
  if (achievements.length === 0) return '';
  return `
    <div class="section">
      <div class="section-title">Achievements</div>
      <ul>${achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
    </div>`;
}

function renderAdditionalSections(sections = []) {
  return sections
    .filter((section) => section.title && (section.items || []).length > 0)
    .map(
      (section) => `
        <div class="section">
          <div class="section-title">${escapeHtml(section.title)}</div>
          <ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>`,
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
