// wintrack-audit — DIAGNOSTIC AUDIT of win-track variety on the SEATDRIVE=1
// substrate (flesh-out loop, 2026-10-20, arm sim-wintrack-audit, axis
// scale-onramp).
//
// INSTRUMENT-ONLY: zero src/js changes, zero game eval, zero RNG. This is an
// OFFLINE read-only analyzer over the COMMITTED corpora:
//   armed:   evidence/2026-10-20/perseed-tablepathdriver/          (SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYDARK=1, 16 runs)
//   control: evidence/2026-10-20/perseed-tablepathdriver-control/ (SEATDRIVE=1, driver OFF — the natural track, 16 runs)
// It never writes into the corpus dirs; the report goes only to the output
// path. The det-gate (see scripts/test-wintrack-audit-20261020.js) proves
// read-only (corpus hashes unchanged) + deterministic (double-run
// byte-identical reports).
//
// Questions answered:
//  1. Per run: which of the 7 table doors engaged, in what order, and which
//     door the win (if any) went through.
//  2. Attribution completeness: every win + every non-win stall attributed,
//     0 unexplained.
//  3. Per-door reachability on this substrate.
//  4. (sense is done by reading transcripts; this instrument supplies the
//     win-door map the sense read samples from.)
'use strict';
const fs = require('fs');
const path = require('path');

const DOORS = ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant', 'relay'];

function loadCorpus(dir) {
  const out = [];
  for (const pol of ['belongfeast', 'leadfeast']) {
    const pdir = path.join(dir, pol);
    if (!fs.existsSync(pdir)) continue;
    for (const f of fs.readdirSync(pdir).filter(x => /^s\d+\.json$/.test(x))) {
      out.push(JSON.parse(fs.readFileSync(path.join(pdir, f), 'utf8')));
    }
  }
  out.sort((a, b) => (a.policyId + a.seed) < (b.policyId + b.seed) ? -1 : 1);
  return out;
}

function runTag(r) { return r.policyId + '-s' + String(r.seed).slice(-5); }

