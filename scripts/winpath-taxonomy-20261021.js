// winpath-taxonomy-20261021.js — instrument-only DIAG for backlog #754.
//
// Classifies EVERY win in the committed winning-substrate corpora by rung
// ladder: LEAD / BELONG / COVENANT / TRADE / CONQUEST / REFUSE national-sat,
// mixed-rungs, court-skipped (won without ever sitting the court), plus the
// honest end-state-only classes (held-national, unheld-national) for corpora
// whose instruments did not record ever-national.
//
// Ladder grounding (src/js reads, 2026-10-21 — NO canon doc covers the
// win-path ladder, so every mechanism claim below is code-grounded):
// - hierarchy.js: scale is a ladder (village/regional/national/global, never
//   a skip); national is a polity, reached six ways — LEAD (Haven primary of
//   >=3 seasoned subs), BELONG (subordinate in good standing), COVENANT
//   (peer league >=4 fires), TRADE (trade league >=4), CONQUEST (led realm,
//   all subs taken by force), REFUSE (played permanent refusal of the scale).
// - progression.js deedGateReady(): the FULL table seat's deed gate — waves
//   5/5/4/3/2 faced, 3+ contests, 3+ crises, stage>=2, food-thesis deeds — and
//   NO scale rung: "STANDING (2026-10-13, Steve): the separate scale rung is
//   DROPPED ... the Feared path must be able to sit at the table without
//   links."
// - table.js tableSeat(): the LESSER seat keeps scaleOk = regional+ (not
//   national). So the court is not required by EITHER seat: full = deeds
//   only, lesser = regional+ only.
//
// Pure function over committed JSON corpora. No Game load, no RNG, no writes.
// Usage:
//   node scripts/winpath-taxonomy-20261021.js [evidenceDir]
//     evidenceDir defaults to evidence/2026-10-21 relative to repo root.
// Prints a JSON report to stdout; exits nonzero on any unexplained win or
// recorded instrumentError (the pre-registered DIAG-GO bar).

'use strict';
const fs = require('fs');
const path = require('path');

const TAXONOMY = {
  classes: ['lead', 'belong', 'covenant', 'trade', 'conquest', 'refuse',
    'mixed-rungs', 'court-skipped', 'held-national', 'unheld-national',
    'unwon', 'no-table', 'unexplained'],
};

// classifyWin(rec) -> { class, rung, heldAtWin, courtSkipped, everUnknown, shapes, reason }
// rec: { corpus, seed, base, policy, won, table, nationalEnd, everNational,
//        satShapes:[], winTrack:{path,moral,track,seat}|null, instrumentErrors:[] }
// nationalEnd/everNational are 0/1, or null when the corpus did not record them.
function classifyWin(rec) {
  const out = (cls, extra) => Object.assign({
    class: cls, rung: null, heldAtWin: null, courtSkipped: false,
    everUnknown: false, shapes: (rec.satShapes || []).slice(), reason: '',
  }, extra || {});
  const shapes = (rec.satShapes || []).filter(Boolean);
  const uniq = [...new Set(shapes)];

  // ---- non-wins ----
  if (!rec.won) {
    if (rec.table) return out('unwon', { reason: 'table reached (tableWaiting/tableDone) but no win flag set' });
    return out('no-table', { reason: 'no table, no win' });
  }

  // ---- wins: the table is the win's source; a win without it is incoherent ----
  if (!rec.table) {
    return out('unexplained', { reason: 'won=1 but table=0 — contradicts the table as the win source; no ladder can be built' });
  }

  const everKnown = rec.everNational === 0 || rec.everNational === 1;
  const endKnown = rec.nationalEnd === 0 || rec.nationalEnd === 1;
  const heldAtWin = endKnown ? rec.nationalEnd === 1 : null;

  // ---- ever-state recorded: the full ladder is attributable ----
  if (everKnown) {
    if (rec.everNational === 0) {
      // Won without ever sitting the court — the s64905 case. Legitimate
      // per deedGateReady (full seat: no scale bar) and tableSeat (lesser:
      // regional+ only); NOT a contradiction.
      return out('court-skipped', {
        heldAtWin: false, courtSkipped: true,
        reason: 'won the table having never sat the court (ever-national=0). ' +
          'Permitted by design: the full seat\'s deed gate carries no scale rung ' +
          '(progression.js STANDING 2026-10-13) and the lesser seat needs regional+ only (table.js).',
      });
    }
    // everNational === 1: the rung must be named.
    if (uniq.length === 0) {
      return out('unexplained', {
        reason: 'ever-national=1 but no rung-shape evidence (no natEvents, no nat-true dawn) — the court was sat by an unknown rung',
      });
    }
    if (uniq.length > 1) {
      return out('mixed-rungs', {
        rung: uniq.join('+'), heldAtWin,
        reason: 'sat the court under multiple rungs during the run: ' + uniq.join(', ') +
          (heldAtWin === false ? '; realm not held at the win (sat-then-lost)' : '; realm held at the win'),
      });
    }
    const rung = uniq[0];
    return out(rung, {
      rung, heldAtWin,
      reason: 'sat the court as ' + rung.toUpperCase() +
        (heldAtWin === false ? '; realm NOT held at the win (sat-then-lost — the table came anyway)' :
          heldAtWin === true ? '; realm held at the win' : ''),
    });
  }

  // ---- ever-state NOT recorded: end-state-only honesty classes ----
  if (!endKnown) {
    return out('unexplained', {
      reason: 'no national-state evidence at all (neither ever-state nor end-state recorded) — nothing to build a ladder from',
    });
  }
  if (rec.nationalEnd === 1) {
    return out('held-national', {
      rung: 'unknown', heldAtWin: true, everUnknown: true,
      reason: 'realm held at the win; ever-state not recorded by this corpus\'s instrument, so the rung (lead/belong/...) is unknown',
    });
  }
  return out('unheld-national', {
    rung: 'unknown', heldAtWin: false, everUnknown: true,
    reason: 'realm NOT held at the win; ever-state not recorded — ambiguous between ' +
      'sat-then-lost and court-skipped; the corpus cannot distinguish them',
  });
}

