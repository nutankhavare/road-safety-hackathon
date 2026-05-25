import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const PRIORITY_CONFIG = {
  Critical: {
    badge: 'CRITICAL CONDITION',
    badgeClass: 'rpt-badge-critical',
    cardClass: 'rpt-card-critical',
    dot: '#ef4444',
    label: 'Critical',
  },
  High: {
    badge: 'HIGH DANGER',
    badgeClass: 'rpt-badge-high',
    cardClass: 'rpt-card-high',
    dot: '#f97316',
    label: 'High',
  },
  Medium: {
    badge: 'MODERATE RISK',
    badgeClass: 'rpt-badge-medium',
    cardClass: 'rpt-card-medium',
    dot: '#f59e0b',
    label: 'Medium',
  },
  Low: {
    badge: 'SAFE',
    badgeClass: 'rpt-badge-low',
    cardClass: 'rpt-card-low',
    dot: '#10b981',
    label: 'Low',
  },
  Unknown: {
    badge: 'UNKNOWN',
    badgeClass: 'rpt-badge-unknown',
    cardClass: 'rpt-card-unknown',
    dot: '#64748b',
    label: 'Unknown',
  },
};

const getPriorityCfg = (p) =>
  PRIORITY_CONFIG[p] || PRIORITY_CONFIG['Unknown'];

const formatDate = (ds) => {
  if (!ds) return '—';
  return new Date(ds).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const scoreColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 55) return '#f59e0b';
  if (score >= 30) return '#f97316';
  return '#ef4444';
};

const FILTERS = [
  { key: 'all', label: 'All Reports' },
  { key: 'Critical', label: '🔴 Critical' },
  { key: 'High', label: '🟠 High Risk' },
  { key: 'pothole', label: '🕳️ Potholes' },
  { key: 'crack', label: '🪨 Cracks' },
  { key: 'water', label: '💧 Waterlogging' },
];

/* ─────────────────────────────────────────────────────────────
   REPORT PREVIEW MODAL (also used for PDF/Print)
───────────────────────────────────────────────────────────── */

