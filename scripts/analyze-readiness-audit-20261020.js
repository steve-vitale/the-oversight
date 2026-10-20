#!/usr/bin/env node
// analyze-readiness-audit-20261020.js — readiness-gate stall attribution.
//
// For every run with wave-4 unlocked but wave-5 never unlocked (peak>=4,
// peak<5), attribute the binding leg(s) WITH THE MECHANISM — what the gate
// counted vs what the village actually held, from the census in the
// per-seed JSONs (evidence/2026-10-20/perseed-readiness-audit/).
//
// PRIMARY (pre-registered, binding): attribution completeness — every
// eligible run carries >= 1 named mechanism attribution. The analyzer
// FAILS LOUD (exit != 0) on any eligible run with 0 attributions.
// GO = 100% attributed. MISS = any unattributed run (never re-scored).
//
// Stall classes (from sim-w5door-measure, verbatim):
//   unlocked             — peak >= 5 (the w5 door opened).
//   engaged-but-failed   — deferral(5) true >= 1 day but the door never opened.
//   progressed-but-stalled — wave-4 unlocked (peak >= 4) but deferral(5) never true.
//   never-progressed     — peak < 4 all run.
//
// Usage:
//   node scripts/analyze-readiness-audit-20261020.js
//   node scripts/analyze-readiness-audit-20261020.js --quiet   # summary only
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-readiness-audit');
const OUT_MD = path.join(__dirname, '..', 'evidence', '2026-10-20', 'readiness-audit-stall-attribution.md');
const quiet = process.argv.includes('--quiet');

function loadRuns() {
  const runs = [];
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const dir = path.join(EVID, policyId);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => /^s\d+\.json$/.test(x))) {
      runs.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
    }
  }
  return runs;
}

function stallClass(r) {
  const peak = Math.max(...r.recs.map(x => x.peak | 0), 0);
  if (peak >= 5) return 'unlocked';
  const defDays = r.recs.filter(x => x.def5).length;
  if (defDays >= 1) return 'engaged-but-failed';
  if (peak >= 4) return 'progressed-but-stalled';
  return 'never-progressed';
}

// Window outcome for engaged runs: released | died | won | horizon | regressed
function windowOutcome(r) {
  if (r.wave5) return 'released';
  if (r.won) return 'won';
  const endReason = String(r.endReason || '');
  const lastRec = r.recs[r.recs.length - 1];
  const lastDef = lastRec && lastRec.def5;
  if (/lost|dead|wiped|fallen/i.test(endReason)) return 'died';
  if (lastDef) return 'horizon';
  return 'regressed';
}

function diedWithin30d(killerVid, firstKillD, deathList) {
  // deathList entries: {day, who, player, ...}. Match by name substring of vid? — the
  // census killers carry names; deathList 'who' carries display names. Best-effort:
  // match when who contains the vid or the name.
  for (const d of deathList || []) {
    const who = String(d.who || '');
    const vid = String(killerVid || '');
    if (who && vid && (who === vid || who.includes(vid) || vid.includes(who))) {
      const dd = (d.day | 0) - (firstKillD | 0);
      if (dd >= 0 && dd <= 30) return { day: d.day | 0, lag: dd };
    }
  }
  return null;
}

function fmtKiller(k, deathHit) {
  const bits = [`${k.name}${k.living ? '' : ' (DEAD)'}`];
  bits.push(`first w4+ kill d${k.firstKillD} (${k.firstKillMid || '?'}, via=${k.via})`);
  if (!k.living && deathHit) bits.push(`died d${deathHit.day} (+${deathHit.lag}d)`);
  return bits.join(' ');
}