// ---------------- corpus loaders ----------------

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function dissolvetaxRecs(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/^dissolvetax-.*-s\d+\.json$/.test(f) || f.includes('census')) continue;
    const rec = loadJSON(path.join(dir, f));
    // sat shapes: natEvents (kind:'sat') UNION census nat-true dawns
    const shapes = [];
    for (const e of rec.natEvents || []) if (e.kind === 'sat' && e.shape) shapes.push(e.shape);
    try {
      const cen = loadJSON(path.join(dir, f.replace('.json', '.census.json')));
      for (const d of cen.census || []) {
        if (d.nat && d.shape) shapes.push(d.shape);
        for (const [k, v] of Object.entries(d.shapes || {})) if (v === true && k !== 'error') shapes.push(k);
      }
    } catch (e) { /* census optional; natEvents already carry it */ }
    out.push({
      corpus: 'perseed-dissolvetax', seed: rec.seed, base: rec.base, policy: rec.policy,
      won: !!rec.won, table: !!rec.table,
      nationalEnd: rec.national === 1 ? 1 : (rec.national === 0 ? 0 : null),
      everNational: rec.everNational === 1 ? 1 : (rec.everNational === 0 ? 0 : null),
      satShapes: shapes, winTrack: rec.winTrack || null,
      instrumentErrors: rec.instrumentErrors || [],
    });
  }
  return out;
}

function plainRecs(dir, corpus, prefix) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json') || f.startsWith('_') || f.includes('census')) continue;
    const rec = loadJSON(path.join(dir, f));
    out.push({
      corpus, seed: rec.seed, base: prefix, policy: rec.policy || rec.arm || null,
      won: !!rec.won, table: !!rec.table,
      nationalEnd: rec.national === 1 ? 1 : (rec.national === 0 ? 0 : null),
      everNational: null, // these instruments recorded end-state only
      satShapes: [], winTrack: rec.winTrack || null,
      instrumentErrors: rec.instrumentErrors || [],
    });
  }
  return out;
}

// ---------------- main ----------------

function main() {
  const ev = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-21');
  const recs = [
    ...dissolvetaxRecs(path.join(ev, 'perseed-dissolvetax')),
    ...plainRecs(path.join(ev, 'perseed-vgearconfirm'), 'perseed-vgearconfirm', null),
    ...plainRecs(path.join(ev, 'perseed-twovets'), 'perseed-twovets', null),
  ];
  const rows = recs.map(r => {
    const c = classifyWin(r);
    return {
      corpus: r.corpus, seed: r.seed, base: r.base, policy: r.policy,
      won: r.won, table: r.table, nationalEnd: r.nationalEnd, everNational: r.everNational,
      path: (r.winTrack || {}).path || null, track: (r.winTrack || {}).track || null,
      moral: (r.winTrack || {}).moral || null,
      ladder: c.class, rung: c.rung, heldAtWin: c.heldAtWin,
      courtSkipped: c.courtSkipped, everUnknown: c.everUnknown, reason: c.reason,
    };
  });
  const wins = rows.filter(r => r.won);
  const table = {};
  for (const c of TAXONOMY.classes) table[c] = { all: 0 };
  for (const r of wins) {
    table[r.ladder].all++;
    table[r.ladder][r.corpus] = (table[r.ladder][r.corpus] || 0) + 1;
  }
  const unexplained = wins.filter(r => r.ladder === 'unexplained');
  const instrumentErrors = recs.flatMap(r => (r.instrumentErrors || []).map(e => ({ corpus: r.corpus, seed: r.seed, err: e })));
  const report = {
    corpora: ['perseed-dissolvetax', 'perseed-vgearconfirm', 'perseed-twovets'],
    runs: recs.length, wins: wins.length,
    taxonomy: table,
    unexplained: unexplained.length,
    instrumentErrors: instrumentErrors.length,
    rows,
  };
  console.log(JSON.stringify(report, null, 1));
  if (unexplained.length || instrumentErrors.length) {
    console.error(`DIAG-NO-GO: unexplained=${unexplained.length} instrumentErrors=${instrumentErrors.length}`);
    process.exit(2);
  }
}

if (require.main === module) main();

module.exports = { TAXONOMY, classifyWin };