// attributeRun: one per-seed record -> attribution object. Returns
// {tag, won, door, branch, via, mechanism, stallClass, unexplained, notes[]}
// Win rule: canonical door = endRec.tb.path/branch, cross-checked against
// the last finalsEvent. Mismatch or missing -> UNEXPLAINED (never guessed).
function attributeRun(r) {
  const tag = runTag(r);
  const tpd = r.tpdSummary || {};
  const notes = [];
  const doorEvents = (tpd.doorEvents || []).map(d => ({
    day: d.day, picked: String(d.picked || '').replace(/^path:/, ''),
    fellBack: !!d.fellBack, why: d.why || null, missWhy: d.missWhy || null,
  }));
  const walked = (tpd.walked || []).map(w => ({ day: w.day, path: w.path, branch: w.branch, fellBack: !!w.fellBack }));
  const finals = (tpd.finalsEvents || []).map(e => ({ day: e.day, path: e.path, branch: e.branch, finalId: e.finalId }));
  const rd = r.rdSummary || null;

  if (r.won) {
    const tb = ((r.endRec || {}).tb) || {};
    const door = tb.path || null, branch = tb.branch || null;
    const lastFinal = finals.length ? finals[finals.length - 1] : null;
    let via = 'endRec.tb';
    if (!door || !branch) {
      return { tag, won: true, door: null, branch: null, via, mechanism: null, stallClass: null, unexplained: true,
        notes: notes.concat(['UNEXPLAINED: endRec.tb.path/branch missing on a won run']) };
    }
    if (!lastFinal || lastFinal.path !== door || lastFinal.branch !== branch) {
      return { tag, won: true, door, branch, via, mechanism: null, stallClass: null, unexplained: true,
        notes: notes.concat(['UNEXPLAINED: finalsEvents do not match endRec.tb door/branch']) };
    }
    const mechanism = `win through ${door}/${branch} — doorEvents=[${doorEvents.map(d => d.picked + (d.fellBack ? '(fb)' : '(as)')).join(',') || 'none'}]` +
      ` walked=[${walked.map(w => w.path + '/' + w.branch).join(',') || 'none'}] finals=${door}/${branch}@d${lastFinal.day}` +
      ` seat=${tb.seat || '?'} beat=${tb.beat != null ? tb.beat : '?'} margins=${(tpd.branchMargins && Object.keys(tpd.branchMargins).length) ? 'recorded' : 'absent'}`;
    return { tag, won: true, door, branch, via, mechanism, stallClass: null, unexplained: false,
      doorEvents, walked, finals, notes,
      hasBranchMargins: !!((tpd.branchMargins && Object.keys(tpd.branchMargins).length)),
      rdAtEnd: rd ? { active: !!rd.active, claimed: rd.claimed | 0, lean: rd.lean, grounding: rd.grounding, darkUses: rd.darkUses | 0 } : null };
  }

  // Non-win: stall mechanism.
  let stallClass = null, mechanism = null;
  const tableDay = r.tableDay, satEver = !!r.satEver, endReason = r.endReason;
  if (tableDay == null && !satEver && endReason === 'village-lost') {
    stallClass = 'pre-table-collapse';
    const d = r.deathsAttributed || {};
    mechanism = `village collapsed d${r.gameDays} before the table was ever announced (tableDay=None) — ` +
      `assigned door ${r.tpAssigned || '?'} never engaged (answers=${tpd.answers | 0}); ` +
      `death channels: ${JSON.stringify(d.causeSpace || {})}`;
  } else if (tableDay != null && r.tableDoneDay == null && !satEver && endReason === 'village-lost') {
    stallClass = 'invitation-window-collapse';
    const d = r.deathsAttributed || {};
    mechanism = `table announced d${tableDay} but the village collapsed d${r.gameDays} before sitting — ` +
      `assigned door ${r.tpAssigned || '?'} never engaged; death channels: ${JSON.stringify(d.causeSpace || {})}`;
  } else if (!satEver && (endReason === 'survived' || r.gameDays >= 180)) {
    stallClass = 'no-invitation-stall';
    mechanism = `survived to d${r.gameDays} but the table never announced (tableActiveDays=${r.tableActiveDays | 0}, maxWave=${r.maxWave != null ? r.maxWave : '?'})` +
      (rd && rd.active ? `; relaydark road completed d${rd.doneDay} (lean=${rd.lean}, darkUses=${rd.darkUses | 0}) — road-active stall` : '');
  }
  if (!stallClass) {
    return { tag, won: false, door: null, branch: null, via: null, mechanism: null, stallClass: null, unexplained: true,
      doorEvents, walked, finals, notes: notes.concat(['UNEXPLAINED: no stall class matched (endReason=' + endReason + ', tableDay=' + tableDay + ', satEver=' + satEver + ')']) };
  }
  return { tag, won: false, door: null, branch: null, via: null, mechanism, stallClass, unexplained: false,
    doorEvents, walked, finals, notes };
}

// auditArmed: full attribution over the driver corpus.
function auditArmed(recs) {
  const runs = recs.map(attributeRun);
  const wins = runs.filter(x => x.won), nonwins = runs.filter(x => !x.won);
  const unexplained = runs.filter(x => x.unexplained);
  const byDoor = {};
  for (const w of wins) {
    const k = w.door + '/' + w.branch;
    byDoor[k] = byDoor[k] || { door: w.door, branch: w.branch, runs: [] };
    byDoor[k].runs.push(w.tag);
  }
  // Per-door reachability: engaged (doorEvent pick), walked (challenge entered), won-through.
  const reach = {};
  for (const d of DOORS) reach[d] = { engaged: [], walked: [], won: [], earnedEvidence: [] };
  for (const x of runs) {
    for (const de of (x.doorEvents || [])) {
      if (DOORS.indexOf(de.picked) >= 0 && reach[de.picked].engaged.indexOf(x.tag) < 0) {
        reach[de.picked].engaged.push(x.tag);
        if (de.missWhy) reach[de.picked].earnedEvidence.push(x.tag + ': assigned-miss: ' + String(de.missWhy).slice(0, 140));
      }
    }
    for (const w of (x.walked || [])) if (reach[w.path] && reach[w.path].walked.indexOf(x.tag) < 0) reach[w.path].walked.push(x.tag);
    if (x.won && reach[x.door] && reach[x.door].won.indexOf(x.tag) < 0) reach[x.door].won.push(x.tag);
  }
  // The 5 pre-registered tablepathdriver legs (sim-tablepathdriver evidence header).
  const legs = {
    leg1_relayWalks: runs.filter(x => x.won && x.door === 'relay').map(x => x.tag),
    leg2_defiantWalks: runs.filter(x => x.won && x.door === 'defiant').map(x => x.tag),
    leg3_indispensableWitness: runs.filter(x => (x.doorEvents || []).some(d => d.picked === 'indispensable' || d.picked === 'witness') || (x.won && (x.door === 'indispensable' || x.door === 'witness'))).map(x => ({ tag: x.tag, wonDoor: x.won ? x.door : null })),
    leg4_ledgerDarkMargins: runs.filter(x => x.won && x.hasBranchMargins).map(x => x.tag),
    leg5_relayDarkBand: runs.filter(x => x.won && x.door === 'relay').map(x => ({ tag: x.tag, rd: x.rdAtEnd })),
  };
  return {
    n: runs.length, wins: wins.length, nonwins: nonwins.length,
    unexplained: unexplained.map(x => x.tag),
    completeness: runs.length ? (runs.length - unexplained.length) / runs.length : 1,
    byDoor, reach, legs, runs,
  };
}

