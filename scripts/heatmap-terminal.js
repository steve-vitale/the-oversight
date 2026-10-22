#!/usr/bin/env node
// scripts/heatmap-terminal.js — P0-1 of the Roguelike Celebration 2026 audit
// (Talk 1 Kingsford/MCTS, gap G2 → proposal P1-1): terminal-state heatmap
// aggregator. HIGHEST value / LOWEST effort.
//
// Pure reader/aggregator over existing sweep/balance rows + harness
// samples.deaths records. ZERO engine changes: it never touches src/js,
// never re-runs sims, never invents data.
//
// Record shapes read (root-caused 2026-10-22 from scripts/sim-harness.js and
// committed sweep corpora — the audit's "won/villageLost/survived" spellings
// do not exist; the real ones do):
//   runDays() result: { policyId, days, endReason, stop:{version,kind,won,...},
//     samples:{deaths:[{day,kind,who,cause,player}]}, ... }
//     endReason ∈ {'village-lost','over-other','survived'} (sim-harness.js:631)
//     a WIN is endReason 'over-other' + stop.won===true.
//   sweep-compare rows: { seed, days, won, endReason, deaths:['villager combat',...], ... }
//     (legacy collectors keep deaths as a top-level string list; no policyId,
//      so --policy applies a label to the whole file.)
//
// Usage:
//   node scripts/heatmap-terminal.js --in rows.json [--in more.json.gz]
//       [--policy <label>] [--title "..."] [--out <prefix>]
// Writes <prefix>.json + <prefix>.html; with no --out the JSON goes to stdout.
//
// Also require()able: { loadRows, normalizeRow, aggregate, renderJSON,
// renderHTML, defaultBuckets }.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Day buckets: terminal state × where-in-the-run. The last bucket is open.
function defaultBuckets() {
  return [
    { label: '0–30', lo: 0, hi: 30 },
    { label: '31–60', lo: 31, hi: 60 },
    { label: '61–90', lo: 61, hi: 90 },
    { label: '91–120', lo: 91, hi: 120 },
    { label: '121–150', lo: 121, hi: 150 },
    { label: '151+', lo: 151, hi: Infinity },
  ];
}

// Canonical terminal-state order (only observed states are emitted).
const TERMINAL_ORDER = ['won', 'village-lost', 'village-dead', 'pop-zero',
  'over-other', 'survived', 'unknown'];

function bucketFor(buckets, day) {
  if (!Number.isFinite(day)) return -1;
  for (let i = 0; i < buckets.length; i++) {
    if (day >= buckets[i].lo && day <= buckets[i].hi) return i;
  }
  return -1;
}

// Normalize one death record. Two real shapes:
//   harness samples.deaths: {day,kind,who,cause,player}
//   legacy sweep rows:      'villager combat' (plain string)
function normalizeDeath(d) {
  if (typeof d === 'string') return { day: null, cause: d, kind: 'unknown', player: false };
  if (d && typeof d === 'object') {
    return {
      day: Number.isFinite(d.day) ? d.day : null,
      cause: d.cause || d.kind || 'unknown',
      kind: d.kind || 'unknown',
      player: !!d.player,
    };
  }
  return { day: null, cause: 'unknown', kind: 'unknown', player: false };
}

// Normalize one sweep/balance run row to {policy, terminal, days, seed, deaths}.
// label: --policy override, applied only when the row carries no policy itself
// (never invents a policy for rows that have one).
function normalizeRow(row, label) {
  if (!row || typeof row !== 'object') return null;
  const policy = String(row.policyId ?? row.policy ?? label ?? 'unknown');
  const won = (row.stop && row.stop.won === true) || row.won === true;
  const terminal = won ? 'won' : String(row.endReason || 'unknown');
  const days = Number.isFinite(row.days) ? row.days : null;
  const rawDeaths = (row.samples && Array.isArray(row.samples.deaths))
    ? row.samples.deaths
    : (Array.isArray(row.deaths) ? row.deaths : []);
  return {
    policy,
    terminal,
    days,
    seed: row.seed ?? null,
    deaths: rawDeaths.map(normalizeDeath),
  };
}

function readJsonMaybeGz(p) {
  const buf = fs.readFileSync(p);
  const text = p.endsWith('.gz') ? zlib.gunzipSync(buf).toString('utf8') : buf.toString('utf8');
  return JSON.parse(text);
}

// Load + normalize rows from one or more JSON/.json.gz files.
// Each file holds a bare array of rows or {rows:[...]} / {runs:[...]}.
function loadRows(paths, opts) {
  opts = opts || {};
  const rows = [];
  for (const p of paths) {
    const doc = readJsonMaybeGz(p);
    const list = Array.isArray(doc) ? doc : (doc.rows || doc.runs || []);
    for (const r of list) {
      const n = normalizeRow(r, opts.policyLabel);
      if (n) rows.push(n);
    }
  }
  return rows;
}

