#!/usr/bin/env node
// rosterlot-sweep-20261031.js — sim-rosterlot-a generation-time census.
// Reads the STARTING roster immediately after setupGame (no days run,
// no policy): roster ids, scholar id, per-member formerOccupation,
// delegate-combat-regex match, raw agency kills (absent -> null),
// trap-knowledge flags carried on the person object, and source
// (generated vs background). MEASUREMENT ONLY: draws no policy RNG
// beyond the harness's own seeded load, writes no game state.
// Usage: SEEDS=85201,85202 [EVID=<dir>] node scripts/rosterlot-sweep-20261031.js
// Existing valid per-seed outputs are resumed (not re-run); a 0-byte
// or unparseable output is re-run. Writes are atomic (tmp + rename)
// with retries for the intermittent container EPERM write flap.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const COMBAT_OCC_RE = /(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/;
function combatOcc(occLower) {
  try { return COMBAT_OCC_RE.test(String(occLower || '')); } catch (e) { return false; }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [85201, 85202, 85203, 85204, 85205, 85206, 85207, 85208]).filter(Number.isFinite);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-rosterlot-a');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}

function sleepSync(ms) {
  try { execSync('sleep ' + (ms / 1000).toFixed(3)); } catch (e) {}
}

// Atomic write with EPERM-flap retries: tmp file + rename, up to ~2 min.
function writeAtomic(file, text) {
  const tmp = file + '.tmp';
  let lastErr = null;
  for (let i = 0; i < 60; i++) {
    try {
      fs.writeFileSync(tmp, text);
      fs.renameSync(tmp, file);
      const back = fs.readFileSync(file, 'utf8');
      if (back === text) return;
      lastErr = new Error('verify mismatch after rename');
    } catch (e) { lastErr = e; }
    try { fs.unlinkSync(tmp); } catch (e) {}
    sleepSync(1000 + i * 100);
  }
  throw lastErr || new Error('write failed');
}

function validOut(file) {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    return j && typeof j.seed === 'number' && Array.isArray(j.members) && Array.isArray(j.errors);
  } catch (e) { return false; }
}

async function oneSeed(seed) {
  const out = { seed, anchorCommit: ANCHOR, arm: 'rosterlot', errors: [] };
  try {
    const { Game } = await loadGame({ seed, mode: 'deadfall-diag', fullTelemetry: false });
    await setupGame(Game);
    const scholarId = Game.villagerId;
    const roster = (((Game.state || {}).village || {}).roster || []).slice();
    const genIds = new Set(((Game.generatedRoster || []).map(c => c.id)));
    const bgIds = new Set(((Game.data || {}).background_survivors || []).map(s => s.id));
    const persons = Game.data.villagers || [];
    const agencyStats = ((((Game.state || {}).village || {}).agency || {}).stats) || null;
    out.scholarId = scholarId;
    out.roster = roster;
    out.rosterN = roster.length;
    out.generatedN = roster.filter(id => genIds.has(id)).length;
    out.backgroundN = roster.filter(id => bgIds.has(id)).length;
    const members = [];
    for (const vid of roster) {
      const m = { vid, isScholar: vid === scholarId, personMissing: false,
        source: genIds.has(vid) ? 'generated' : (bgIds.has(vid) ? 'background' : 'unknown'),
        name: null, occ: null, occLower: null, occupationId: null,
        combatOcc: false, kills: null, agencyPresent: false,
        knowsSnare: null, knowsPit: null };
      try {
        const p = persons.find(x => x && x.id === vid) || null;
        if (!p) { m.personMissing = true; members.push(m); continue; }
        m.name = p.name || null;
        m.occ = p.formerOccupation || null;
        m.occLower = String(m.occ || '').toLowerCase();
        m.occupationId = p.occupationId || null;
        m.combatOcc = combatOcc(m.occLower);
        if (agencyStats && agencyStats[vid] !== undefined && agencyStats[vid] !== null) {
          m.agencyPresent = true;
          const k = agencyStats[vid].monsterKills;
          m.kills = (typeof k === 'number') ? k : null;
        }
        if (typeof p.knowsSnare === 'boolean') m.knowsSnare = p.knowsSnare;
        if (typeof p.knowsPit === 'boolean') m.knowsPit = p.knowsPit;
      } catch (e) { out.errors.push('member ' + vid + ': ' + String((e && e.message) || e)); }
      members.push(m);
    }
    out.members = members;
    const askable = members.filter(m => !m.isScholar);
    out.askableN = askable.length;
    out.askableHolders = askable.filter(m => m.combatOcc).map(m => ({ vid: m.vid, occ: m.occ, source: m.source }));
    out.fullHolders = members.filter(m => m.combatOcc).map(m => ({ vid: m.vid, occ: m.occ, source: m.source, isScholar: m.isScholar }));
    out.playerIsCombat = !!members.find(m => m.isScholar && m.combatOcc);
    out.shape85107 = out.askableHolders.length === 0;
    out.personMissingN = members.filter(m => m.personMissing).length;
    out.nonzeroKillsN = members.filter(m => typeof m.kills === 'number' && m.kills > 0).length;
    out.trapKnowledgeAskable = askable.filter(m => m.knowsSnare === true || m.knowsPit === true)
      .map(m => ({ vid: m.vid, occ: m.occ, source: m.source, knowsSnare: m.knowsSnare, knowsPit: m.knowsPit }));
  } catch (e) {
    out.errors.push('seed: ' + String((e && e.message) || e));
    if (!out.members) out.members = [];
  }
  return out;
}

async function main() {
  for (const seed of SEEDS) {
    const file = path.join(EVID, 's' + seed + '.json');
    if (validOut(file)) { console.log('s' + seed + ': resume (valid output exists)'); continue; }
    const out = await oneSeed(seed);
    writeAtomic(file, JSON.stringify(out, null, 2) + '\n');
    console.log('s' + seed + ': roster=' + out.rosterN + ' askable=' + out.askableN +
      ' holdersAskable=' + (out.askableHolders || []).length +
      ' shape85107=' + out.shape85107 + ' missing=' + out.personMissingN +
      ' nonzeroKills=' + out.nonzeroKillsN + ' errors=' + out.errors.length);
  }
}

main().catch(e => { console.error('SWEEP FAIL: ' + String((e && e.stack) || e)); process.exit(1); });