function attribute(r) {
  const atts = [];
  const ec = r.endCensus || {};
  const g = ec.gate || {};
  const dem = ec.demand || { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 };
  const cls = stallClass(r);
  if (cls === 'unlocked' || cls === 'never-progressed') return atts;
  const defDays = r.recs.filter(x => x.def5);
  // window-max of each gate bar across deferral(5) days
  const wmax = { armored: 0, armed: 0, tricks: 0, veterans: 0 };
  for (const rec of defDays) {
    const cg = (rec.census && rec.census.gate) || {};
    for (const k of Object.keys(wmax)) wmax[k] = Math.max(wmax[k], (cg[k] | 0) || 0);
  }
  const st = r.standing || {};
  if (cls === 'progressed-but-stalled') {
    // B1 standing-short: the door was never approached; the mechanism is the
    // standing bind, plus what would bind next if it had been.
    const plentyCapped = (st.plenty | 0) > 100;
    atts.push({ leg: 'standing-short',
      mech: `capped=${st.capped} < 200, raw=${st.raw} (war=${st.war} pts=${st.warPts}, dip=${st.dip} links=${st.links}, plenty=${st.plenty} feasts=${st.feasts}${plentyCapped ? ', PLENTY-CAPPED at 100 toward t5' : ''}); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose` });
    // Would-bind-next: readiness legs short at terminal, with mechanism.
    const short = (g.short || []);
    for (const leg of short) atts.push(...legMech(r, leg, dem, g, ec, wmax, 'would-bind'));
    return atts;
  }
  // engaged-but-failed: the readiness legs that never filled, with mechanism.
  const out = windowOutcome(r);
  if (out === 'died') atts.push({ leg: 'died-in-window', mech: `a deferral(5) window ended with the village lost (end=${r.endReason}, ${defDays.length}d at the door)` });
  else if (out === 'regressed') atts.push({ leg: 'regressed', mech: `a deferral(5) window ended alive with capped standing < 200` });
  else if (out === 'horizon') atts.push({ leg: 'horizon', mech: `deferral(5) true at run end (village alive, unwon, ${defDays.length}d at the door)` });
  const short = (g.short || []);
  for (const leg of short) atts.push(...legMech(r, leg, dem, g, ec, wmax, 'binding'));
  return atts;
}

function legMech(r, leg, dem, g, ec, wmax, kind) {
  const out = [];
  const wm = (k) => `${wmax[k]}/${(dem[k] === undefined || dem[k] === null) ? '?' : dem[k]}`;
  if (leg === 'armor') {
    const near = (ec.armor && ec.armor.near) || [];
    const nearStr = near.length
      ? `; NEAR-MISS held-but-uncounted: ${near.map(n => `${n.name} P${n.wornP} worn, ${n.mech === 'pack-not-worn' ? `P${n.p} ${n.item} in PACK not worn` : `P${n.p} ${n.item} in OWN STASH not fetched`}`).join(' | ')}`
      : `; no near-miss: ${ec.armor ? ec.armor.woreNothing : '?'} living fighters wore no armor and held none at P>=${dem.armorP}`;
    out.push({ leg: 'readiness-armor', mech: `${kind}: gate ${g.armored | 0}/${dem.armored} armored at P>=${dem.armorP} (window max ${wm('armored')})${nearStr}. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.` });
  } else if (leg === 'weapons') {
    const w = ec.weapons || {};
    const arm = (w.armoryList || []).map(e => `${e.id}x${e.units}`).join(', ') || 'empty';
    out.push({ leg: 'readiness-weapons', mech: `${kind}: gate ${g.armed | 0}/${dem.armed} armed (window max ${wm('armed')}); village ARMORY holds ${w.armoryUnits | 0} weapon units unborrowed [${arm}] — on NO villager, invisible to the armed leg until borrowed; ${w.carriedNotEquipped | 0} counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); ${w.unarmed | 0} living fighters with neither equipped nor carried weapon` });
  } else if (leg === 'tricks') {
    const t = ec.tricks || {};
    out.push({ leg: 'readiness-tricks', mech: `${kind}: gate ${g.tricks | 0}/${dem.tricks} counters known [${(t.known || []).join(', ') || 'none'}] (window max ${wm('tricks')}); waves 3-5 are deliberately counter-less — discoverMonsterCounter fails closed without a def counter field, so the bar can only ever count wave 1-2 tricks (by design, not a gap)` });
  } else if (leg === 'veterans') {
    const v = ec.veterans || {};
    const killers = (v.killers || []).map(k => fmtKiller(k, diedWithin30d(k.vid, k.firstKillD, r.deathList)));
    out.push({ leg: 'readiness-veterans', mech: `${kind}: gate ${g.veterans | 0}/${dem.veterans} LIVING distinct wave-4+ killers (window max ${wm('veterans')}); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = ${v.shadow | 0}; killers: ${killers.join(' | ') || 'none'}; unattributed wave-4+ kills (by=null): ${v.unattributed | 0}. VETSHAPE unset in this substrate — dead killers do not count.` });
  }
  return out;
}