function aggregate(rows, opts) {
  opts = opts || {};
  const buckets = opts.buckets || defaultBuckets();
  const byPolicy = {};
  const deaths = {}; // deaths[terminal][bucketIdx] = {total, causes:{cause:n}}
  let skippedNoDays = 0;
  let skippedDeathsNoDay = 0;

  for (const r of rows) {
    const p = byPolicy[r.policy] || (byPolicy[r.policy] = {
      policy: r.policy, total: 0, terminals: {}, cells: {},
    });
    p.total++;
    const t = p.terminals[r.terminal] || (p.terminals[r.terminal] = { total: 0 });
    t.total++;
    const bi = bucketFor(buckets, r.days);
    if (bi < 0) {
      skippedNoDays++;
    } else {
      const cells = p.cells[r.terminal] || (p.cells[r.terminal] = {});
      const c = cells[bi] || (cells[bi] = { n: 0 });
      c.n++;
    }
    for (const d of r.deaths) {
      const db = bucketFor(buckets, d.day);
      if (db < 0) { skippedDeathsNoDay++; continue; }
      const td = deaths[r.terminal] || (deaths[r.terminal] = {});
      const bc = td[db] || (td[db] = { total: 0, causes: {} });
      bc.total++;
      bc.causes[d.cause] = (bc.causes[d.cause] || 0) + 1;
    }
  }

  const policies = Object.values(byPolicy).map(p => {
    const cells = {};
    for (const t of Object.keys(p.cells)) {
      cells[t] = buckets.map((_, i) => {
        const n = (p.cells[t][i] && p.cells[t][i].n) || 0;
        return { n, share: p.total ? n / p.total : 0 };
      });
    }
    const terminals = {};
    for (const t of Object.keys(p.terminals)) {
      terminals[t] = { total: p.terminals[t].total, share: p.total ? p.terminals[t].total / p.total : 0 };
    }
    return { policy: p.policy, total: p.total, terminals, cells };
  }).sort((a, b) => a.policy.localeCompare(b.policy));

  const observedTerminals = TERMINAL_ORDER.filter(t =>
    policies.some(p => p.terminals[t] || Object.keys(p.cells).includes(t)));

  const deathTables = {};
  for (const t of Object.keys(deaths)) {
    deathTables[t] = buckets.map((_, i) => {
      const e = deaths[t][i];
      if (!e) return { total: 0, top: [] };
      const top = Object.entries(e.causes).sort((a, b) => b[1] - a[1]).slice(0, 4)
        .map(([cause, n]) => ({ cause, n, share: e.total ? n / e.total : 0 }));
      return { total: e.total, top };
    });
  }

  return {
    schema: 'heatmap-terminal/1',
    title: opts.title || 'Terminal-state heatmap',
    generatedAt: new Date().toISOString(),
    sources: opts.sources || [],
    rowCount: rows.length,
    skippedNoDays,
    skippedDeathsNoDay,
    buckets: buckets.map(b => b.label),
    terminals: observedTerminals,
    policies,
    deaths: deathTables,
  };
}

