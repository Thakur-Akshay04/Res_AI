
const puppeteer = require('puppeteer');
const fs = require('fs');
const logger = require('./logger');

const FONT_SEARCH_PATHS = {
  regular: [
    'C:\\Windows\\Fonts\\calibri.ttf',

    'C:\\Windows\\Fonts\\arial.ttf',

    '/usr/share/fonts/liberation/LiberationSans-Regular.ttf',

    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',

  
    '/usr/share/fonts/freefont/FreeSans.ttf',

    '/usr/share/fonts/truetype/freefont/FreeSans.ttf',

    '/usr/share/fonts/dejavu/DejaVuSans.ttf',

    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ],
  bold: [
    'C:\\Windows\\Fonts\\calibrib.ttf',
    'C:\\Windows\\Fonts\\arialbd.ttf',
    '/usr/share/fonts/liberation/LiberationSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    '/usr/share/fonts/freefont/FreeSansBold.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  ],
};

const readFontBase64 = (paths) => {
  for (const p of paths) {
    try { return fs.readFileSync(p).toString('base64'); } catch (_) {}
  }
  return null;
};

let _cachedFonts = null;
const getEmbeddedFontCSS = () => {
  if (_cachedFonts !== null) return _cachedFonts;
  const regular = readFontBase64(FONT_SEARCH_PATHS.regular);
  const bold    = readFontBase64(FONT_SEARCH_PATHS.bold);
  if (regular && bold) {
    _cachedFonts = `
      @font-face {
        font-family: 'ResumeFont';
        src: url('data:font/truetype;base64,${regular}') format('truetype');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'ResumeFont';
        src: url('data:font/truetype;base64,${bold}') format('truetype');
        font-weight: 700;
        font-style: normal;
      }`;
    logger.info('PDF font embedded from disk (base64)');
  } else {
    _cachedFonts = '';
    logger.warn('Could not load font from disk — PDF will use system sans-serif fallback');
  }
  return _cachedFonts;
};

const parseGithub = (val) => {
  if (!val) return { username: '', url: '' };
  let trimmed = val.trim();
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  
  let username = trimmed;
  let url = trimmed;
  
  if (trimmed.includes('github.com')) {
    const parts = trimmed.split('/');
    username = parts[parts.length - 1] || trimmed;
    const lowerTrimmed = trimmed.toLowerCase();
    if (!lowerTrimmed.startsWith('http://') && !lowerTrimmed.startsWith('https://')) {
      url = `https://${trimmed}`;
    }
  } else {
    username = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    url = `https://github.com/${username}`;
  }
  
  username = username.split('?')[0].split('#')[0];
  return { username, url };
};

const parseLinkedin = (val) => {
  if (!val) return { username: '', url: '' };
  let trimmed = val.trim();
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  
  let username = trimmed;
  let url = trimmed;
  
  if (trimmed.includes('linkedin.com')) {
    const parts = trimmed.split('/');
    const inIdx = parts.indexOf('in');
    if (inIdx !== -1 && parts[inIdx + 1]) {
      username = parts[inIdx + 1];
    } else {
      username = parts[parts.length - 1] || trimmed;
    }
    const lowerTrimmed = trimmed.toLowerCase();
    if (!lowerTrimmed.startsWith('http://') && !lowerTrimmed.startsWith('https://')) {
      url = `https://${trimmed}`;
    }
  } else {
    username = trimmed;
    url = `https://linkedin.com/in/${username}`;
  }
  
  username = username.split('?')[0].split('#')[0];
  return { username, url };
};

const formatProjectGithubUrl = (val) => {
  if (!val) return '';
  let url = val.trim();
  const lowerUrl = url.toLowerCase();
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    if (lowerUrl.startsWith('github.com')) {
      url = `https://${url}`;
    } else {
      url = `https://github.com/${url}`;
    }
  }
  return url;
};

const formatExternalUrl = (val) => {
  if (!val) return '';
  let url = val.trim();
  const lowerUrl = url.toLowerCase();
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
};

