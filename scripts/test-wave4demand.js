#!/usr/bin/env node
// scripts/test-wave4demand.js — sim-wave4demand-a analyzer / proof validator.
// Builds the wave-4 fight-demand table from the corpus rows (no
// re-simulation), validates rows, checks parity vs the partyfinish
// CONTROL corpus, cross-checks wins/deaths vs partyfinish ARMED
// (contrast, expected to differ by the sortie driver) and vs the
// w4convert corpus (era comparison, earlier code), and prints the
// demand-vs-outcome table + verdict.
//
// DEMAND-MET (primary, strict — prereg, grounded in the MONSTER-WAVES
// wave-4 readiness gates 3 armored P>=10 / 5 armed / 3 tricks /
// 1 veteran w3+): party (n>=2) AND every participant armed
// (armed-share==1.0) AND armored-count>=1 AND veteran present AND
// village tricksKnown>=3. Tricks are a village-level proxy by
// construction (no per-fighter tricks value exists in state).
// Secondary cuts: PARTY-ONLY (n>=2), GEARED-PARTY (party + full
// arming + armored>=1), FULL-GATE-IN-FIGHT (party + full arming +
// armored>=3 + veteran + tricks>=3). Each leg's pass rate is also
// reported, so the binding leg is visible without re-scoring.
// UNCLASSIFIED (prereg): a fight row is demand-classified iff it
// has >=1 named participant and every participant has non-null
// armed, armorP, veteranW3, and the row has non-null tricksKnown.
// Otherwise it lands in the UNCLASSIFIED bucket with its missing
// fields named — never dropped, never assumed.
// TB-world iff the start's originSeq != null AND originType == mid
// (null origin or argued-monster != tile-monster => TB-nonworld).
// A TB start with no matched end at run end is demand-classified
// with outcome 'unresolved'. Refused/threw/failed starts are not
// fights and are counted separately. Raid tolled-not-fought =
// demand raidTick change rows (wave 4) with no in-window fight
// for their seq (a LOWER BOUND on drafted: wall-0 raiders that
// never fight leave no trace).
//
// Modes: --detgate runs only the detgate leg (one seed, recorders
// vs recorders-off neutrality, via the sweep's --detgate mode).
// Default mode runs the detgate first, then the full analysis.
// Exit 0 only when every GO leg passes; any leg failure exits 1
// with the leg named.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS = process.env.CORPUS || path.join(REPO, 'evidence', '2026-10-28', 'perseed-wave4demand-a');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
const CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-28', 'perseed-partyfinish-a', 'control');
const ARMED_DIR = path.join(REPO, 'evidence', '2026-10-28', 'perseed-partyfinish-a', 'armed');
const W4CONVERT_DIR = path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4convert-a');

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function monsterWaves() {
  try {
    const defs = loadJson(path.join(REPO, 'src', 'data', 'monsters.json'));
    const m = {};
    const list = Array.isArray(defs) ? defs : (defs.monsters || []);
    for (const d of list) if (d && d.id) m[d.id] = d.wave | 0;
    return m;
  } catch (e) { return {}; }
}
const MWAVES = monsterWaves();