function renderJSON(matrix) {
  return JSON.stringify(matrix, null, 2);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function pct(x) {
  return (x * 100).toFixed(x > 0 && x < 0.01 ? 1 : 0) + '%';
}

// Heat color: white → amber → deep red by share within the policy facet.
function cellStyle(share) {
  if (share <= 0) return 'background:#f5f5f2;color:#aaa;';
  const s = Math.min(1, share);
  const r = Math.round(255 - s * 45);        // 255 → 210
  const g = Math.round(245 - s * 190);       // 245 → 55
  const b = Math.round(235 - s * 175);       // 235 → 60
  const fg = s > 0.45 ? '#fff' : '#3a1a1a';
  return `background:rgb(${r},${g},${b});color:${fg};font-weight:600;`;
}

function renderHTML(matrix) {
  const parts = [];
  parts.push('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">');
  parts.push('<meta name="viewport" content="width=device-width,initial-scale=1">');
  parts.push(`<title>${esc(matrix.title)}</title>`);
  parts.push(`<style>
body{font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;margin:16px;color:#222;max-width:1100px;}
h1{font-size:1.3em;margin-bottom:2px;}h2{font-size:1.05em;margin:26px 0 6px;}
.meta{color:#666;font-size:.85em;margin-bottom:8px;}
table{border-collapse:collapse;font-size:.82em;margin:6px 0 18px;}
th,td{border:1px solid #d8d8d2;padding:5px 8px;text-align:center;white-space:nowrap;}
th{background:#efefea;color:#444;}th.rowhead,td.rowhead{text-align:left;background:#f7f7f4;}
.legend{font-size:.8em;color:#555;margin:4px 0 14px;}
.small{font-size:.75em;color:#777;}
ul.deaths{font-size:.82em;margin:4px 0 14px;padding-left:18px;}
</style></head><body>`);
  parts.push(`<h1>${esc(matrix.title)}</h1>`);
  parts.push(`<div class="meta">Generated ${esc(matrix.generatedAt)} · ${matrix.rowCount} runs` +
    ` from ${matrix.sources.length} source file(s)` +
    (matrix.skippedNoDays ? ` · ${matrix.skippedNoDays} run(s) without a day count excluded from buckets` : '') +
    (matrix.sources.length ? `<br>Sources: ${matrix.sources.map(esc).join(', ')}` : '') +
    '</div>');
  parts.push('<div class="legend">Cell color = share of that policy\'s runs ending in this ' +
    'terminal state × day bucket. Redder = more runs end HERE.</div>');

  for (const p of matrix.policies) {
    parts.push(`<h2>Policy: ${esc(p.policy)} — ${p.total} run(s)</h2>`);
    parts.push('<table><tr><th class="rowhead">terminal ↓ &nbsp;·&nbsp; day bucket →</th>' +
      matrix.buckets.map(b => `<th>${esc(b)}</th>`).join('') + '<th>total</th></tr>');
    for (const t of matrix.terminals) {
      const term = p.terminals[t];
      if (!term && !p.cells[t]) continue;
      const cells = p.cells[t] || {};
      parts.push(`<tr><td class="rowhead">${esc(t)}</td>`);
      for (let i = 0; i < matrix.buckets.length; i++) {
        const c = cells[i] || { n: 0, share: 0 };
        const label = c.n ? `${c.n} (${pct(c.share)})` : '—';
        parts.push(`<td style="${cellStyle(c.share)}">${label}</td>`);
      }
      parts.push(`<td class="rowhead"><b>${term ? term.total : 0}</b>` +
        (term ? ` (${pct(term.share)})` : '') + '</td></tr>');
    }
    parts.push('</table>');
  }

  const dterms = Object.keys(matrix.deaths);
  if (dterms.length) {
    parts.push('<h2>What kills them — top death causes by terminal state × day bucket</h2>');
    for (const t of matrix.terminals) {
      const dt = matrix.deaths[t];
      if (!dt) continue;
      parts.push(`<h3 style="font-size:.9em;margin:14px 0 2px;">${esc(t)}</h3><ul class="deaths">`);
      let any = false;
      for (let i = 0; i < matrix.buckets.length; i++) {
        const b = dt[i];
        if (!b || !b.total) continue;
        any = true;
        const tops = b.top.map(x => `${esc(x.cause)} ${x.n} (${pct(x.share)})`).join(' · ');
        parts.push(`<li><b>day ${esc(matrix.buckets[i])}</b> — ${b.total} deaths: ${tops}</li>`);
      }
      if (!any) parts.push('<li class="small">no death records</li>');
      parts.push('</ul>');
    }
  }
  parts.push('<p class="small">Built by scripts/heatmap-terminal.js (rogue P0-1). ' +
    'Pure reader: no engine changes, no re-simulation.</p>');
  parts.push('</body></html>');
  return parts.join('\n');
}

// ---- CLI ----
function main(argv) {
  const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
  const ins = [];
  for (let i = 0; i < argv.length; i++) if (argv[i] === '--in' && argv[i + 1]) ins.push(argv[++i]);
  if (!ins.length) {
    console.error('usage: node scripts/heatmap-terminal.js --in rows.json [--in more.json.gz] [--policy label] [--title t] [--out prefix]');
    process.exit(2);
  }
  const rows = loadRows(ins, { policyLabel: val('--policy', null) });
  const matrix = aggregate(rows, {
    title: val('--title', 'Terminal-state heatmap'),
    sources: ins.map(p => path.basename(p)),
  });
  const out = val('--out', null);
  if (out) {
    fs.writeFileSync(out + '.json', renderJSON(matrix));
    fs.writeFileSync(out + '.html', renderHTML(matrix));
    console.log(`wrote ${out}.json + ${out}.html (${matrix.rowCount} runs, ${matrix.policies.length} policies)`);
  } else {
    console.log(renderJSON(matrix));
  }
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { loadRows, normalizeRow, normalizeDeath, aggregate, renderJSON, renderHTML, defaultBuckets, TERMINAL_ORDER };
