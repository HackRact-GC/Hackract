import PDFDocument from 'pdfkit';
import prisma from '../../database/prismaClient.js';

// ── Color palette ──────────────────────────────────────────────────────────────
const C = {
  black:       '#0a0a0a',
  white:       '#ffffff',
  offWhite:    '#f8f9fa',
  lightGray:   '#e5e7eb',
  midGray:     '#6b7280',
  darkGray:    '#374151',
  accent:      '#00c477',   // Hackract green
  critical:    '#dc2626',
  high:        '#ea580c',
  medium:      '#ca8a04',
  low:         '#2563eb',
  info:        '#64748b',
};

const SEVERITY_COLOR = {
  CRITICAL: C.critical,
  HIGH:     C.high,
  MEDIUM:   C.medium,
  LOW:      C.low,
  INFO:     C.info,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function drawHRule(doc, { y, color = C.lightGray, width = 1 } = {}) {
  const pageY = y ?? doc.y;
  doc
    .moveTo(doc.page.margins.left, pageY)
    .lineTo(doc.page.width - doc.page.margins.right, pageY)
    .lineWidth(width)
    .strokeColor(color)
    .stroke();
}

function sectionTitle(doc, text) {
  doc.moveDown(0.5);
  doc
    .fontSize(14)
    .fillColor(C.black)
    .font('Helvetica-Bold')
    .text(text.toUpperCase(), { characterSpacing: 1 });
  drawHRule(doc, { y: doc.y + 4, color: C.black, width: 2 });
  doc.moveDown(0.8);
}

function bodyText(doc, text) {
  doc
    .fontSize(10)
    .fillColor(C.darkGray)
    .font('Helvetica')
    .text(text, { align: 'justify', lineGap: 2 });
}

function label(doc, key, value, x) {
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(C.midGray)
    .text(key, x, doc.y, { continued: true })
    .font('Helvetica')
    .fillColor(C.darkGray)
    .text('  ' + (value || '—'));
}

function addFooter(doc, pageNum, totalPages) {
  const y = doc.page.height - 40;
  const left  = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;

  doc
    .fontSize(8)
    .fillColor(C.midGray)
    .font('Helvetica');

  drawHRule(doc, { y: y - 8, color: C.lightGray });

  doc.text('HACKRACT SENTINEL PROTOCOL  ·  CONFIDENTIAL', left, y, {
    align: 'left',
    lineBreak: false,
    width: (right - left) / 2,
  });

  doc.text(`Page ${pageNum} of ${totalPages}`, left, y, {
    align: 'right',
    lineBreak: false,
    width: right - left,
  });
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * generatePdfReport
 * @param {string} projectId
 * @param {{ execSummary: boolean, vulnTable: boolean, methodology: boolean, rawLogs: boolean }} modules
 * @returns {Promise<Buffer>}  – raw PDF bytes
 */
export async function generatePdfReport(projectId, modules = {}) {
  // ── 1. Fetch data ─────────────────────────────────────────────────────────
  const project = await prisma.pentest.findUnique({
    where: { id: projectId },
    include: {
      organization: { select: { name: true, slug: true } },
      leadPentester: { select: { fullName: true, email: true } },
      collaborators: {
        include: { user: { select: { fullName: true, handle: true, email: true } } },
      },
      findings: {
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        include: {
          reporter: { select: { fullName: true, handle: true } },
        },
      },
    },
  });

  if (!project) throw new Error('Project not found');

  const findings = project.findings || [];
  const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
  const counts = severityOrder.reduce((a, s) => {
    a[s] = findings.filter(f => f.severity === s).length;
    return a;
  }, {});

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const refId = projectId.split('-')[0].toUpperCase();

  // ── 2. Build PDF ──────────────────────────────────────────────────────────
  const doc = new PDFDocument({
    size:    'A4',
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
      Title:    `Hackract Security Report – ${project.name}`,
      Author:   'Hackract Sentinel Protocol',
      Subject:  'Penetration Test Assessment Report',
      Keywords: 'security, pentest, vulnerability, assessment',
    },
    bufferPages: true,   // lets us add footer with total page count afterwards
  });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  // ── PAGE 1 — Cover ────────────────────────────────────────────────────────
  const pw = doc.page.width;
  const ph = doc.page.height;
  const ml = doc.page.margins.left;
  const mr = doc.page.margins.right;
  const contentW = pw - ml - mr;

  // Black header block
  doc.rect(0, 0, pw, 220).fill(C.black);

  // Accent bar
  doc.rect(0, 220, pw, 6).fill(C.accent);

  // HACKRACT logo text
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(C.accent)
    .text('HACKRACT', ml, 40, { characterSpacing: 4 });

  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .font('Helvetica')
    .text('SENTINEL PROTOCOL', ml, 57, { characterSpacing: 3 });

  // Report title
  doc
    .font('Helvetica-Bold')
    .fontSize(28)
    .fillColor(C.white)
    .text(project.name || 'Untitled Project', ml, 100, {
      width: contentW - 120,
      lineGap: 4,
    });

  doc
    .fontSize(11)
    .fillColor('#9ca3af')
    .font('Helvetica')
    .text(
      `Security Assessment Report  ·  ${project.organization?.name || 'Independent Engagement'}`,
      ml, 170, { width: contentW }
    );

  // Date / ref box (top-right of header)
  doc
    .fontSize(9)
    .fillColor('#9ca3af')
    .font('Helvetica-Bold')
    .text(today, pw - mr - 120, 40, { width: 120, align: 'right' });

  doc
    .fontSize(8)
    .fillColor('#6b7280')
    .font('Helvetica')
    .text(`REF: SEC-${refId}`, pw - mr - 120, 57, { width: 120, align: 'right', characterSpacing: 1 });

  // Body area starts below accent bar
  doc.y = 260;

  // Meta row
  const colW = contentW / 3;
  [
    ['Project Status',  project.status?.replace('_', ' ') || 'N/A'],
    ['Total Findings',  String(findings.length)],
    ['Generated',       today],
  ].forEach(([k, v], i) => {
    const x = ml + i * colW;
    doc
      .rect(x, 270, colW - 8, 60)
      .fillAndStroke('#f9fafb', C.lightGray);

    doc
      .fontSize(8)
      .fillColor(C.midGray)
      .font('Helvetica-Bold')
      .text(k.toUpperCase(), x + 12, 280, { characterSpacing: 1 });

    doc
      .fontSize(14)
      .fillColor(C.black)
      .font('Helvetica-Bold')
      .text(v, x + 12, 295);
  });

  doc.y = 360;

  // Scope block
  if (project.targetDomains?.length || project.ipRanges?.length) {
    doc
      .rect(ml, doc.y, contentW, 1)
      .fill(C.lightGray);

    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor(C.midGray)
      .font('Helvetica-Bold')
      .text('SCOPE OF ENGAGEMENT', { characterSpacing: 1 });

    doc.moveDown(0.3);

    if (project.targetDomains?.length) {
      label(doc, 'Target Domains:', project.targetDomains.join(', '), ml);
    }
    if (project.ipRanges?.length) {
      label(doc, 'IP Ranges:', project.ipRanges.join(', '), ml);
    }
    if (project.excludedAssets) {
      label(doc, 'Exclusions:', project.excludedAssets, ml);
    }
  }

  // Classification banner at bottom of cover
  doc.y = ph - 100;
  doc
    .rect(ml, doc.y, contentW, 30)
    .fill('#fef3c7');

  doc
    .fontSize(8.5)
    .fillColor('#92400e')
    .font('Helvetica-Bold')
    .text(
      '⚠  CONFIDENTIAL — This document contains sensitive security information. Handle accordingly.',
      ml + 10, doc.y + 9, { width: contentW - 20, align: 'center' }
    );

  // ── PAGE 2+ — Dynamic Modules ─────────────────────────────────────────────
  doc.addPage();

  // ── Executive Summary ─────────────────────────────────────────────────────
  if (modules.execSummary !== false) {
    sectionTitle(doc, '1. Executive Summary');

    bodyText(
      doc,
      `The security assessment for "${project.name}" was conducted on behalf of ` +
      `${project.organization?.name || 'the client organization'}. ` +
      `A total of ${findings.length} unique vulnerabilities were identified across the defined scope. ` +
      `This document provides a structured breakdown of each finding, their potential impact, ` +
      `and recommended remediation steps to reduce organizational risk exposure.`
    );

    doc.moveDown(1);

    // Severity grid
    doc
      .fontSize(10)
      .fillColor(C.black)
      .font('Helvetica-Bold')
      .text('Vulnerability Distribution by Severity');

    doc.moveDown(0.5);

    const boxW  = (contentW - 20) / 4;
    const boxH  = 60;
    const startX = ml;
    const startY = doc.y;

    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach((sev, i) => {
      const x = startX + i * (boxW + 6);
      const color = SEVERITY_COLOR[sev];

      doc.rect(x, startY, boxW, boxH).fillAndStroke('#ffffff', C.lightGray);
      // colored left bar
      doc.rect(x, startY, 4, boxH).fill(color);

      doc
        .fontSize(26)
        .font('Helvetica-Bold')
        .fillColor(color)
        .text(String(counts[sev] || 0), x + 12, startY + 8, { width: boxW - 20 });

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(C.midGray)
        .text(sev, x + 12, startY + 42, { width: boxW - 20, characterSpacing: 1 });
    });

    doc.y = startY + boxH + 16;
    doc.moveDown(0.5);
  }

  // ── Vulnerability Table ────────────────────────────────────────────────────
  if (modules.vulnTable !== false) {
    sectionTitle(doc, '2. Detected Vulnerabilities');

    if (findings.length === 0) {
      doc
        .fontSize(10)
        .fillColor(C.midGray)
        .font('Helvetica')
        .text('No vulnerabilities were identified during this assessment.', { align: 'center' });
    } else {
      // Table header
      const cols = {
        sev:    { x: ml,         w: 72  },
        title:  { x: ml + 78,    w: 220 },
        asset:  { x: ml + 304,   w: 140 },
        cvss:   { x: ml + 450,   w: 50  },
        status: { x: ml + 506,   w: 66  },
      };
      const rowH = 22;
      const headerY = doc.y;

      // Header fill
      doc.rect(ml, headerY, contentW, rowH).fill('#111827');

      Object.entries({
        'SEVERITY': cols.sev,
        'VULNERABILITY':  cols.title,
        'AFFECTED ASSET': cols.asset,
        'CVSS': cols.cvss,
        'STATUS': cols.status,
      }).forEach(([text, col]) => {
        doc
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .fillColor(C.white)
          .text(text, col.x + 4, headerY + 7, { width: col.w - 8, characterSpacing: 0.5 });
      });

      doc.y = headerY + rowH;

      // Rows — sorted by severity order
      const sorted = [...findings].sort((a, b) =>
        severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
      );

      sorted.forEach((f, idx) => {
        // Check if we need a new page
        if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 30) {
          doc.addPage();
        }

        const rowY = doc.y;
        const bg   = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(ml, rowY, contentW, rowH).fill(bg);

        // Severity badge
        const sColor = SEVERITY_COLOR[f.severity] || C.info;
        doc.rect(cols.sev.x + 4, rowY + 5, 60, 12).fill(sColor + '22');
        doc
          .fontSize(7)
          .font('Helvetica-Bold')
          .fillColor(sColor)
          .text(f.severity || '—', cols.sev.x + 6, rowY + 7, { width: 56 });

        doc
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor(C.darkGray)
          .text(f.title || '—', cols.title.x + 4, rowY + 6, {
            width: cols.title.w - 8,
            lineBreak: false,
            ellipsis: true,
          });

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(C.midGray)
          .text(f.affectedAsset || '—', cols.asset.x + 4, rowY + 7, {
            width: cols.asset.w - 8,
            lineBreak: false,
            ellipsis: true,
          });

        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor(C.black)
          .text(f.cvssScore != null ? Number(f.cvssScore).toFixed(1) : '—', cols.cvss.x + 4, rowY + 7, {
            width: cols.cvss.w - 8,
          });

        doc
          .fontSize(7)
          .font('Helvetica')
          .fillColor(C.midGray)
          .text(f.status?.replace('_', ' ') || '—', cols.status.x + 4, rowY + 7, {
            width: cols.status.w - 8,
            lineBreak: false,
            ellipsis: true,
          });

        // Bottom border
        doc
          .moveTo(ml, rowY + rowH)
          .lineTo(ml + contentW, rowY + rowH)
          .lineWidth(0.5)
          .strokeColor(C.lightGray)
          .stroke();

        doc.y = rowY + rowH;
      });

      doc.moveDown(1);
    }
  }

  // ── Detailed Findings ─────────────────────────────────────────────────────
  if (modules.vulnTable !== false && findings.length > 0) {
    doc.addPage();
    sectionTitle(doc, '3. Finding Details');

    findings.forEach((f, idx) => {
      if (doc.y > doc.page.height - 200) doc.addPage();

      // Finding header
      const sevColor = SEVERITY_COLOR[f.severity] || C.info;
      doc.rect(ml, doc.y, contentW, 28).fill(sevColor + '18');
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(C.black)
        .text(`${idx + 1}. ${f.title}`, ml + 8, doc.y + 8, { width: contentW - 80 });

      // Severity label (right-aligned)
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(sevColor)
        .text(f.severity, ml + contentW - 70, doc.y - 12, { width: 66, align: 'right' });

      doc.moveDown(0.8);

      // Meta row
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor(C.midGray)
        .text('CVSS: ', ml, doc.y, { continued: true })
        .font('Helvetica')
        .fillColor(C.black)
        .text(f.cvssScore != null ? Number(f.cvssScore).toFixed(1) : 'N/A', { continued: true })
        .text('   Status: ', { continued: true })
        .text(f.status?.replace('_', ' ') || 'OPEN', { continued: true })
        .text('   Asset: ', { continued: true })
        .text(f.affectedAsset || 'Not specified');

      doc.moveDown(0.5);

      // Description
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(C.darkGray)
        .text('Description');
      bodyText(doc, f.description || 'No description provided.');

      if (f.remediation) {
        doc.moveDown(0.4);
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(C.darkGray)
          .text('Remediation');
        bodyText(doc, f.remediation);
      }

      doc.moveDown(0.5);
      drawHRule(doc, { color: C.lightGray });
      doc.moveDown(0.8);
    });
  }

  // ── Methodology ───────────────────────────────────────────────────────────
  if (modules.methodology) {
    doc.addPage();
    sectionTitle(doc, '4. Methodology');

    bodyText(
      doc,
      'The assessment was conducted using a combination of manual testing and automated scanning ' +
      'techniques, aligned with industry-recognized frameworks including OWASP Testing Guide, ' +
      'PTES (Penetration Testing Execution Standard), and NIST SP 800-115. ' +
      'The Hackract platform facilitated real-time collaboration between security operatives ' +
      'through workflow boards, shared terminal sessions, and structured finding documentation.'
    );

    doc.moveDown(1);

    const phases = [
      ['Reconnaissance',     'Passive and active information gathering to map the attack surface.'],
      ['Scanning',           'Automated vulnerability scanning and service enumeration.'],
      ['Exploitation',       'Manual exploitation of identified vulnerabilities to validate impact.'],
      ['Post-Exploitation',  'Assessment of lateral movement, privilege escalation, and data access.'],
      ['Reporting',          'Structured documentation of findings with severity classification and remediation guidance.'],
    ];

    phases.forEach(([phase, desc], i) => {
      if (doc.y + 40 > doc.page.height - 80) doc.addPage();
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(C.accent)
        .text(`${i + 1}. ${phase}`, ml, doc.y);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(C.darkGray)
        .text(desc, ml + 12, doc.y, { width: contentW - 12 });
      doc.moveDown(0.5);
    });
  }

  // ── Back-patch footers now that we know total pages ────────────────────────
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    addFooter(doc, i + 1, totalPages);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}
