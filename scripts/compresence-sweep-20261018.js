#!/usr/bin/env node
// compresence-sweep-20261018.js — sim-compresence diagnostic sweep.
//
// 8 fresh seeds (63301-63308 — verified filename-unused in
// evidence/2026-10-18/perseed-*/ before the sweep) x {leadfeast,
// belongfeast} = 16 runs, 180d death-aware, on the compchan pre-seat
// substrate (pure tribfloor base — NO vetstaff/vetblood/vetrel), with the
// COMPRESENCE read-only presence instrument.
//
// STANDALONE driver (do NOT fold into scripts/sweep-compare.js — sibling
// loop B has live concurrent edits there).
//
// INSTRUMENT: loadGame({seed, mode:'compresence', fullTelemetry:false}) +
// scripts/policies/tribfloor leadfeast/belongfeast +
// scripts/compresence-instrument-20261018.js (COMPRESENCE=1) +
// runDays({days:180}).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-compresence/ and prints a summary. No
// timestamps or timings are written, so re-runs are byte-comparable
// (fight ids are never persisted — see the instrument header).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 COMPRESENCE=1 \
//   SEEDS=63301,63302 node scripts/compresence-sweep-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const CP = require(path.join(REPO, 'scripts', 'compresence-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'COMPRESENCE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (process.env.VETSTAFF === '1') { console.error('SWEEP STOP: VETSTAFF must be unset (pure tribfloor base).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!CP.instrumentOn()) { console.error('SWEEP STOP: COMPRESENCE instrument off despite COMPRESENCE=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63301, 63302, 63303, 63304, 63305, 63306, 63307, 63308]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-compresence');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// Slim a fight-start snapshot for persistence: keep joiner + nonjoiner
// essentials, drop per-vid noise beyond the nearest few.
function slimFight(f) {
  const nj = (f.nonjoiners || []).slice().sort((a, b) => {
    const da = (a.gridDist == null ? 99 : a.gridDist), db = (b.gridDist == null ? 99 : b.gridDist);
    if (a.sameNode !== b.sameNode) return a.sameNode ? -1 : 1;
    return da - db;
  });
  return {
    day: f.day, mid: f.mid, wave: f.wave,
    scholar: f.scholar,
    rosterStart: f.rosterStart, rosterSize: f.rosterSize, partySize: f.partySize,
    partyVids: f.partyVids || [],
    joiners: (f.joiners || []).map(j => ({
      vid: j.vid, name: j.name, ai: j.ai, weapon: j.weapon, armor: j.armor,
      grid: j.grid, distToMonsters: j.distToMonsters, hp: j.hp, maxHp: j.maxHp, fled: j.fled,
    })),
    nonjoiners: nj.slice(0, 8).map(n => ({
      vid: n.vid, name: n.name, inParty: n.inParty, sameNode: n.sameNode,
      node: n.node, gridDist: n.gridDist, atHavenNode: n.atHavenNode, side: n.side, sideMatch: n.sideMatch,
    })),
    nonjoinerCount: nj.length,
    monsters: f.monsters || [],
  };
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'compresence', fullTelemetry: false });
  const t = { fights: [], kills: [], engagements: [], census: [], dmg: {}, fieldFights: [], instrumentErrors: [] };
  await setupGame(Game);
  try { t.rosterStart = CP.rosterOf(Game).length; } catch (e) { t.rosterStart = -1; }
  const uninstall = CP.install(Game, t);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // --- wave-3+ kills with presence channels ---
  const kills3 = [];
  const chanCounts = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, x: 0 };
  let dmgAttached = 0, singleMonster = 0;
  for (const k of t.kills) {
    if ((k.wave | 0) < 3) continue;
    if (k.dmg) { dmgAttached++; if (k.dmg.singleMonster) singleMonster++; }
    if (k.channel in chanCounts) chanCounts[k.channel]++;
    const d = k.dmg || null;
    const tot = d ? (d.scholar + d.companion + d.other) : 0;
    kills3.push({
      d: k.day, mid: k.mid, w: k.wave, by: k.by, byName: nameOf(Game, k.by),
      via: k.via, pyrrhic: !!k.pyrrhic, shape: k.shape,
      channel: k.channel, channelNote: k.channelNote,
      channelEvidence: k.channelEvidence || null,
      startScholar: k.startScholar || null,
      dmg: d ? {
        scholar: d.scholar, companion: d.companion, other: d.other, hits: d.hits,
        byVid: d.byVid, singleMonster: d.singleMonster,
        compShare: tot > 0 ? +(d.companion / tot).toFixed(3) : null,
        scholarShare: tot > 0 ? +(d.scholar / tot).toFixed(3) : null,
      } : null,
      field: k.field || null,
    });
  }
  kills3.sort((a, b) => a.d - b.d);

  // --- wave-3+ engagements (fights, not just kills) with joiner counts ---
  const fights3 = t.fights.filter(f => (f.wave | 0) >= 3).map(f => ({
    day: f.day, mid: f.mid, shape: null,
    nJoiners: (f.joiners || []).length,
    joinerNames: (f.joiners || []).map(j => j.name),
    scholarAtHaven: !!(f.scholar && f.scholar.atHaven),
  }));

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  const out = {
    seed, policyId, instrument: 'compresence',
    substrate: 'pure round-1 tribfloor (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1, no vetstaff/vetblood/vetrel)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    rosterStart: t.rosterStart,
    w3Kills: kills3.length,
    w3Fights: fights3.length,
    chanCounts, dmgAttached, singleMonsterKills: singleMonster,
    kills: kills3,
    fights: t.fights.filter(f => (f.wave | 0) >= 3).map(slimFight),
    fieldFights: t.fieldFights,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
  };
  const fp = path.join(EVID, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: w3kills=${r.w3Kills} chan=${JSON.stringify(r.chanCounts)} errs=${r.instrumentErrors.length} days=${r.days}`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, instrument: 'compresence', error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const summary = {
    instrument: 'compresence', n: ok.length, errors: rows.length - ok.length,
    totalW3Kills: ok.reduce((a, r) => a + r.w3Kills, 0),
    totalW3Fights: ok.reduce((a, r) => a + r.w3Fights, 0),
    chanTotals: ok.reduce((acc, r) => {
      for (const k of Object.keys(acc)) acc[k] += (r.chanCounts || {})[k] || 0;
      return acc;
    }, { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, x: 0 }),
    instrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
    wave4: ok.filter(r => r.wave4).length,
    national: ok.filter(r => r.national).length,
  };
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
