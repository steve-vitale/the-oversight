#!/usr/bin/env node
// analyze-huntdefense-b3.js — READ-ONLY defense-guardrail instrument for
// sim-huntstaff-b3 (the defense-aware revival of the hunt-staffing layer).
//
// Pre-registered guardrail (evidence/2026-10-18/sim-huntstaff-b3.md, §14):
//   GO bar = attributed share of any armed−control villager-death delta
//   < 50% AND no combat-capable villager death on a hunt-exposed day
//   (hunt day d or d+1) in excess of control.
// Villager deaths = tele kind 'person'/'villager' ONLY (the b2 pollution —
// villager-KILLED MONSTERS with cause 'villager combat' — is excluded),
// deduped on (who,day,cause) BEFORE any count (finding #517).
//
// Primary: attributed share = Σ_pairs (armed combat-ish non-assigned-hunter
// villager deaths on hunt-exposed days − control on matched days)
// / deduped armed−control villager-death delta (0 if delta ≤ 0).
// Secondary: combat-capable window excess = armed window combat-capable
// villager deaths − control matched-window combat-capable ≤ 0.
// Verdicts (judged in order): 1. DEFENSE-HARM 2. NOISE 3. UNRESOLVED-BUT-SCOPED.
//
// Revival-spec item 4: lean-day wild-encounter monster-kill rate
// with/without assignment (the item-4 question reframed per the kind
// discovery — 'villager combat' cause records are villager monster-kills).
// Revival-spec item 1: encounter lens on hunt-exposed vs matched days.
//
// Noise reference: independent b2 corpus (different seeds, same layer spec)
// recomputed PERSON-only (fallback name!==who on the kind-less schema /2).
//
// Deterministic: sorted keys, no Math.random, stable-stringified output.
//
// Usage: node scripts/analyze-huntdefense-b3.js <corpus-dir> [out-json]
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2];
if (!CORPUS) { console.error('usage: analyze-huntdefense-b3.js <corpus-dir> [out-json]'); process.exit(2); }
const NOISE_REF = path.resolve(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntstaff-b2');

const HUNTER_WORDS = new Set(['hunting guide', 'fishing guide', 'trail crew', 'rancher',
  'forager', 'bush pilot', 'exterminator', 'soldier']);

function isCombatCause(c) {
  if (c === 'combat' || c === 'monster' || c === 'ambush') return true;
  if (/^The\s/.test(c)) return true;
  if (/^(Highbeam Deer|Big-Eyes|The Living Wire|The Focus Group|The Paparazzo|The Moderator)$/.test(c)) return true;
  return false;
}
function isCombatCapable(d) {
  if (d.hunterOcc) return true;
  const o = String(d.occ || '').toLowerCase();
  return HUNTER_WORDS.has(o);
}
function isVillager(d) {
  if (d.player) return false;
  if (d.kind != null) return d.kind === 'person' || d.kind === 'villager';
  return d.name !== d.who;   // legacy kind-less schema: person records carry a name
}
function stable(v) {
  if (v === null || typeof v !== 'object') {
    if (typeof v === 'number' && !Number.isFinite(v)) return 'null';
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}
function loadPairs(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const byKey = {};
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const key = d.seed + '|' + d.policyId;
    byKey[key] = byKey[key] || { seed: d.seed, policy: d.policyId };
    byKey[key][d.arm] = d;
  }
  const pairs = Object.values(byKey).filter(p => p.armed && p.control);
  pairs.sort((a, b) => a.seed - b.seed || (a.policy < b.policy ? -1 : 1));
  return pairs;
}
function dedupKey(d) { return d.who + '|' + d.day + '|' + (d.cause || '?'); }
function villagerDeaths(d) {   // VILLAGER deaths only, DEDUPED (finding #517)
  const seen = new Set();
  const out = [];
  for (const x of (d.deaths || [])) {
    if (!isVillager(x)) continue;
    const k = dedupKey(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}
function huntAssignDays(run) {
  const s = new Set();
  for (const e of (run.huntDutyLog || [])) s.add(e.day);
  return [...s].sort((a, b) => a - b);
}
function exposedDays(assignDays, lag) {
  const s = new Set();
  for (const d of assignDays) for (let k = 0; k <= lag; k++) s.add(d + k);
  return s;
}

function main() {
  const pairs = loadPairs(CORPUS);
  if (!pairs.length) throw new Error('no pairs in corpus ' + CORPUS);
  const noisePairs = fs.existsSync(NOISE_REF) ? loadPairs(NOISE_REF) : [];

  let armedV = 0, controlV = 0, armedRawV = 0, controlRawV = 0;
  let armedMonsterKills = 0, controlMonsterKills = 0;
  const causeDelta = {}, occDelta = {};
  let armedHunterOcc = 0, controlHunterOcc = 0;
  let assignedHunterDeathsSeen = 0, huntAttributable = 0;
  let controlAssignLogEntries = 0;
  const pairRows = [];

  let attrSum = 0;                 // primary attribution numerator
  let attrCapableExcess = 0;       // secondary: combat-capable window deaths excess
  let windowArmedCombat = 0, windowControlCombat = 0;
  let windowArmedCapable = 0, windowControlCapable = 0;
  let exposedArmedDays = 0;
  const senseCases = [];

  // item 1 lens: encounters on hunt-exposed days vs matched control days
  let expArmedEnc = 0, expCtrlEnc = 0, expArmedVKill = 0, expCtrlVKill = 0;
  let expArmedVDie = 0, expCtrlVDie = 0, expArmedAllied = 0, expCtrlAllied = 0;
  // item 4: lean-day wild-encounter monster-kill rate with/without assignment
  // buckets: armed lean+assigned, armed lean+unassigned, control lean
  const lean = { armedAssigned: { days: 0, enc: 0, vkill: 0, vdie: 0 }, armedUnassigned: { days: 0, enc: 0, vkill: 0, vdie: 0 }, control: { days: 0, enc: 0, vkill: 0, vdie: 0 } };

  for (const p of pairs) {
    const A = p.armed, C = p.control;
    const aDeaths = villagerDeaths(A), cDeaths = villagerDeaths(C);
    armedV += aDeaths.length; controlV += cDeaths.length;
    armedRawV += (A.deaths || []).filter(isVillager).length;
    controlRawV += (C.deaths || []).filter(isVillager).length;
    for (const d of aDeaths) {
      const k = d.cause || '?';
      causeDelta[k] = causeDelta[k] || { armed: 0, control: 0 }; causeDelta[k].armed++;
      const o = (d.occ || '(none)') || '(none)';
      occDelta[o] = occDelta[o] || { armed: 0, control: 0 }; occDelta[o].armed++;
      if (d.hunterOcc) armedHunterOcc++;
    }
    for (const d of cDeaths) {
      const k = d.cause || '?';
      causeDelta[k] = causeDelta[k] || { armed: 0, control: 0 }; causeDelta[k].control++;
      const o = (d.occ || '(none)') || '(none)';
      occDelta[o] = occDelta[o] || { armed: 0, control: 0 }; occDelta[o].control++;
      if (d.hunterOcc) controlHunterOcc++;
    }
    armedMonsterKills += (A.deaths || []).filter(x => x.kind === 'monster' || x.kind === 'animal').length;
    controlMonsterKills += (C.deaths || []).filter(x => x.kind === 'monster' || x.kind === 'animal').length;
    for (const r of (A.assignedHunterDeaths || [])) {
      assignedHunterDeathsSeen++;
      if (r.huntAttributable) huntAttributable++;
    }
    controlAssignLogEntries += (C.huntDutyLog || []).length;

    const assignedVids = new Set((A.huntDutyLog || []).map(e => e.vid));
    const assignDays = huntAssignDays(A);
    const win = exposedDays(assignDays, 1);   // d and d+1 — primary window
    const win0 = exposedDays(assignDays, 0);  // sensitivity: assignment day only
    exposedArmedDays += win.size;

    const wA = aDeaths.filter(d => win.has(d.day) && isCombatCause(d.cause) && !assignedVids.has(d.who));
    const wC = cDeaths.filter(d => win.has(d.day) && isCombatCause(d.cause));
    windowArmedCombat += wA.length; windowControlCombat += wC.length;
    const pairAttr = wA.length - wC.length;
    attrSum += pairAttr;
    const wAC = wA.filter(isCombatCapable).length, wCC = wC.filter(isCombatCapable).length;
    windowArmedCapable += wAC; windowControlCapable += wCC;
    attrCapableExcess += (wAC - wCC);
    const wA0 = aDeaths.filter(d => win0.has(d.day) && isCombatCause(d.cause) && !assignedVids.has(d.who));
    const wC0 = cDeaths.filter(d => win0.has(d.day) && isCombatCause(d.cause));

    for (const d of wA) {
      if (pairAttr > 0 && senseCases.length < 8) {
        senseCases.push({ seed: p.seed, policy: p.policy, pairDelta: aDeaths.length - cDeaths.length,
          day: d.day, who: d.who, name: d.name, occ: d.occ, hunterOcc: d.hunterOcc,
          cause: d.cause, combatCapable: isCombatCapable(d), assignedHunter: d.assignedHunter });
      }
    }

    // item 1: encounters on exposed days vs matched control days.
    // via 'wild' = encounter fact; via 'wild-fight' = the fieldFight
    // resolution (outcome, allies) of that encounter.
    const encA = (A.encounters || []), encC = (C.encounters || []);
    const eA = encA.filter(e => e.via === 'wild' && win.has(e.day));
    const eC = encC.filter(e => e.via === 'wild' && win.has(e.day));
    const fA = encA.filter(e => e.via === 'wild-fight' && win.has(e.day));
    const fC = encC.filter(e => e.via === 'wild-fight' && win.has(e.day));
    expArmedEnc += eA.length; expCtrlEnc += eC.length;
    expArmedVKill += fA.filter(e => e.outcome === 'vKill').length;
    expCtrlVKill += fC.filter(e => e.outcome === 'vKill').length;
    expArmedVDie += fA.filter(e => e.outcome === 'vDie').length;
    expCtrlVDie += fC.filter(e => e.outcome === 'vDie').length;
    expArmedAllied += fA.filter(e => (e.allies || 0) > 0).length;
    expCtrlAllied += fC.filter(e => (e.allies || 0) > 0).length;

    // item 4: lean-day buckets
    const assignSet = new Set(assignDays);
    const bucketize = (rows, key) => {
      for (const r of (rows || [])) {
        if (!r.lean) continue;
        const b = lean[key];
        b.days++;
      }
    };
    bucketize((A.leanDayRows || []).filter(r => assignSet.has(r.day)), 'armedAssigned');
    bucketize((A.leanDayRows || []).filter(r => !assignSet.has(r.day)), 'armedUnassigned');
    bucketize(C.leanDayRows || [], 'control');
    // encounters on lean days, split by bucket (via 'wild-fight' rows carry outcomes)
    const leanAssignDays = new Set((A.leanDayRows || []).filter(r => r.lean && assignSet.has(r.day)).map(r => r.day));
    const leanNoDays = new Set((A.leanDayRows || []).filter(r => r.lean && !assignSet.has(r.day)).map(r => r.day));
    const leanCtrlDays = new Set((C.leanDayRows || []).filter(r => r.lean).map(r => r.day));
    const fightsA = encA.filter(e => e.via === 'wild-fight');
    const fightsC = encC.filter(e => e.via === 'wild-fight');
    for (const e of fightsA) {
      if (leanAssignDays.has(e.day)) { lean.armedAssigned.enc++; if (e.outcome === 'vKill') lean.armedAssigned.vkill++; if (e.outcome === 'vDie') lean.armedAssigned.vdie++; }
      else if (leanNoDays.has(e.day)) { lean.armedUnassigned.enc++; if (e.outcome === 'vKill') lean.armedUnassigned.vkill++; if (e.outcome === 'vDie') lean.armedUnassigned.vdie++; }
    }
    for (const e of fightsC) {
      if (leanCtrlDays.has(e.day)) { lean.control.enc++; if (e.outcome === 'vKill') lean.control.vkill++; if (e.outcome === 'vDie') lean.control.vdie++; }
    }

    pairRows.push({
      seed: p.seed, policy: p.policy,
      armedVillDeaths: aDeaths.length, controlVillDeaths: cDeaths.length,
      delta: aDeaths.length - cDeaths.length,
      assignments: (A.huntDutyLog || []).length,
      assignDays, windowDeathsArmed: wA.length, windowDeathsControl: wC.length,
      windowDelta: pairAttr,
      windowCapableArmed: wAC, windowCapableControl: wCC, windowCapableDelta: wAC - wCC,
      window0Delta: wA0.length - wC0.length,
    });
  }

  const totalDelta = armedV - controlV;
  const attributedShare = totalDelta > 0 ? attrSum / totalDelta : 0;
  const GO_BAR = 0.50;
  const defenseGoShare = attributedShare < GO_BAR;
  const defenseGoCapable = attrCapableExcess <= 0;

  // ---- person-only noise reference from the independent b2 corpus ----
  const noiseDeltas = noisePairs.map(p => {
    const a = villagerDeaths(p.armed).length, c = villagerDeaths(p.control).length;
    return a - c;
  }).sort((a, b) => a - b);
  let noise = null;
  if (noiseDeltas.length) {
    const nMean = noiseDeltas.reduce((s, x) => s + x, 0) / noiseDeltas.length;
    const nSd = Math.sqrt(noiseDeltas.reduce((s, x) => s + (x - nMean) ** 2, 0) / noiseDeltas.length);
    noise = { source: 'b2 corpus (independent seeds 7811-7818, same layer spec), PERSON-only (name!==who fallback), deduped',
      n: noiseDeltas.length, deltas: noiseDeltas, mean: +nMean.toFixed(4), sd: +nSd.toFixed(4) };
  }

  const causeRows = Object.keys(causeDelta).sort().map(k => ({
    cause: k, armed: causeDelta[k].armed, control: causeDelta[k].control,
    delta: causeDelta[k].armed - causeDelta[k].control,
  })).sort((a, b) => b.delta - a.delta);
  const occRows = Object.keys(occDelta).sort().map(k => ({
    occ: k, armed: occDelta[k].armed, control: occDelta[k].control,
    delta: occDelta[k].armed - occDelta[k].control,
  })).sort((a, b) => b.delta - a.delta);

  const b2Deltas = pairRows.map(r => r.delta);
  const b3Mean = totalDelta / pairRows.length;

  let verdict, verdictWhy;
  if (attributedShare >= GO_BAR || attrCapableExcess > 0) {
    verdict = 'DEFENSE-HARM';
    verdictWhy = 'attributed share ' + attributedShare.toFixed(3) + ' (bar < ' + GO_BAR + '); combat-capable window excess ' + attrCapableExcess;
  } else {
    const refOk = noise && (Math.abs(b3Mean - noise.mean) / (noise.sd / Math.sqrt(pairRows.length))) < 2;
    verdict = 'NOISE';
    verdictWhy = 'attributed share ' + attributedShare.toFixed(3) + ' < ' + GO_BAR +
      '; combat-capable window excess ' + attrCapableExcess + ' ≤ 0; no timing/cause/who pattern' +
      (noise ? '; paired-delta mean ' + b3Mean.toFixed(2) + ' consistent with independent b2 person-only band (sd ' + noise.sd + ')' : '');
  }

  const rate = (b) => ({ days: b.days, wildFights: b.enc, villagerKills: b.vkill, villagerDeaths: b.vdie || 0,
    fightPerDay: b.days ? +(b.enc / b.days).toFixed(4) : null,
    killPerDay: b.days ? +(b.vkill / b.days).toFixed(4) : null,
    deathPerDay: b.days ? +(((b.vdie || 0) / b.days).toFixed(4)) : null });

  const result = {
    instrument: 'analyze-huntdefense-b3.js',
    corpus: CORPUS,
    pairs: pairRows.length,
    window: 'hunt-assignment day d or d+1',
    villagerDeathsOnly: 'tele kind person/villager (monster kills excluded — the b2 instrument pollution), deduped on (who,day,cause)',
    totals: { armed: armedV, control: controlV, delta: totalDelta },
    duplication: { rawArmed: armedRawV, rawControl: controlRawV,
      note: 'finding #517: dedup on (who,day,cause) before any count' },
    monsterKillsInDeathStream: { armed: armedMonsterKills, control: controlMonsterKills,
      note: 'villager field-fight monster kills — excluded from villager-death metrics (the b2 pollution class)' },
    primary: {
      definition: 'Σ_pairs (armed combat-ish non-assigned-hunter VILLAGER deaths on hunt-exposed days − control on matched days) / deduped villager-death delta (0 if delta ≤ 0)',
      attributedDeaths: attrSum,
      denominatorDeduped: totalDelta,
      attributedShare: +attributedShare.toFixed(4),
      goBar: '< ' + GO_BAR,
      go: defenseGoShare,
      windowArmedCombatVillDeaths: windowArmedCombat,
      windowControlCombatVillDeaths: windowControlCombat,
    },
    secondary: {
      definition: 'combat-capable (hunterOcc or hunter-substrate occ) villager deaths on hunt-exposed days, armed − control on matched days ≤ 0',
      armedCapable: windowArmedCapable, controlCapable: windowControlCapable,
      excess: attrCapableExcess,
      go: defenseGoCapable,
    },
    exposedDays: exposedArmedDays,
    encounterLens: {
      note: 'revival-spec item 1: wild-encounter telemetry on hunt-exposed days (armed) vs matched calendar days (control); via=wild-fight rows are the fieldFight resolutions (outcome/allies)',
      armed: { encounters: expArmedEnc, villagerKills: expArmedVKill, villagerDeaths: expArmedVDie, alliedFights: expArmedAllied },
      control: { encounters: expCtrlEnc, villagerKills: expCtrlVKill, villagerDeaths: expCtrlVDie, alliedFights: expCtrlAllied },
    },
    leanDayItem4: {
      note: 'revival-spec item 4 (reframed per the kind discovery): wild-encounter monster-kill rate on lean days with/without assignment',
      armedLeanAssigned: rate(lean.armedAssigned),
      armedLeanUnassigned: rate(lean.armedUnassigned),
      controlLean: rate(lean.control),
    },
    noise,
    causes: causeRows,
    occupations: occRows.slice(0, 25),
    hunterFateRecheck: {
      assignedHunterDeathRecords: assignedHunterDeathsSeen,
      huntAttributable: huntAttributable,
      hunterOccDeathsArmed: armedHunterOcc, hunterOccDeathsControl: controlHunterOcc,
      controlHuntDutyLogEntries: controlAssignLogEntries,
    },
    pairRows,
    senseCases,
    verdict, verdictWhy,
  };
  return stable(result);
}

if (require.main === module) {
  const out = main();
  const outPath = process.argv[3];
  if (outPath) fs.writeFileSync(outPath, out + '\n');
  else process.stdout.write(out + '\n');
}
module.exports = { main };