const ReportPreview = ({ report, onClose, t }) => {
  const previewRef = useRef(null);
  const cfg = getPriorityCfg(report.maintenance_priority);

  const issuesList = report.detected_issues
    ? report.detected_issues.split(',').map((i) => i.trim()).filter(Boolean)
    : [];

  const handleExportPdf = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = previewRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `SafePath_Report_${report.id}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    const content = previewRef.current.innerHTML;
    const reportId = report.id;
    const win = window.open('', '_blank', 'width=860,height=720,scrollbars=yes,resizable=yes');

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SafePath AI — Print Preview · Report #${reportId}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f5f5f5;
      color: #111;
      min-height: 100vh;
      font-size: 14px;
    }

    /* ── Toolbar ─────────────────────────────────────────── */
    #print-toolbar {
      position: sticky; top: 0; z-index: 999;
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 10px 24px;
      background: #1e3a5f;
      border-bottom: 2px solid #163057;
      gap: 12px; flex-wrap: wrap;
    }
    #print-toolbar h2 { font-size: 0.9rem; font-weight: 700; color: #fff; }
    #print-toolbar p  { font-size: 0.72rem; color: #93c5fd; margin-top: 2px; }
    .tb-actions { display: flex; gap: 8px; }
    .tb-btn {
      padding: 7px 18px; border-radius: 3px;
      font-size: 0.8rem; font-weight: 600;
      cursor: pointer; font-family: inherit;
      border: 1px solid transparent;
    }
    .btn-print { background: #fff; color: #1e3a5f; border-color: #fff; }
    .btn-print:hover { background: #dbeafe; }
    .btn-close  { background: transparent; color: #fca5a5; border-color: #7f1d1d; }
    .btn-close:hover { background: rgba(239,68,68,0.1); }

    /* ── Document area ───────────────────────────────────── */
    #report-content { max-width: 820px; margin: 24px auto; padding: 0 16px 40px; }

    /* Header */
    .rpt-preview-header {
      background: #1e3a5f; color: #fff;
      padding: 18px 24px;
      display: flex; align-items: center;
      justify-content: space-between; gap: 12px;
    }
    .rpt-preview-logo { display: flex; align-items: center; gap: 8px; }
    .rpt-preview-logo-icon { font-size: 1.5rem; }
    .rpt-preview-logo-text { font-size: 1.1rem; font-weight: 700; color: #fff; }
    .rpt-preview-logo-ai { color: #93c5fd; }
    .rpt-preview-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .rpt-preview-report-id { font-size: 0.8rem; font-weight: 700; color: #bfdbfe; }
    .rpt-preview-date { font-size: 0.7rem; color: #93c5fd; }

    /* Body */
    .rpt-preview-body {
      padding: 20px; background: #fff;
      border: 1px solid #d1d5db; border-top: none;
      display: flex; flex-direction: column; gap: 18px;
    }

    /* Status bar */
    .rpt-preview-badge-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 12px;
      border: 1px solid #d1d5db; border-radius: 2px;
      background: #f9fafb;
    }
    .rpt-preview-badge-label { font-size: 0.8rem; color: #374151; font-weight: 500; }
    .rpt-preview-road-badge {
      padding: 3px 10px; border-radius: 2px;
      font-size: 0.68rem; font-weight: 800;
      letter-spacing: 0.07em; text-transform: uppercase;
      border: 1px solid;
    }
    .rpt-badge-critical { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .rpt-badge-high     { background: #ffedd5; color: #9a3412; border-color: #fdba74; }
    .rpt-badge-medium   { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .rpt-badge-low      { background: #dcfce7; color: #166534; border-color: #86efac; }
    .rpt-badge-unknown  { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }

    /* Image */
    .rpt-preview-image-wrap {
      border: 1px solid #d1d5db; border-radius: 2px; overflow: hidden;
    }
    .rpt-preview-image { width: 100%; max-height: 300px; object-fit: cover; display: block; }
    img { max-width: 100%; display: block; }

    /* Scores */
    .rpt-preview-scores {
      display: grid; grid-template-columns: repeat(3,1fr);
      border: 1px solid #d1d5db; border-radius: 2px; overflow: hidden;
    }
    .rpt-score-card {
      padding: 14px; background: #fff;
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      border-right: 1px solid #d1d5db;
    }
    .rpt-score-card:last-child { border-right: none; }
    .rpt-score-label { font-size: 0.64rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .rpt-score-value { font-size: 1.8rem; font-weight: 800; color: #111; }
    .rpt-score-sub { font-size: 0.68rem; color: #9ca3af; }
    .rpt-priority-pill {
      font-size: 0.7rem; font-weight: 700;
      padding: 3px 10px; border-radius: 2px;
      letter-spacing: 0.04em; border: 1px solid;
    }
    .rpt-priority-pill.rpt-badge-critical { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .rpt-priority-pill.rpt-badge-high     { background: #ffedd5; color: #9a3412; border-color: #fdba74; }
    .rpt-priority-pill.rpt-badge-medium   { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .rpt-priority-pill.rpt-badge-low      { background: #dcfce7; color: #166534; border-color: #86efac; }
    .rpt-priority-pill.rpt-badge-unknown  { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }

    /* Sections */
    .rpt-preview-section { border: 1px solid #d1d5db; border-radius: 2px; overflow: hidden; }
    .rpt-preview-section-title {
      font-size: 0.72rem; font-weight: 700; color: #374151;
      text-transform: uppercase; letter-spacing: 0.06em;
      padding: 7px 12px; background: #f3f4f6;
      border-bottom: 1px solid #d1d5db; margin: 0;
    }
    .rpt-issues-list { list-style: none; padding: 8px 12px; margin: 0; background: #fff; }
    .rpt-issues-item {
      display: flex; align-items: flex-start; gap: 7px;
      font-size: 0.8rem; color: #374151;
      padding: 5px 0; border-bottom: 1px solid #f3f4f6;
    }
    .rpt-issues-item:last-child { border-bottom: none; }
    .rpt-issues-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }

    /* Footer */
    .rpt-preview-footer {
      padding: 10px 20px;
      border-top: 2px solid #1e3a5f;
      background: #f9fafb;
      text-align: center;
      font-size: 0.7rem; color: #6b7280;
    }
    .rpt-preview-footer-sub { font-size: 0.65rem; color: #9ca3af; margin-top: 2px; }

    /* Print */
    @media print {
      body { background: #fff !important; }
      #print-toolbar { display: none !important; }
      #report-content { margin: 0; padding: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div id="print-toolbar">
    <div>
      <h2>SafePath AI — Print Preview</h2>
      <p>Report #${reportId} &middot; Review below, then click Print Now</p>
    </div>
    <div class="tb-actions">
      <button class="tb-btn btn-print" onclick="window.print()">&#128424; Print Now</button>
      <button class="tb-btn btn-close" onclick="window.close()">&#x2715; Close</button>
    </div>
  </div>
  <div id="report-content">
    ${content}
  </div>
</body>
</html>`);

    win.document.close();
    win.focus();
  };

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SafePath AI — Print Preview · Report #${reportId}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
      background: #070d1a;
      color: #e2e8f0;
      min-height: 100vh;
    }

    /* ── Top toolbar (hidden when printing) ─────────────────── */
    #print-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 28px;
      background: rgba(15,23,42,0.97);
      border-bottom: 1px solid rgba(59,130,246,0.25);
      backdrop-filter: blur(12px);
      gap: 12px;
      flex-wrap: wrap;
    }
    #print-toolbar h2 {
      font-size: 1rem;
      font-weight: 700;
      color: #e2e8f0;
    }
    #print-toolbar p {
      font-size: 0.78rem;
      color: #64748b;
      margin-top: 2px;
    }
    .tb-actions { display: flex; gap: 10px; align-items: center; }

    .tb-btn {
      padding: 9px 20px;
      border-radius: 8px;
      border: 1px solid transparent;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: filter 0.15s;
    }
    .tb-btn:hover { filter: brightness(1.15); }

    .btn-print {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 4px 14px rgba(59,130,246,0.35);
    }
    .btn-close {
      background: rgba(239,68,68,0.12);
      color: #fca5a5;
      border-color: rgba(239,68,68,0.3);
    }

    /* ── Report content wrapper ──────────────────────────────── */
    #report-content {
      max-width: 860px;
      margin: 0 auto;
      padding: 36px 28px 60px;
    }

    /* Pass-through key styles so the cloned HTML renders properly */
    img { max-width: 100%; border-radius: 8px; display: block; }

    .rpt-preview-inner { display: flex; flex-direction: column; gap: 24px; }

    .rpt-preview-header {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .rpt-preview-logo { display: flex; align-items: center; gap: 8px; }
    .rpt-preview-logo-icon { font-size: 1.8rem; }
    .rpt-preview-logo-text { font-size: 1.5rem; font-weight: 800; color: #e2e8f0; }
    .rpt-preview-logo-ai {
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .rpt-preview-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .rpt-preview-report-id { font-size: 0.85rem; font-weight: 700; color: #60a5fa; }
    .rpt-preview-date { font-size: 0.75rem; color: #64748b; }

    .rpt-preview-image-wrap {
      border-radius: 12px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(30,41,59,0.5);
    }
    .rpt-preview-image { width: 100%; max-height: 360px; object-fit: cover; display: block; }

    .rpt-preview-badge-row { display: flex; justify-content: center; }
    .rpt-preview-road-badge {
      padding: 8px 28px; border-radius: 8px;
      font-size: 1rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
    }

    .rpt-preview-scores { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .rpt-score-card {
      background: rgba(30,41,59,0.6);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 20px;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .rpt-score-label {
      font-size: 0.72rem; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
    }
    .rpt-score-value { font-size: 2.8rem; font-weight: 900; line-height: 1; }
    .rpt-score-sub { font-size: 0.75rem; color: #475569; }
    .rpt-priority-pill {
      font-size: 0.85rem; font-weight: 800; padding: 6px 16px;
      border-radius: 6px; letter-spacing: 0.05em;
    }

    .rpt-preview-section {
      background: rgba(30,41,59,0.4);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; padding: 20px 24px;
    }
    .rpt-preview-section-title { font-size: 1rem; font-weight: 700; color: #e2e8f0; margin-bottom: 14px; }
    .rpt-issues-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .rpt-issues-item {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.875rem; color: #cbd5e1;
      padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .rpt-issues-item:last-child { border-bottom: none; }
    .rpt-issues-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    .rpt-preview-footer {
      border-top: 1px solid rgba(255,255,255,0.07);
      padding-top: 16px; text-align: center;
      font-size: 0.78rem; color: #475569;
      display: flex; flex-direction: column; gap: 4px;
    }

    /* Badge colour classes */
    .rpt-badge-critical { background: rgba(239,68,68,0.18); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
    .rpt-badge-high     { background: rgba(249,115,22,0.18); color: #fdba74; border: 1px solid rgba(249,115,22,0.3); }
    .rpt-badge-medium   { background: rgba(245,158,11,0.18); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
    .rpt-badge-low      { background: rgba(16,185,129,0.18); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }
    .rpt-badge-unknown  { background: rgba(100,116,139,0.18); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3); }

    /* ── Print media — hide toolbar, reset layout ───────────── */
    @media print {
      body { background: #fff !important; color: #111 !important; }
      #print-toolbar { display: none !important; }
      #report-content { padding: 0; max-width: 100%; }
      .rpt-score-card, .rpt-preview-section {
        border: 1px solid #ccc !important;
        background: #f8fafc !important;
      }
      .rpt-score-value, .rpt-preview-logo-text,
      .rpt-preview-report-id { color: #111 !important; }
      .rpt-score-label, .rpt-preview-date,
      .rpt-preview-footer { color: #555 !important; }
      .rpt-issues-item { color: #222 !important; }
    }
  </style>
</head>
<body>

  <!-- Sticky toolbar: visible on screen, hidden on print -->
  <div id="print-toolbar">
    <div>
      <h2>🛣️ SafePath AI — Print Preview</h2>
      <p>Report #${reportId} · Review before printing</p>
    </div>
    <div class="tb-actions">
      <button class="tb-btn btn-print" onclick="window.print()">🖨&nbsp; Print Now</button>
      <button class="tb-btn btn-close" onclick="window.close()">✕&nbsp; Close</button>
    </div>
  </div>

  <!-- Report body (cloned from modal) -->
  <div id="report-content">
    <div class="rpt-preview-inner">${content}</div>
  </div>

</body>
</html>`);

    win.document.close();
    win.focus();
  };

  return (
    <div className="rpt-overlay" onClick={onClose}>
      <div className="rpt-modal" onClick={(e) => e.stopPropagation()}>

        {/* Modal action bar */}
        <div className="rpt-modal-bar">
          <span className="rpt-modal-title">Report #{report.id}</span>
          <div className="rpt-modal-actions">
            <button id={`pdf-btn-${report.id}`} className="rpt-action-btn rpt-pdf-btn" onClick={handleExportPdf}>
              ⬇ {t('reportsExportPdf')}
            </button>
            <button id={`print-btn-${report.id}`} className="rpt-action-btn rpt-print-btn" onClick={handlePrint}>
              🖨 {t('reportsPrint')}
            </button>
            <button id={`close-btn-${report.id}`} className="rpt-action-btn rpt-close-btn" onClick={onClose}>
              ✕ {t('reportsClose')}
            </button>
          </div>
        </div>

        {/* Scrollable preview — document style */}
        <div className="rpt-modal-scroll">
          <div ref={previewRef} className="rpt-preview-inner">

            {/* ── Document Header (navy bar) ── */}
            <div className="rpt-preview-header">
              <div className="rpt-preview-logo">
                <span className="rpt-preview-logo-icon">🛣️</span>
                <span className="rpt-preview-logo-text">
                  SafePath <span className="rpt-preview-logo-ai">AI</span>
                </span>
              </div>
              <div className="rpt-preview-meta">
                <span className="rpt-preview-report-id">Report #{report.id}</span>
                <span className="rpt-preview-date">{formatDate(report.created_at)}</span>
              </div>
            </div>

            {/* ── Document Body (white) ── */}
            <div className="rpt-preview-body">

              {/* Status row */}
              <div className="rpt-preview-badge-row">
                <span className="rpt-preview-badge-label">{t('reportsRoadStatus')}:</span>
                <span className={`rpt-preview-road-badge ${cfg.badgeClass}`}>
                  {cfg.badge}
                </span>
              </div>

              {/* Road image */}
              {report.image_url && (
                <div className="rpt-preview-image-wrap">
                  <img
                    src={report.image_url}
                    alt="Analyzed Road"
                    className="rpt-preview-image"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {/* Scores table */}
              <div className="rpt-preview-scores">
                <div className="rpt-score-card">
                  <div className="rpt-score-label">Safety Score</div>
                  <div className="rpt-score-value" style={{ color: scoreColor(report.safety_score) }}>
                    {report.safety_score ?? '—'}
                  </div>
                  <div className="rpt-score-sub">/ 100</div>
                </div>
                <div className="rpt-score-card">
                  <div className="rpt-score-label">Road Health</div>
                  <div className="rpt-score-value" style={{ color: scoreColor(report.road_health_score) }}>
                    {report.road_health_score ?? '—'}
                  </div>
                  <div className="rpt-score-sub">/ 100</div>
                </div>
                <div className="rpt-score-card">
                  <div className="rpt-score-label">Priority</div>
                  <div className={`rpt-priority-pill ${cfg.badgeClass}`}>
                    {report.maintenance_priority || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Detected issues */}
              {issuesList.length > 0 && (
                <div className="rpt-preview-section">
                  <h3 className="rpt-preview-section-title">⚠ {t('reportsDetectedIssues')}</h3>
                  <ul className="rpt-issues-list">
                    {issuesList.map((issue, i) => (
                      <li key={i} className="rpt-issues-item">
                        <span className="rpt-issues-dot" style={{ background: cfg.dot }} />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>{/* /rpt-preview-body */}

            {/* ── Document Footer ── */}
            <div className="rpt-preview-footer">
              <p>SafePath AI — Municipal Road Safety Inspection Platform &middot; 🇮🇳 India</p>
              <p className="rpt-preview-footer-sub">
                {t('reportsTimestamp')}: {formatDate(report.created_at)}
              </p>
            </div>

          </div>{/* /rpt-preview-inner */}
        </div>
      </div>
    </div>
  );
          <div className="rpt-modal-actions">
            <button id={`pdf-btn-${report.id}`} className="rpt-action-btn rpt-pdf-btn" onClick={handleExportPdf}>
              ⬇ {t('reportsExportPdf')}
            </button>
            <button id={`print-btn-${report.id}`} className="rpt-action-btn rpt-print-btn" onClick={handlePrint}>
              🖨 {t('reportsPrint')}
            </button>
            <button id={`close-btn-${report.id}`} className="rpt-action-btn rpt-close-btn" onClick={onClose}>
              ✕ {t('reportsClose')}
            </button>
          </div>
        </div>

        {/* Scrollable preview content */}
        <div className="rpt-modal-scroll">
          <div ref={previewRef} className="rpt-preview-inner">

            {/* Header */}
            <div className="rpt-preview-header">
              <div className="rpt-preview-logo">
                <span className="rpt-preview-logo-icon">🛣️</span>
                <span className="rpt-preview-logo-text">
                  SafePath <span className="rpt-preview-logo-ai">AI</span>
                </span>
              </div>
              <div className="rpt-preview-meta">
                <span className="rpt-preview-report-id">Report #{report.id}</span>
                <span className="rpt-preview-date">{formatDate(report.created_at)}</span>
              </div>
            </div>

            {/* Road Image */}
            {report.image_url && (
              <div className="rpt-preview-image-wrap">
                <img
                  src={report.image_url}
                  alt="Analyzed Road"
                  className="rpt-preview-image"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Status Badge */}
            <div className="rpt-preview-badge-row">
              <span className={`rpt-preview-road-badge ${cfg.badgeClass}`}>
                {cfg.badge}
              </span>
            </div>

            {/* Score Cards */}
            <div className="rpt-preview-scores">
              <div className="rpt-score-card">
                <div className="rpt-score-label">Safety Score</div>
                <div
                  className="rpt-score-value"
                  style={{ color: scoreColor(report.safety_score) }}
                >
                  {report.safety_score ?? '—'}
                </div>
                <div className="rpt-score-sub">/ 100</div>
              </div>
              <div className="rpt-score-card">
                <div className="rpt-score-label">Road Health</div>
                <div
                  className="rpt-score-value"
                  style={{ color: scoreColor(report.road_health_score) }}
                >
                  {report.road_health_score ?? '—'}
                </div>
                <div className="rpt-score-sub">/ 100</div>
              </div>
              <div className="rpt-score-card">
                <div className="rpt-score-label">Priority</div>
                <div className={`rpt-priority-pill ${cfg.badgeClass}`}>
                  {report.maintenance_priority || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Detected Issues */}
            {issuesList.length > 0 && (
              <div className="rpt-preview-section">
                <h3 className="rpt-preview-section-title">⚠️ {t('reportsDetectedIssues')}</h3>
                <ul className="rpt-issues-list">
                  {issuesList.map((issue, i) => (
                    <li key={i} className="rpt-issues-item">
                      <span className="rpt-issues-dot" style={{ background: cfg.dot }} />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="rpt-preview-footer">
              <p>🇮🇳 SafePath AI — AI-Powered Road Safety Platform</p>
              <p className="rpt-preview-footer-sub">
                {t('reportsTimestamp')}: {formatDate(report.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   REPORT CARD
───────────────────────────────────────────────────────────── */

const ReportCard = ({ report, onPreview, t }) => {
  const cfg = getPriorityCfg(report.maintenance_priority);
  const issuesList = report.detected_issues
    ? report.detected_issues.split(',').map((i) => i.trim()).filter(Boolean)
    : [];

  return (
    <div className={`rpt-card ${cfg.cardClass}`}>
      {/* Left: Image */}
      <div className="rpt-card-image-wrap">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt="Road"
            className="rpt-card-image"
          />
        ) : (
          <div className="rpt-card-no-image">🛣️</div>
        )}
        <span className={`rpt-card-badge ${cfg.badgeClass}`}>
          {cfg.badge}
        </span>
      </div>

      {/* Right: Details */}
      <div className="rpt-card-body">
        <div className="rpt-card-top-row">
          <span className="rpt-card-id">Report #{report.id}</span>
          <span className="rpt-card-date">{formatDate(report.created_at)}</span>
        </div>

        {/* Scores row */}
        <div className="rpt-card-scores">
          <div className="rpt-card-score-item">
            <span className="rpt-card-score-label">Safety</span>
            <span className="rpt-card-score-val" style={{ color: scoreColor(report.safety_score) }}>
              {report.safety_score ?? '—'}
            </span>
          </div>
          <div className="rpt-card-score-divider" />
          <div className="rpt-card-score-item">
            <span className="rpt-card-score-label">Health</span>
            <span className="rpt-card-score-val" style={{ color: scoreColor(report.road_health_score) }}>
              {report.road_health_score ?? '—'}
            </span>
          </div>
          <div className="rpt-card-score-divider" />
          <div className="rpt-card-score-item">
            <span className="rpt-card-score-label">Priority</span>
            <span className={`rpt-card-priority ${cfg.badgeClass}`}>
              {report.maintenance_priority || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Detected Issues */}
        {issuesList.length > 0 && (
          <div className="rpt-card-issues">
            {issuesList.slice(0, 3).map((issue, i) => (
              <span key={i} className="rpt-card-issue-tag">
                {issue}
              </span>
            ))}
            {issuesList.length > 3 && (
              <span className="rpt-card-issue-more">
                +{issuesList.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Preview button */}
        <button
          id={`preview-btn-${report.id}`}
          className="rpt-preview-btn"
          onClick={() => onPreview(report)}
        >
          🔍 {t('reportsPreviewBtn')}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */

const Reports = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [previewReport, setPreviewReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter + search logic
  const filtered = reports.filter((r) => {
    const issues = (r.detected_issues || '').toLowerCase();
    const priority = (r.maintenance_priority || '').toLowerCase();

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'Critical' && priority === 'critical') ||
      (activeFilter === 'High' && priority === 'high') ||
      (activeFilter === 'pothole' && issues.includes('pothole')) ||
      (activeFilter === 'crack' && issues.includes('crack')) ||
      (activeFilter === 'water' && (issues.includes('water') || issues.includes('flood')));

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      issues.includes(q) ||
      priority.includes(q) ||
      String(r.id).includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="rpt-page">
      {/* Page Header */}
      <div className="rpt-page-header">
        <div>
          <h1 className="rpt-page-title">{t('reportsTitle')}</h1>
          <p className="rpt-page-subtitle">
            <span className="rpt-live-dot" />
            {t('reportsSubtitle')}
          </p>
        </div>
        <button
          id="reports-refresh-btn"
          className="rpt-refresh-btn"
          onClick={fetchReports}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="rpt-controls">
        <input
          id="reports-search"
          type="text"
          className="rpt-search-input"
          placeholder={t('reportsSearch')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="rpt-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              className={`rpt-filter-btn ${activeFilter === f.key ? 'rpt-filter-active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      {!loading && !error && (
        <div className="rpt-stats-strip">
          <span>Total: <strong>{reports.length}</strong></span>
          <span>Showing: <strong>{filtered.length}</strong></span>
          <span>Critical: <strong style={{ color: '#ef4444' }}>
            {reports.filter(r => r.maintenance_priority === 'Critical').length}
          </strong></span>
          <span>High: <strong style={{ color: '#f97316' }}>
            {reports.filter(r => r.maintenance_priority === 'High').length}
          </strong></span>
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="rpt-loading">
          <div className="rpt-spinner" />
          <p>{t('reportsLoading')}</p>
        </div>
      )}

      {error && (
        <div className="rpt-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchReports} className="rpt-retry-btn">Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rpt-empty">
          <span className="rpt-empty-icon">📭</span>
          <p>{t('reportsNoResults')}</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="rpt-cards-list">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onPreview={setPreviewReport}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewReport && (
        <ReportPreview
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          t={t}
        />
      )}
    </div>
  );
};

export default Reports;