// auditControl: the natural (un-driven) track — door distribution of wins.
function auditControl(recs) {
  const wins = [], nonwins = [];
  for (const r of recs) {
    const tag = runTag(r);
    if (r.won) {
      const tb = ((r.endRec || {}).tb) || {};
      wins.push({ tag, door: tb.path || null, branch: tb.branch || null, seat: tb.seat || null,
        unexplained: !(tb.path && tb.branch) });
    } else {
      nonwins.push({ tag, endReason: r.endReason, gameDays: r.gameDays, satEver: !!r.satEver, tableDay: r.tableDay,
        unexplained: false,
        mechanism: r.endReason === 'village-lost' && !r.satEver
          ? `village-lost d${r.gameDays}, never sat (natural track never reached the table)`
          : `non-win, endReason=${r.endReason}` });
    }
  }
  const dist = {};
  for (const w of wins) { const k = (w.door || '?') + '/' + (w.branch || '?'); dist[k] = (dist[k] | 0) + 1; }
  return { n: recs.length, wins: wins.length, nonwins, dist, winDoors: wins,
    unexplained: wins.filter(w => w.unexplained).map(w => w.tag) };
}

function main() {
  const repo = path.resolve(__dirname, '..');
  const armedDir = path.join(repo, 'evidence', '2026-10-20', 'perseed-tablepathdriver');
  const ctrlDir = path.join(repo, 'evidence', '2026-10-20', 'perseed-tablepathdriver-control');
  const outPath = process.env.OUT || path.join(repo, 'evidence', '2026-10-20', 'wintrack-audit-report.json');
  const armed = auditArmed(loadCorpus(armedDir));
  const control = auditControl(loadCorpus(ctrlDir));
  const report = { generated: 'sim-wintrack-audit 2026-10-20', armedDir, ctrlDir, armed, control };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 1));
  // Console MD summary for the evidence file.
  console.log('## win-track audit — armed (SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYDARK=1)');
  console.log(`runs=${armed.n} wins=${armed.wins} nonwins=${armed.nonwins} completeness=${(armed.completeness * 100).toFixed(1)}% unexplained=[${armed.unexplained.join(',') || 'none'}]`);
  console.log('wins by door/branch:');
  for (const k of Object.keys(armed.byDoor)) console.log(`  ${k}: ${armed.byDoor[k].runs.length} [${armed.byDoor[k].runs.join(', ')}]`);
  console.log('non-win stall mechanisms:');
  for (const x of armed.runs.filter(r => !r.won)) console.log(`  ${x.tag} [${x.stallClass}]: ${x.mechanism}`);
  console.log('per-door reachability (engaged/walked/won):');
  for (const d of DOORS) {
    const rc = armed.reach[d];
    console.log(`  ${d}: engaged=${rc.engaged.length} walked=${rc.walked.length} won=${rc.won.length}`);
    for (const e of rc.earnedEvidence) console.log(`    - ${e}`);
  }
  console.log('## control — natural track (SEATDRIVE=1, driver OFF)');
  console.log(`runs=${control.n} wins=${control.wins} dist=${JSON.stringify(control.dist)} unexplained=[${control.unexplained.join(',') || 'none'}]`);
  console.log(`wrote ${outPath}`);
}

if (require.main === module) main();
module.exports = { attributeRun, auditArmed, auditControl, loadCorpus, DOORS };