function main() {
  const runs = loadRuns();
  if (!runs.length) { console.error('ANALYZE: no per-seed JSONs found.'); process.exit(2); }
  const eligible = runs.filter(r => { const p = Math.max(...r.recs.map(x => x.peak | 0), 0); return p >= 4 && p < 5; });
  const rows = [];
  let unattributed = 0;
  for (const r of eligible) {
    const cls = stallClass(r);
    const atts = attribute(r);
    if (!atts.length) unattributed++;
    rows.push({ seed: r.seed, policy: r.policyId, stall: cls, peak: Math.max(...r.recs.map(x => x.peak | 0), 0),
      def5d: r.recs.filter(x => x.def5).length, end: r.endReason, atts });
  }
  // Markdown report.
  const lines = [];
  lines.push('# readiness-audit stall attribution — 16 runs');
  lines.push('');
  lines.push(`PRIMARY: ${eligible.length} runs with wave-4 unlocked but wave-5 never unlocked; ${unattributed} unattributed → ${unattributed === 0 ? 'GO' : 'NO-GO'}`);
  lines.push('');
  lines.push('| seed | policy | stall | peak | def5d | end | attributions |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const row of rows) {
    const legs = row.atts.map(a => a.leg).join('+') || 'NONE';
    lines.push(`| ${row.seed} | ${row.policy} | ${row.stall} | ${row.peak} | ${row.def5d} | ${String(row.end).slice(0, 24)} | ${legs} |`);
  }
  lines.push('');
  lines.push('## Mechanism detail (eligible runs)');
  lines.push('');
  for (const row of rows) {
    lines.push(`### ${row.policy}-s${row.seed} (${row.stall}, end ${row.end})`);
    for (const a of row.atts) lines.push(`- ${a.leg}: ${a.mech}`);
    lines.push('');
  }
  // Wall numbers.
  const wall = { national: 0, table: 0, wins: 0, w4: 0, w5: 0 };
  const surv = [];
  const causes = {};
  for (const r of runs) {
    if (r.maxWave >= 4) wall.w4++;
    if (r.maxWave >= 5) wall.w5++;
    if (r.won) wall.wins++;
    surv.push(r.gameDays | 0);
    for (const [k, v] of Object.entries(r.deaths || {})) causes[k] = (causes[k] || 0) + v;
  }
  surv.sort((a, b) => a - b);
  const med = surv.length ? surv[surv.length >> 1] : 0;
  lines.push('## Wall numbers');
  lines.push('');
  lines.push(`- wave reach: w4 ${wall.w4}/${runs.length}, w5 ${wall.w5}/${runs.length}`);
  lines.push(`- wins: ${wall.wins}/${runs.length}`);
  lines.push(`- median survival: ${med}d; max: ${Math.max(...surv)}d`);
  lines.push(`- death causes: ${Object.entries(causes).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  lines.push('');
  fs.writeFileSync(OUT_MD, lines.join('\n'));
  if (!quiet) {
    console.log(`eligible: ${eligible.length}, unattributed: ${unattributed} -> ${unattributed === 0 ? 'GO' : 'NO-GO'}`);
    for (const row of rows) console.log(`  ${row.policy}/s${row.seed} [${row.stall}] def5d=${row.def5d}: ${row.atts.map(a => a.leg).join(' + ') || 'NONE'}`);
    console.log(`report: ${OUT_MD}`);
  }
  if (unattributed > 0) { console.error(`ATTRIBUTION FAILED: ${unattributed} eligible runs unattributed.`); process.exit(1); }
  console.log('ATTRIBUTION COMPLETE.');
}

main();