// ---- demand classification (prereg) ----
function classifyFight(row) {
  // row: { participants: [{vid, armed, armorP, veteranW3}], tricksKnown }
  const parts = Array.isArray(row.participants) ? row.participants : [];
  const missing = [];
  if (!parts.length) missing.push('participants-empty');
  for (const p of parts) {
    if (p.vid == null) missing.push('vid-null');
    if (p.armed == null) missing.push('armed-null:' + (p.vid || '?'));
    if (p.armorP == null) missing.push('armorP-null:' + (p.vid || '?'));
    if (p.veteranW3 == null) missing.push('veteranW3-null:' + (p.vid || '?'));
  }
  if (row.tricksKnown == null) missing.push('tricksKnown-null');
  if (missing.length) return { classified: false, missing: [...new Set(missing)] };
  const n = parts.length;
  const armedCount = parts.filter(p => p.armed).length;
  const armoredCount = parts.filter(p => (p.armorP | 0) >= 10).length;
  const veteran = parts.some(p => p.veteranW3);
  const tricksOk = (row.tricksKnown | 0) >= 3;
  const party = n >= 2;
  const fullArming = armedCount === n;
  return {
    classified: true, missing: [],
    n, armedCount, armedShare: armedCount / n, armoredCount, veteran, tricksKnown: row.tricksKnown | 0, tricksOk,
    party, fullArming,
    demandMet: party && fullArming && armoredCount >= 1 && veteran && tricksOk,
    partyOnly: party,
    gearedParty: party && fullArming && armoredCount >= 1,
    fullGateInFight: party && fullArming && armoredCount >= 3 && veteran && tricksOk,
  };
}

// Fighting-party diagnostic (NOT pre-registered, does not affect GO):
// the fighters who actually fought a field fight = leader +
// (allyFromStart ? allyVids[0]) + (calledHelp ? joinedAllyVid),
// intersected with the named participants (gear already read).
function fightingSubset(f) {
  const byVid = new Map();
  for (const p of (f.participants || [])) if (p.vid != null) byVid.set(String(p.vid), p);
  const vids = [];
  const push = (v) => { if (v != null && byVid.has(String(v)) && vids.indexOf(String(v)) < 0) vids.push(String(v)); };
  push(f.vid);
  if (f.allyFromStart && Array.isArray(f.allyVids) && f.allyVids.length) push(f.allyVids[0]);
  if (f.calledHelp && f.joinedAllyVid) push(f.joinedAllyVid);
  return { vids, parts: vids.map(v => byVid.get(v)) };
}

function runDetgate() {
  try {
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-wave4demand-sweep.js'), '--detgate'],
      { cwd: REPO, env: Object.assign({}, process.env, { SEED: '75101', DAYS: '180' }), encoding: 'utf8', timeout: 900000 });
    const line = out.split('\n').filter(l => l.indexOf('DETGATE') >= 0).join(' | ');
    return { pass: /-> PASS/.test(out), line: line || out.slice(-500) };
  } catch (e) {
    const so = (e.stdout || '') + (e.stderr || '');
    const line = so.split('\n').filter(l => l.indexOf('DETGATE') >= 0).join(' | ');
    return { pass: false, line: line || String((e && e.message) || e).slice(0, 300) };
  }
}

function diagClean(section) {
  if (!section || !section.diag) return false;
  if (section.diag.errs !== 0) return false;
  const ov = section.diag.overflow || {};
  return Object.values(ov).every(v => (v | 0) === 0);
}