const generateResumeHTML = (personalInfo, content, template = 'modern', jobTitle = '') => {
  const { name, lastName, email, phone, address, linkedin, website, github } = personalInfo || {};
  const githubData = github ? parseGithub(github) : null;
  const linkedinData = linkedin ? parseLinkedin(linkedin) : null;
  const {
    summary = '',
    education = [],
    experience = [],
    projects = [],
    certifications = [],
    achievements = [],
    activities = [],
    skills = [],
    skillCategories = [],
    codingProfile = null,
  } = content || {};

  /* ── Contact row: plain text, no emoji, | separated ── */
  const contactParts = [
    phone,
    email,
    website,
    github,
    linkedin,
    address,
  ].filter(Boolean);

  /* ── SVG icons (inline, 12px, black fill) ── */
  const ICONS = {
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style="display:block;"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1-.24 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.6 10.8z"/></svg>`,
    email: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style="display:block;"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    globe: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style="display:block;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="black" style="display:block;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
    github: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="black" style="display:block;"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    pin: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="black" style="display:block;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  };

  /* ── HTML escape ── */
  const esc = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const pdfTitle = [name, lastName].filter(Boolean).join(' ') || 'Resume';
  const fullTitle = jobTitle ? `${pdfTitle} - ${jobTitle}` : pdfTitle;

  const fontFaceCSS = getEmbeddedFontCSS();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${esc(fullTitle)}</title>
      <style>
        ${fontFaceCSS}
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'ResumeFont', 'Liberation Sans', Arial, sans-serif;
          font-size: 12.5pt;
          color: #000000;
          line-height: 1.15;
          background: #ffffff;
        }

        /* Header / Name block */
        .header {
          text-align: center;
          margin-bottom: 10pt;
        }
        .header-name {
          font-size: 24.5pt;
          font-weight: bold;
          color: #000000;
          display: block;
          margin-bottom: 4pt;
        }
        .contact-line {
          font-size: 12pt;
          color: #000000;
        }

        /* Section headings */
        .section {
          margin-bottom: 10pt;
        }
        .section-heading {
          font-size: 15.5pt;
          font-weight: bold;
          color: #000000;
          border-bottom: 1pt solid #000000;
          padding-bottom: 1pt;
          margin-bottom: 6pt;
          margin-top: 10pt;
        }

        /* Two-column row: left content, right date/location */
        .row-flex {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          width: 100%;
        }
        .row-left { flex: 1; }
        .row-right {
          white-space: nowrap;
          margin-left: 12pt;
          font-size: 11.5pt;
          font-weight: normal;
        }

        /* Entry spacing */
        .entry { margin-bottom: 8pt; }

        /* Bold labels */
        .bold { font-weight: bold; }

        /* Role / sub-label text */
        .sub-text { font-size: 11.5pt; }

        /* Bullets */
        ul.ats-bullets {
          margin: 3pt 0 0 0;
          padding-left: 20pt;
          list-style-type: disc;
        }
        ul.ats-bullets li {
          font-size: 12.5pt;
          line-height: 1.15;
          margin-bottom: 2pt;
          color: #000000;
        }

        /* Skill categories */
        ul.skill-list {
          margin: 2pt 0 0 0;
          padding-left: 20pt;
          list-style-type: disc;
        }
        ul.skill-list li {
          font-size: 11.5pt;
          line-height: 1.3;
          margin-bottom: 2pt;
          color: #000000;
        }

        /* Cert row */
        .cert-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 11.5pt;
          line-height: 1.3;
          margin-bottom: 2pt;
        }

        /* Links: black, no underline (ATS-friendly) */
        a {
          color: #000000;
          text-decoration: none;
        }
      </style>
    </head>
    <body>

      <!-- HEADER -->
      <div class="header">
        <span class="header-name">${esc([name, lastName].filter(Boolean).join(' ')) || 'Your Name'}</span>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4pt;margin-top:5pt;">
          <!-- Row 1: phone, email, website -->
          <div style="display:flex;gap:20pt;align-items:center;font-size:12pt;color:#000;">
            ${phone   ? `<span style="display:inline-flex;align-items:center;gap:4px;">${ICONS.phone}${esc(phone)}</span>` : ''}
            ${email   ? `<span style="display:inline-flex;align-items:center;gap:4px;">${ICONS.email}${esc(email)}</span>` : ''}
            ${website ? `<span style="display:inline-flex;align-items:center;gap:4px;">${ICONS.globe}${esc(website)}</span>` : ''}
          </div>
          <!-- Row 2: linkedin, github, address -->
          ${(linkedin || github || address) ? `
          <div style="display:flex;gap:20pt;align-items:center;font-size:12pt;color:#000;">
            ${linkedinData ? `<span style="display:inline-flex;align-items:center;gap:4px;">${ICONS.linkedin}<a href="${linkedinData.url}" target="_blank">${esc(linkedinData.username)}</a></span>` : ''}
            ${githubData   ? `<span style="display:inline-flex;align-items:center;gap:4px;">${ICONS.github}<a href="${githubData.url}" target="_blank">${esc(githubData.username)}</a></span>` : ''}
            ${address  ? `<span style="display:inline-flex;align-items:center;gap:4px;">${ICONS.pin}${esc(address)}</span>` : ''}
          </div>` : ''}
        </div>
      </div>

      <!-- Summary -->
      ${summary ? `
        <div class="section">
          <div class="section-heading">Summary</div>
          <p style="font-size:12.5pt;line-height:1.15;">${esc(summary)}</p>
        </div>
      ` : ''}

      <!-- Work Experience -->
      ${experience && experience.length > 0 ? `
        <div class="section">
          <div class="section-heading">Work Experience</div>
          ${experience.map(exp => `
            <div class="entry">
              <div class="row-flex">
                <div class="row-left bold" style="font-size:14.5pt;">${esc(exp.company)}${exp.website ? ` | ${esc(exp.website)}` : ''}</div>
                <div class="row-right">${esc(exp.duration)}</div>
              </div>
              <div class="row-flex">
                <div class="row-left sub-text bold">${esc(exp.role)}${exp.techStack && exp.techStack.length > 0 ? ` | ${exp.techStack.map(esc).join(', ')}` : ''}</div>
                ${(exp.locationType || exp.location) ? `<div class="row-right" style="font-size:10.5pt;font-style:italic;">(${esc(exp.locationType || exp.location)})</div>` : ''}
              </div>
              ${exp.bullets && exp.bullets.filter(b => b.trim()).length > 0 ? `
                <ul class="ats-bullets">
                  ${exp.bullets.filter(b => b.trim()).map(b => `<li>${esc(b)}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects && projects.length > 0 ? `
        <div class="section">
          <div class="section-heading">Projects</div>
          ${projects.map(proj => `
            <div class="entry">
              <div class="row-flex">
                <div class="row-left" style="font-size:11.5pt;">
                  <strong>${esc(proj.title)}</strong>${proj.techStack && proj.techStack.filter(t => t.trim()).length > 0 ? ` <span style="font-weight:normal;">| ${proj.techStack.filter(t => t.trim()).map(esc).join(', ')}</span>` : ''}
                </div>
                <div class="row-right">
                  ${[
                    proj.github && `<a href="${formatProjectGithubUrl(proj.github)}" target="_blank" style="text-decoration: underline; font-style: italic;">GitHub</a>`,
                    proj.link   && `<a href="${formatExternalUrl(proj.link)}" target="_blank" style="text-decoration: underline; font-style: italic;">${proj.link.toLowerCase().includes('github.com') ? 'GitHub' : 'Link'}</a>`,
                  ].filter(Boolean).join(' | ')}
                </div>
              </div>
              ${proj.description ? `<p style="font-size:10pt;line-height:1.15;margin-top:2pt;">${esc(proj.description)}</p>` : ''}
              ${proj.bullets && proj.bullets.filter(b => b.trim()).length > 0 ? `
                <ul class="ats-bullets">
                  ${proj.bullets.filter(b => b.trim()).map(b => `<li>${esc(b)}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Technical Skills -->
      ${skillCategories && skillCategories.length > 0 ? `
        <div class="section">
          <div class="section-heading">Technical Skills</div>
          <ul class="skill-list">
            ${skillCategories.map(cat => `
              <li><span class="bold">${esc(cat.category)}:</span> ${(cat.items || []).map(esc).join(', ')}</li>
            `).join('')}
          </ul>
        </div>
      ` : skills && skills.filter(s => s.trim()).length > 0 ? `
        <div class="section">
          <div class="section-heading">Technical Skills</div>
          <p style="font-size:10pt;line-height:1.15;">${skills.filter(s => s.trim()).map(esc).join(', ')}</p>
        </div>
      ` : ''}

      <!-- Certifications -->
      ${certifications && certifications.length > 0 ? `
        <div class="section">
          <div class="section-heading">Certifications</div>
          <ul class="ats-bullets">
            ${certifications.map(cert => `
              <li>
                <div class="cert-row">
                  <span>
                    ${esc(cert.name)}
                    ${cert.issuer ? ` -- ${esc(cert.issuer)}` : ''}
                    ${cert.year ? ` (${esc(cert.year)})` : ''}
                  </span>
                  ${cert.status ? `<span style="margin-left:12pt;">${esc(cert.status)}</span>` : ''}
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Coding Profile -->
      ${codingProfile && (codingProfile.totalProblems || codingProfile.leetcode || codingProfile.gfg || codingProfile.codeforces || (codingProfile.platforms && codingProfile.platforms.length > 0)) ? `
        <div class="section">
          <div class="section-heading">Coding Profile</div>
          <div style="font-size:10pt;line-height:1.15;">
            ${codingProfile.totalProblems
              ? `<p style="margin-bottom:3pt;">Solved more than <strong>${esc(String(codingProfile.totalProblems))}+</strong> problems across competitive programming platforms.</p>`
              : ''}
            ${(codingProfile.platforms && codingProfile.platforms.length > 0
                ? codingProfile.platforms
                : [
                    codingProfile.leetcode   && { name: 'LeetCode',     username: codingProfile.leetcode },
                    codingProfile.gfg        && { name: 'GeeksForGeeks', username: codingProfile.gfg },
                    codingProfile.codeforces && { name: 'Codeforces',   username: codingProfile.codeforces },
                  ].filter(Boolean)
              ).map(p => `<div><span class="bold">${esc(p.name)}:</span> ${esc(p.username)}</div>`).join('')
            }
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${education && education.length > 0 ? `
        <div class="section">
          <div class="section-heading">Education</div>
          ${education.map(edu => `
            <div class="entry">
              <div class="row-flex">
                <div class="row-left bold" style="font-size:10pt;">${esc(edu.institution)}</div>
                <div class="row-right">${esc(edu.graduationYear)}</div>
              </div>
              <div class="row-flex">
                <div class="row-left sub-text">
                  ${esc(edu.degree)}${edu.field ? ` in ${esc(edu.field)}` : ''}${edu.gpa ? ` -- CGPA: ${esc(edu.gpa)}` : ''}
                </div>
                ${edu.location ? `<div class="row-right">${esc(edu.location)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Achievements -->
      ${achievements && achievements.length > 0 ? `
        <div class="section">
          <div class="section-heading">Achievements</div>
          <ul class="ats-bullets">
            ${achievements.map(ach => `
              <li><span class="bold">${esc(ach.title)}</span>${ach.description ? ` -- ${esc(ach.description)}` : ''}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Activities -->
      ${activities && activities.length > 0 ? `
        <div class="section">
          <div class="section-heading">Activities and Leadership</div>
          ${activities.map(act => `
            <div class="entry">
              <span class="bold">${esc(act.title)}</span>
              ${act.role ? ` -- ${esc(act.role)}` : ''}
              ${act.description ? `<div style="font-size:10pt;margin-top:1pt;">${esc(act.description)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

    </body>
    </html>
  `;
};

/**
 * Get or create a shared Puppeteer browser instance (singleton).
 * Avoids launching a new ~80MB Chromium process per PDF request.
 */
let _browser = null;
const getBrowser = async () => {
  if (_browser && _browser.isConnected()) return _browser;
  _browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  // Automatically null out when browser disconnects
  _browser.on('disconnected', () => { _browser = null; });
  return _browser;
};

/**
 * Generate PDF from resume data using Puppeteer (shared browser instance)
 */
const generatePDF = async (personalInfo, content, template = 'modern', jobTitle = '') => {
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    const html = generateResumeHTML(personalInfo, content, template, jobTitle);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Ensure all web fonts (Google Fonts) are fully loaded before PDF capture
    await page.evaluateHandle('document.fonts.ready');

    const name = [personalInfo?.name, personalInfo?.lastName].filter(Boolean).join(' ') || 'Resume';
    const pdfTitle = jobTitle ? `${name} - ${jobTitle}` : name;

    const pdfUint8 = await page.pdf({
      format: 'A4',
      // 1-inch margins = 25.4mm
      margin: { top: '10mm', right: '15mm', bottom: '18mm', left: '15mm' },
      printBackground: false,
      tagged: true,
    });

    return Buffer.from(pdfUint8);
  } catch (error) {
    logger.error('PDF generation error:', error.message);
    throw error;
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
  }
};

module.exports = { generatePDF, generateResumeHTML };