function main() {
  const args = process.argv.slice(2);
  const onlyDetgate = args.includes('--detgate');
  const legs = [];
  const fail = (name, detail) => legs.push({ name, pass: false, detail });
  const pass = (name, detail) => legs.push({ name, pass: true, detail });

  // ---- detgate leg (runs the sweep's --detgate: baseline vs recorders-OFF) ----
  const dg = runDetgate();
  console.log('DETGATE: ' + dg.line);
  if (dg.pass) pass('detgate', 'seed 75101 baseline == recorders-OFF');
  else fail('detgate', dg.line);
  if (onlyDetgate) {
    console.log(dg.pass ? 'DETGATE PASS' : 'DETGATE FAIL');
    process.exit(dg.pass ? 0 : 1);
  }

  // ---- load corpus rows ----
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(CORPUS, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { fail('complete', `missing row ${p}`); continue; }
    rows.push(loadJson(p));
  }
  if (rows.length !== 8) {
    console.log('ROWS: ' + rows.length + '/8');
    console.log('VERDICT: NO-GO (incomplete corpus)');
    process.exit(1);
  }

  // ---- L1: completeness + recorder cleanliness ----
  const recSections = ['raftdraft', 'spawnsrc', 'oldcore', 'w5births', 'defwound', 'nonworldkill', 'tbdmg', 'w4damage', 'wave4demand'];
  const bad = [];
  for (const r of rows) {
    if (!(r.days > 0)) bad.push(`${r.seed}: days<=0`);
    for (const s of recSections) {
      const sec = r[s];
      if (!sec) { bad.push(`${r.seed}: missing ${s}`); continue; }
      if (s === 'raftdraft' || s === 'spawnsrc' || s === 'oldcore' || s === 'w5births' || s === 'defwound' || s === 'nonworldkill' || s === 'tbdmg' || s === 'w4damage' || s === 'wave4demand') {
        if (!diagClean(sec)) bad.push(`${r.seed}: ${s} errs=${sec.diag ? sec.diag.errs : '?'} overflow=${JSON.stringify(sec.diag ? sec.diag.overflow : null)}`);
      }
    }
  }
  if (bad.length) fail('complete', bad.join('; '));
  else pass('complete', '8/8 rows, days>0, all 9 recorders errs 0, no overflow');

  // ---- L2: substrate activation ----
  const courtCombined = rows.reduce((t, r) => t + ((r.courtship && r.courtship.combined) | 0), 0);
  const courtActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  if (courtCombined > 0 && courtActive >= 6) pass('substrate', `courtship combined=${courtCombined}, active ${courtActive}/8`);
  else fail('substrate', `courtship combined=${courtCombined}, active ${courtActive}/8`);

  // ---- build fight tables ----
  const fieldRows = []; // wave-4 fieldFight rows (channel field/raid/other)
  const tbStarts = []; // wave-4 startCombat rows (non-refused/non-threw/non-failed)
  const tbEndsMatched = []; // joined ends
  const tbEndsUnmatched = [];
  const tbStartsOther = []; // refused/threw/failed
  const unclassified = [];
  const tolledEvents = [];
  for (const r of rows) {
    const dm = r.wave4demand || {};
    for (const f of (dm.fights || [])) {
      if ((f.wave | 0) !== 4) continue;
      fieldRows.push(Object.assign({ seed: r.seed }, f));
    }
    for (const s of (dm.starts || [])) {
      if ((s.wave | 0) !== 4) continue;
      if (s.refused || s.threw || s.failed) { tbStartsOther.push(Object.assign({ seed: r.seed }, s)); continue; }
      tbStarts.push(Object.assign({ seed: r.seed }, s));
    }
    const byStartIdx = new Map();
    for (const s of (dm.starts || [])) if (s.startIdx != null) byStartIdx.set(s.startIdx, s);
    for (const e of (dm.tbEnds || [])) {
      const st = (e.startIdx != null) ? byStartIdx.get(e.startIdx) : null;
      if (e.matched && st && (st.wave | 0) === 4) tbEndsMatched.push({ seed: r.seed, start: Object.assign({ seed: r.seed }, st), end: e });
      else if (!e.matched) {
        const mid = (e.monsterIds && e.monsterIds[0]) || e.worldOriginType || null;
        if (mid && (MWAVES[mid] | 0) === 4) tbEndsUnmatched.push(Object.assign({ seed: r.seed }, e));
      }
    }
    for (const t of (dm.raidTicks || [])) {
      const inWindow = new Map();
      for (const fw of (t.ffInWindow || [])) inWindow.set(fw.seq, true);
      for (const c of (t.changes || [])) {
        if ((c.wave | 0) !== 4) continue;
        if (!inWindow.has(c.seq)) tolledEvents.push(Object.assign({ seed: r.seed, day: t.day }, c));
      }
    }
  }
  // TB joins: matched ends by startIdx; unresolved = starts with no matched end.
  const matchedIdx = new Set(tbEndsMatched.map(j => j.start.startIdx + '@' + j.seed));
  const tbUnresolved = tbStarts.filter(s => !matchedIdx.has(s.startIdx + '@' + s.seed));
  // Classify TB fights: world vs nonworld.
  const tbWorld = [], tbNonworld = [];
  for (const j of tbEndsMatched) {
    const st = j.start;
    const isWorld = st.originSeq != null && st.originType === st.mid;
    (isWorld ? tbWorld : tbNonworld).push(j);
  }
  for (const s of tbUnresolved) {
    const isWorld = s.originSeq != null && s.originType === s.mid;
    (isWorld ? tbWorld : tbNonworld).push({ seed: s.seed, start: s, end: null, unresolved: true });
  }
  // Classify field rows by channel; demand-classify each.
  const byChannel = { field: [], raid: [], other: [] };
  for (const f of fieldRows) {
    const ch = (f.channel === 'raid') ? 'raid' : (f.channel === 'other' ? 'other' : 'field');
    const c = classifyFight(f);
    const rec = Object.assign({ cls: c }, f);
    byChannel[ch].push(rec);
    if (!c.classified) unclassified.push({ seed: f.seed, day: f.day, channel: ch, seq: f.seq, mid: f.mid, caller: f.caller, missing: c.missing });
  }
  const tbClassified = [];
  for (const j of tbWorld) {
    const c = classifyFight(j.start);
    // Normalize: participants/tricksKnown/readiness live on the start
    // sub-object; lift them so the tables below read every channel
    // the same way. (j has no such top-level keys, so they survive.)
    const rec = Object.assign({ cls: c, outcome: j.end ? j.end.result : 'unresolved', seed: j.seed, participants: j.start.participants, tricksKnown: j.start.tricksKnown, readiness: j.start.readiness }, j);
    tbClassified.push(rec);
    if (!c.classified) unclassified.push({ seed: j.seed, day: j.start.day, channel: 'TB', seq: j.start.originSeq, mid: j.start.mid, caller: 'startCombat', missing: c.missing });
  }
  const tbNonworldRows = [];
  for (const j of tbNonworld) {
    const c = classifyFight(j.start);
    tbNonworldRows.push(Object.assign({ cls: c, outcome: j.end ? j.end.result : 'unresolved', seed: j.seed, participants: j.start.participants, tricksKnown: j.start.tricksKnown, readiness: j.start.readiness }, j));
    if (!c.classified) unclassified.push({ seed: j.seed, day: j.start.day, channel: 'TB-nonworld', seq: j.start.originSeq, mid: j.start.mid, caller: 'startCombat', missing: c.missing });
  }

  // ---- L5: reconciliation ----
  const fieldTotal = fieldRows.length;
  const fieldAccounted = byChannel.field.length + byChannel.raid.length + byChannel.other.length;
  const tbAccounted = tbWorld.length + tbNonworld.length;
  const tbStartsTotal = tbStarts.length;
  const reconOk = fieldTotal === fieldAccounted && tbStartsTotal === tbAccounted;
  if (reconOk) pass('reconciliation', `field ${fieldTotal}=${fieldAccounted} (field ${byChannel.field.length} + raid ${byChannel.raid.length} + other ${byChannel.other.length}); TB starts ${tbStartsTotal}=${tbAccounted} (world ${tbWorld.length} + nonworld ${tbNonworld.length}); unmatched TB ends ${tbEndsUnmatched.length}; refused/threw/failed starts ${tbStartsOther.length}; unresolved TB ${tbUnresolved.length}`);
  else fail('reconciliation', `field ${fieldTotal} vs ${fieldAccounted}; TB starts ${tbStartsTotal} vs ${tbAccounted}`);

  // ---- L8: unclassified enumeration ----
  const unclassNamed = unclassified.every(u => u.missing && u.missing.length);
  if (unclassNamed) pass('unclassified-accounted', `${unclassified.length} unclassified rows, all with missing fields named`);
  else fail('unclassified-accounted', 'unclassified row without named missing field');

  // ---- L7: cornered dormancy ----
  const cornered = fieldRows.filter(f => f.cornered);
  if (!cornered.length) pass('cornered-dormancy', '0 cornered wave-4 fights (mechanism dormant, as expected)');
  else fail('cornered-dormancy', `${cornered.length} cornered wave-4 fights — diagnose before judging`);

  // ---- demand tables ----
  function tableFor(list) {
    const cls = list.filter(x => x.cls.classified);
    const n = cls.length;
    if (!n) return null;
    const rate = (fn) => cls.filter(fn).length / n;
    return {
      n: n,
      partyRate: rate(x => x.cls.party),
      fullArmingRate: rate(x => x.cls.fullArming),
      armored1Rate: rate(x => x.cls.armoredCount >= 1),
      veteranRate: rate(x => x.cls.veteran),
      tricks3Rate: rate(x => x.cls.tricksOk),
      demandMet: rate(x => x.cls.demandMet),
      partyOnly: rate(x => x.cls.partyOnly),
      gearedParty: rate(x => x.cls.gearedParty),
      fullGateInFight: rate(x => x.cls.fullGateInFight),
    };
  }
  const tables = {
    field: tableFor(byChannel.field),
    raid: tableFor(byChannel.raid),
    TB: tableFor(tbClassified),
  };
  const allWorld = byChannel.field.concat(byChannel.raid).concat(tbClassified);
  tables.ALL = tableFor(allWorld);
  const worldFights = allWorld.filter(x => x.cls.classified).length;

  // ---- L6: demand table published (non-vacuous) ----
  if (worldFights > 0 && tables.ALL) pass('demand-table', `${worldFights} classified world wave-4 fights; per-channel meet shares + outcome table computed`);
  else fail('demand-table', `world classified fights=${worldFights} — census vacuous, investigate`);

  // ---- outcome tables (met vs not-met) ----
  function outcomeTable(list) {
    const out = { met: {}, notmet: {}, unclassified: {} };
    for (const x of list) {
      const oc = (x.outcome == null) ? 'null' : String(x.outcome);
      if (!x.cls.classified) out.unclassified[oc] = (out.unclassified[oc] || 0) + 1;
      else if (x.cls.demandMet) out.met[oc] = (out.met[oc] || 0) + 1;
      else out.notmet[oc] = (out.notmet[oc] || 0) + 1;
    }
    return out;
  }
  const outcomes = {
    field: outcomeTable(byChannel.field),
    raid: outcomeTable(byChannel.raid),
    TB: outcomeTable(tbClassified),
  };
  // Field/raid outcome uses the fight row's own outcome field; TB uses tbEnd result.
  for (const ch of ['field', 'raid']) {
    for (const x of byChannel[ch]) x.outcome = x.outcome;
  }

  // ---- participant distributions ----
  const partyHist = {};
  let partTotal = 0, partArmed = 0, partArmored = 0, partVeteranFights = 0;
  for (const x of allWorld) {
    if (!x.cls.classified) continue;
    partyHist[x.cls.n] = (partyHist[x.cls.n] || 0) + 1;
    for (const p of (x.participants || [])) { partTotal++; if (p.armed) partArmed++; if ((p.armorP | 0) >= 10) partArmored++; }
  }
  // Village readiness at fight starts (classified world fights).
  const rdMean = (key) => {
    const vs = allWorld.filter(x => x.cls.classified && x.readiness && x.readiness[key] != null).map(x => x.readiness[key] | 0);
    return vs.length ? (vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2) + ` (n=${vs.length})` : 'n/a';
  };
  // Engine-vs-named party mismatch (field rows).
  let engineMismatch = 0, engineBigger = 0;
  for (const f of fieldRows) {
    if (f.engineAllies == null) continue;
    const named = (f.participants || []).length;
    if ((f.engineAllies | 0) + 1 !== named) { engineMismatch++; if ((f.engineAllies | 0) + 1 > named) engineBigger++; }
  }
  // Fighting-party diagnostic (field rows, classified, named party).
  let fightDiag = null;
  {
    const ds = byChannel.field.concat(byChannel.raid).filter(x => x.cls.classified);
    let met = 0, n = 0, soloFought = 0;
    for (const f of ds) {
      const fs = fightingSubset(f);
      if (!fs.parts.length) continue;
      const sub = classifyFight({ participants: fs.parts, tricksKnown: f.tricksKnown });
      if (!sub.classified) continue;
      n++;
      if (sub.demandMet) met++;
      if (fs.parts.length === 1) soloFought++;
    }
    fightDiag = { n, metRate: n ? met / n : null, soloFought };
  }

  // ---- wall numbers ----
  const wall = {
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    won: rows.reduce((t, r) => t + r.won, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: (() => { const s = rows.map(r => r.days).sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; })(),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    seats: {},
  };
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; wall.seats[st] = (wall.seats[st] || 0) + 1; }
  const deathCauses = {};
  for (const r of rows) for (const k of Object.keys(r.deaths || {})) deathCauses[k] = (deathCauses[k] || 0) + r.deaths[k];

  // ---- parity vs partyfinish CONTROL (binding) ----
  const parityDiffs = [];
  const fields = ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal'];
  for (const seed of SEEDS) {
    const cp = path.join(CONTROL_DIR, `s${seed}-armed.json`);
    if (!fs.existsSync(cp)) { parityDiffs.push(`${seed}: control row missing`); continue; }
    const c = loadJson(cp);
    const mine = rows.find(r => r.seed === seed);
    for (const f of fields) if ((mine[f] | 0) !== (c[f] | 0)) parityDiffs.push(`${seed}.${f} mine=${mine[f]} control=${c[f]}`);
    const dwMine = (mine.defwound.resolveFights || []).filter(x => (x.wave | 0) === 4).reduce((m, x) => { m[x.context] = (m[x.context] || 0) + 1; return m; }, {});
    const dwCtrl = (c.defwound.resolveFights || []).filter(x => (x.wave | 0) === 4).reduce((m, x) => { m[x.context] = (m[x.context] || 0) + 1; return m; }, {});
    if (JSON.stringify(dwMine) !== JSON.stringify(dwCtrl)) parityDiffs.push(`${seed}.defwoundW4 mine=${JSON.stringify(dwMine)} control=${JSON.stringify(dwCtrl)}`);
    const nkMine = (mine.nonworldkill.starts || []).filter(x => (x.wave | 0) === 4).length;
    const nkCtrl = (c.nonworldkill.starts || []).filter(x => (x.wave | 0) === 4).length;
    if (nkMine !== nkCtrl) parityDiffs.push(`${seed}.nwkW4 mine=${nkMine} control=${nkCtrl}`);
    const spMine = (mine.spawnsrc.spawns || []).filter(x => (x.wave | 0) === 4).map(x => x.seq).sort((a, b) => a - b);
    const spCtrl = (c.spawnsrc.spawns || []).filter(x => (x.wave | 0) === 4).map(x => x.seq).sort((a, b) => a - b);
    if (JSON.stringify(spMine) !== JSON.stringify(spCtrl)) parityDiffs.push(`${seed}.spawnSeqs mine=${JSON.stringify(spMine)} control=${JSON.stringify(spCtrl)}`);
  }
  if (!parityDiffs.length) pass('parity-control', 'EXACT vs partyfinish CONTROL on all 8 seeds x 9 fields + w4 defwound/nwk/spawn checks');
  else fail('parity-control', parityDiffs.join('; '));

  // ---- cross-checks (reported, not GO legs) ----
  const crossArmed = [];
  for (const seed of SEEDS) {
    const ap = path.join(ARMED_DIR, `s${seed}-armed.json`);
    if (!fs.existsSync(ap)) continue;
    const a = loadJson(ap);
    const mine = rows.find(r => r.seed === seed);
    crossArmed.push({ seed, mineDays: mine.days, armedDays: a.days, mineWon: mine.won, armedWon: a.won, mineDeaths: mine.deathTotal, armedDeaths: a.deathTotal });
  }
  let era = null;
  try {
    const an = loadJson(path.join(W4CONVERT_DIR, 'analysis.json'));
    era = { note: 'w4convert analysis.json keys: ' + Object.keys(an).join(',') };
  } catch (e) { era = { note: 'w4convert analysis.json unreadable: ' + String((e && e.message) || e).slice(0, 120) }; }
  const w4cRows = [];
  for (const seed of SEEDS) {
    const p = path.join(W4CONVERT_DIR, `s${seed}-armed.json`);
    if (fs.existsSync(p)) { const c = loadJson(p); w4cRows.push({ seed, days: c.days, won: c.won, deaths: c.deathTotal, wave: c.waveReach }); }
  }

  // ---- per-seed fight counts ----
  const perSeed = {};
  for (const seed of SEEDS) perSeed[seed] = { field: 0, raid: 0, TB: 0, other: 0, TBnonworld: 0, unclassified: 0 };
  for (const ch of ['field', 'raid', 'other']) for (const x of byChannel[ch]) perSeed[x.seed][ch]++;
  for (const x of tbClassified) perSeed[x.seed].TB++;
  for (const x of tbNonworldRows) perSeed[x.seed].TBnonworld++;
  for (const u of unclassified) perSeed[u.seed].unclassified++;

  const analysis = {
    verdict: null, legs, wall, deathCauses, perSeed,
    demandTables: tables,
    outcomes,
    unclassified,
    tolled: { events: tolledEvents.length, distinctSeqs: [...new Set(tolledEvents.map(e => e.seq))].length, eventsBySeed: tolledEvents.reduce((m, e) => { m[e.seed] = (m[e.seed] || 0) + 1; return m; }, {}) },
    tbUnmatchedEnds: tbEndsUnmatched.length,
    tbStartsOther: tbStartsOther.map(s => ({ seed: s.seed, day: s.day, mid: s.mid, refused: !!s.refused, threw: !!s.threw, failed: !!s.failed })),
    tbUnresolved: tbUnresolved.map(s => ({ seed: s.seed, day: s.day, mid: s.mid, originSeq: s.originSeq })),
    tbNonworld: tbNonworldRows.map(x => ({ seed: x.seed, day: x.start.day, mid: x.start.mid, originSeq: x.start.originSeq, originType: x.start.originType, outcome: x.outcome, classified: x.cls.classified })),
    otherChannel: byChannel.other.map(x => ({ seed: x.seed, day: x.day, mid: x.mid, caller: x.caller, outcome: x.outcome, classified: x.cls.classified })),
    participants: { total: partTotal, armed: partArmed, armoredP10: partArmored, partyHist },
    villageReadinessAtFights: { armored: rdMean('armored'), armed: rdMean('armed'), tricks: rdMean('tricks'), veterans: rdMean('veterans') },
    engineMismatch: { total: engineMismatch, engineBigger: engineBigger },
    fightingPartyDiagnostic: fightDiag,
    parityDiffs,
    crossArmed,
    eraW4convertRows: w4cRows,
    eraNote: era,
    courtship: { combined: courtCombined, active: courtActive },
    generated: new Date().toISOString(),
  };
  const allPass = legs.every(l => l.pass);
  analysis.verdict = allPass ? 'DIAG-GO' : 'NO-GO';
  const outPath = path.join(CORPUS, 'analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1) + '\n');

  // ---- print ----
  console.log('\n=== sim-wave4demand-a demand census ===');
  console.log(`wall: nationalEver ${wall.nationalEver}/8 nationalFinal ${wall.nationalFinal}/8 table ${wall.table}/8 entered ${wall.entered}/8 won ${wall.won}/8 wave4 ${wall.wave4}/8 wave5 ${wall.wave5}/8 medianDays ${wall.medianDays} deaths ${wall.deathTotal} seats ${JSON.stringify(wall.seats)}`);
  console.log('per-seed fights (field/raid/TB/other/TBnonworld/unclassified):');
  for (const seed of SEEDS) { const p = perSeed[seed]; console.log(`  ${seed}: field=${p.field} raid=${p.raid} TB=${p.TB} other=${p.other} TBnonworld=${p.TBnonworld} unclassified=${p.unclassified}`); }
  const fmt = (t) => t ? `n=${t.n} party=${t.partyRate.toFixed(2)} fullArm=${t.fullArmingRate.toFixed(2)} arm1=${t.armored1Rate.toFixed(2)} vet=${t.veteranRate.toFixed(2)} tricks3=${t.tricks3Rate.toFixed(2)} DEMAND-MET=${t.demandMet.toFixed(2)} partyOnly=${t.partyOnly.toFixed(2)} gearedParty=${t.gearedParty.toFixed(2)} fullGate=${t.fullGateInFight.toFixed(2)}` : 'n=0';
  console.log('demand-meet share per channel (classified fights only):');
  console.log('  field: ' + fmt(tables.field));
  console.log('  raid:  ' + fmt(tables.raid));
  console.log('  TB:    ' + fmt(tables.TB));
  console.log('  ALL:   ' + fmt(tables.ALL));
  console.log('demand-met vs not-met outcome table:');
  for (const ch of ['field', 'raid', 'TB']) {
    const o = outcomes[ch];
    console.log(`  ${ch}: met=${JSON.stringify(o.met)} notmet=${JSON.stringify(o.notmet)} unclassified=${JSON.stringify(o.unclassified)}`);
  }
  console.log(`participants: total=${partTotal} armed=${partArmed} armoredP10=${partArmored} partyHist=${JSON.stringify(partyHist)}`);
  console.log(`village readiness at wave-4 fights (mean, gate demand 3/5/3/1): armored=${analysis.villageReadinessAtFights.armored} armed=${analysis.villageReadinessAtFights.armed} tricks=${analysis.villageReadinessAtFights.tricks} veterans=${analysis.villageReadinessAtFights.veterans}`);
  console.log(`raid tolled-not-fought: events=${tolledEvents.length} distinctSeqs=${analysis.tolled.distinctSeqs} bySeed=${JSON.stringify(analysis.tolled.eventsBySeed)}`);
  console.log(`engine-vs-named party mismatch: total=${engineMismatch} engineBigger=${engineBigger}`);
  console.log(`fighting-party diagnostic (NOT pre-registered, does not affect GO): n=${fightDiag.n} metRate=${fightDiag.metRate == null ? 'n/a' : fightDiag.metRate.toFixed(2)} soloFought=${fightDiag.soloFought}`);
  console.log(`unclassified: ${unclassified.length}` + (unclassified.length ? ' ' + JSON.stringify(unclassified.slice(0, 20)) : ''));
  console.log('legs:');
  for (const l of legs) console.log(`  ${l.pass ? 'PASS' : 'FAIL'} ${l.name}: ${l.detail}`);
  console.log(`parity-control diffs: ${parityDiffs.length ? parityDiffs.join('; ') : 'NONE (exact)'}`);
  console.log('cross-check vs partyfinish ARMED (driver contrast, expected to differ):');
  for (const c of crossArmed) console.log(`  ${c.seed}: mine days=${c.mineDays} won=${c.mineWon} deaths=${c.mineDeaths} | armed days=${c.armedDays} won=${c.armedWon} deaths=${c.armedDeaths}`);
  console.log(`VERDICT: ${analysis.verdict} -> ${outPath}`);
  process.exit(allPass ? 0 : 1);
}

if (require.main === module) main();
module.exports = { classifyFight };
