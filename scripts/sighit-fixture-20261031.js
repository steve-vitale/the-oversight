#!/usr/bin/env node
// sighit-fixture-20261031.js — sim-sighit-b signature-hit measurement.
// MEASUREMENT ONLY. No game code is changed by this script; it only calls
// the real Game.fieldFight through the sim harness, plus a wrapper around
// Game.sigW4FieldMonster installed inside this process:
//   - main leg: record-only (calls the original, records the sig delta,
//     returns the original value unchanged — zero interference).
//   - instrument leg: calls the original (same RNG draws, same side
//     effects including audit tax and narration) but returns the pre-sig
//     total, i.e. the signature damage component is zeroed in the return
//     value only. Paired per-stream counterfactual; changes no default,
//     no src file, no policy, and nothing ships from this process.
//
// Usage:
//   node scripts/sighit-fixture-20261031.js [outPath]
// Default out: evidence/2026-10-31/perseed-sighit-b/fixture-band.json
// The file contains NO timestamps or timings, so two runs on the same
// base are byte-comparable (the determinism gate in the prereg).
//
// Design (see evidence/2026-10-31/sim-sighit-b-prereg.md): solo
// unarmored leader (P1-DUAL: machete + crude_bow + 8 arrows, no armor)
// vs congregation / eater / audit, 8 rng streams each, both legs.
// Every monster hit on the leader is recorded per-hit: attack name
// from the log line, base band from monsters.json, sig delta from the
// wrapper, observed final damage from the log line, leader HP after,
// and whether the leader died that round.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const REPO = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const TIER_DUAL = [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }];
const BEASTS = [
  { id: 'congregation', hpMid: 1000, speed: 2 },
  { id: 'eater', hpMid: 1050, speed: 4 },
  { id: 'audit', hpMid: 1200, speed: 2 },
];
const STREAMS = [301, 302, 303, 304, 305, 306, 307, 308];

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }

function summarizeHits(hits) {
  if (!hits.length) return { n: 0 };
  const dmg = hits.map(h => h.observed);
  const above = hits.filter(h => h.baseBand && h.observed > h.baseBand[1]).length;
  const sig = hits.filter(h => h.sigDelta > 0).length;
  return {
    n: hits.length,
    medianObserved: median(dmg), meanObserved: mean(dmg),
    minObserved: Math.min.apply(null, dmg), maxObserved: Math.max.apply(null, dmg),
    aboveBandTop: above, aboveBandShare: above / hits.length,
    signatureInflated: sig, signatureShare: sig / hits.length,
    leaderDeaths: hits.filter(h => h.leaderDiedThisRound).length,
  };
}

async function main() {
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-sighit-b', 'fixture-band.json');
  let anchor = 'unknown';
  try { anchor = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'sighit-fixture' });
  if (loadFails && loadFails.length) { console.error('LOAD FAILS: ' + loadFails.join('; ')); process.exit(1); }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (!roster.length) { console.error('NO NPC ROSTER'); process.exit(1); }
  const leaderVid = roster.indexOf('boris_kowalski') >= 0 ? 'boris_kowalski' : roster[0];
  const vpOf = (vid) => (Game.data.villagers || []).find(v => v.id === vid) || {};
  const heldAb = (vid) => { try { return Game.npcOwnedIds ? Game.npcOwnedIds(vid) : []; } catch (e) { return []; } };
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  for (const b of BEASTS) if (!mdef(b.id)) { console.error('MISSING MONSTER DEF: ' + b.id); process.exit(1); }
  for (const it of TIER_DUAL) {
    if (!(Game.data.items || []).some(i => i.id === it.itemId)) { console.error('MISSING ITEM DEF: ' + it.itemId); process.exit(1); }
  }
  const vp = vpOf(leaderVid);
  vp.age = 35;
  try { vp.personality = { temperament: 'steady' }; } catch (e) {}
  const vpSnap = JSON.parse(JSON.stringify(vp));
  const stateSnap = JSON.parse(JSON.stringify(Game.state));
  const fighterInfo = { age: 35, temperament: 'steady', health: 100, heldAbilities: heldAb(leaderVid),
    speed: (Game.villagerSpeed ? Game.villagerSpeed(leaderVid) : null) };
  const baseBandOf = (beastId, atkName) => {
    const md = mdef(beastId);
    const a = (md.attacks || []).find(x => x.name === atkName);
    if (a && a.damage && a.damage.length === 2) return a.damage.slice();
    if (md.attack && md.attack.name === atkName && md.attack.damage) return md.attack.damage.slice();
    return null;
  };

  function restoreAll() {
    const st = Game.state;
    for (const k of Object.keys(st)) if (!(k in stateSnap)) delete st[k];
    for (const k of Object.keys(stateSnap)) st[k] = JSON.parse(JSON.stringify(stateSnap[k]));
    const v = vpOf(leaderVid);
    for (const k of Object.keys(v)) if (!(k in vpSnap)) delete v[k];
    for (const k of Object.keys(vpSnap)) v[k] = JSON.parse(JSON.stringify(vpSnap[k]));
  }
  function resetFighter() {
    restoreAll();
    try { (Game.state.village.health = Game.state.village.health || {})[leaderVid] = 100; } catch (e) {}
    const leader = vpOf(leaderVid);
    leader.items = JSON.parse(JSON.stringify(TIER_DUAL));
    try { delete leader.equipped; } catch (e) {}
  }

  const origSig4 = Game.sigW4FieldMonster;
  if (typeof origSig4 !== 'function') { console.error('NO sigW4FieldMonster ON Game'); process.exit(1); }
  let sigCalls = [];
  function installWrapper(leg) {
    sigCalls = [];
    Game.sigW4FieldMonster = function (md, rec, ctx) {
      const before = ctx.total;
      const out = origSig4.call(this, md, rec, ctx);
      const delta = (typeof out === 'number' ? out : ctx.total) - before;
      sigCalls.push({ beast: md && md.id, round: ctx.round, before: before,
        after: (typeof out === 'number' ? out : ctx.total), delta: delta });
      return leg === 'instrument' ? before : out;
    };
  }
  function uninstallWrapper() { Game.sigW4FieldMonster = origSig4; }

  const HIT_RE = /^R(\d+): (.+) hits (.+) for (\d+) \((\d+) left\)$/;
  function runLeg(leg) {
    const fights = [];
    for (const beast of BEASTS) {
      for (const s of STREAMS) {
        resetFighter();
        installWrapper(leg);
        const m = { hp: beast.hpMid, maxHp: beast.hpMid };
        let rec;
        try { rec = Game.fieldFight(leaderVid, mdef(beast.id), m, { rng: mulberry32(s) }); }
        catch (e) { console.error('FIGHT THREW ' + beast.id + '/' + s + '/' + leg + ': ' + e.message); process.exit(1); }
        const calls = sigCalls.slice();
        uninstallWrapper();
        const log = Array.isArray(rec.log) ? rec.log.slice() : [];
        const hits = [];
        for (const line of log) {
          const mm = HIT_RE.exec(line);
          if (!mm) continue;
          const round = parseInt(mm[1], 10), atkName = mm[2], observed = parseInt(mm[4], 10), hpAfter = parseInt(mm[5], 10);
          // Match the wrapper call for this round (one member => one call
          // per round; calls are in round order).
          const call = calls.filter(c => c.round === round)[0] || null;
          const band = baseBandOf(beast.id, atkName);
          hits.push({ beast: beast.id, stream: s, leg: leg, round: round, attack: atkName,
            baseBand: band, sigDelta: call ? call.delta : null, sigBefore: call ? call.before : null,
            sigAfter: call ? call.after : null, observed: observed, hpAfter: hpAfter,
            leaderDiedThisRound: hpAfter <= 0,
            signatureInflated: call ? call.delta > 0 : null,
            aboveBandTop: band ? observed > band[1] : null,
            // Reconstruction check: log-final should equal sig-returned
            // total for an unarmored leader with no modifying abilities.
            reconMatch: call ? (observed === call.after || (leg === 'instrument' && observed === call.before)) : null });
        }
        const r1hits = hits.filter(h => h.round === 1);
        fights.push({ leg: leg, variant: 'P1-DUALx' + beast.id, beast: beast.id,
          beastStartHp: beast.hpMid, beastSpeed: beast.speed, stream: s,
          rounds: rec.rounds !== undefined ? rec.rounds : null,
          outcome: rec.outcome || 'unresolved',
          round1LeaderDeath: r1hits.some(h => h.leaderDiedThisRound),
          vTaken: rec.vTaken !== undefined ? rec.vTaken : null,
          mDealt: rec.mDealt !== undefined ? rec.mDealt : null,
          vHpLeft: rec.vHpLeft !== undefined ? rec.vHpLeft : null,
          volleyDmg: rec.volley ? (rec.volley.dmg || 0) : null,
          sigCalls: calls, hits: hits, log: log });
      }
    }
    return fights;
  }

  const mainFights = runLeg('main');
  const instFights = runLeg('instrument');
  const allFights = mainFights.concat(instFights);

  // Per-beast round-1 summaries + paired deltas.
  const perBeast = {};
  for (const b of BEASTS) {
    const mainR1 = [], instR1 = [], paired = [];
    for (const s of STREAMS) {
      const mf = mainFights.find(f => f.beast === b.id && f.stream === s);
      const inf = instFights.find(f => f.beast === b.id && f.stream === s);
      const mh = mf.hits.filter(h => h.round === 1);
      const ih = inf.hits.filter(h => h.round === 1);
      mainR1.push.apply(mainR1, mh); instR1.push.apply(instR1, ih);
      for (let i = 0; i < Math.max(mh.length, ih.length); i++) {
        paired.push({ stream: s,
          mainObserved: mh[i] ? mh[i].observed : null, mainAttack: mh[i] ? mh[i].attack : null,
          mainBand: mh[i] ? mh[i].baseBand : null, mainDelta: mh[i] ? mh[i].sigDelta : null,
          instObserved: ih[i] ? ih[i].observed : null, instAttack: ih[i] ? ih[i].attack : null,
          pairedDelta: (mh[i] && ih[i]) ? mh[i].observed - ih[i].observed : null,
          mainDeath: mh[i] ? mh[i].leaderDiedThisRound : null });
      }
    }
    perBeast[b.id] = { mainR1: summarizeHits(mainR1), instR1: summarizeHits(instR1),
      round1DeathShareMain: mainFights.filter(f => f.beast === b.id).filter(f => f.round1LeaderDeath).length / STREAMS.length,
      round1DeathShareInst: instFights.filter(f => f.beast === b.id).filter(f => f.round1LeaderDeath).length / STREAMS.length,
      paired: paired };
  }
  // All-rounds summaries.
  const allRounds = {};
  for (const b of BEASTS) {
    allRounds[b.id] = { main: summarizeHits(mainFights.filter(f => f.beast === b.id).reduce((a, f) => a.concat(f.hits), [])),
      instrument: summarizeHits(instFights.filter(f => f.beast === b.id).reduce((a, f) => a.concat(f.hits), [])) };
  }
  const reconBad = allFights.reduce((a, f) => a.concat(f.hits.filter(h => h.reconMatch === false)), []);
  // GO gate (prereg G1/G2; G3 det-gate checked by the proof script).
  const g1 = allFights.length === 48 && allFights.every(f => f.hits.length > 0 || f.rounds === 0);
  function beastPass(bid, strictAudit) {
    const pb = perBeast[bid].paired;
    const sigBand = bid === 'congregation' ? [50, 70] : (bid === 'eater' ? [45, 75] : [0, 0]);
    let deltaOk = 0, bandOk = 0, n = 0;
    for (const p of pb) {
      if (p.mainObserved == null || p.instObserved == null) continue;
      n++;
      if (bid === 'audit') { if (p.pairedDelta === 0) deltaOk++; }
      else if (p.pairedDelta >= sigBand[0] && p.pairedDelta <= sigBand[1]) deltaOk++;
      if (p.mainBand && p.instObserved >= p.mainBand[0] && p.instObserved <= p.mainBand[1]) bandOk++;
    }
    if (bid === 'audit') return { n: n, deltaOk: deltaOk, bandOk: bandOk, pass: (n === 8 && deltaOk === 8 && bandOk === 8) };
    return { n: n, deltaOk: deltaOk, bandOk: bandOk, pass: (deltaOk >= 7 && bandOk >= 7) };
  }
  const gate = { cong: beastPass('congregation'), eater: beastPass('eater'), audit: beastPass('audit') };
  const g2 = gate.cong.pass && gate.eater.pass && gate.audit.pass;
  const verdict = (!g1) ? 'KILLED-AT-PILOT' : (g2 ? 'DIAG-GO' : 'DIAG-NO-GO');
  console.log('PER-BEAST R1: ' + JSON.stringify(perBeast));
  console.log('GATE: ' + JSON.stringify(gate) + ' g1=' + g1 + ' g2=' + g2 + ' verdict=' + verdict);
  console.log('RECON MISMATCHES: ' + reconBad.length);

  const out = { arm: 'sim-sighit-b', anchorCommit: anchor, harnessSeed: 4242,
    leader: leaderVid, fighterInfo: fighterInfo, streams: STREAMS,
    perBeast: perBeast, allRounds: allRounds, gate: gate, g1: g1, g2: g2,
    verdict: verdict, reconMismatches: reconBad, fights: allFights };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('WROTE ' + outPath + ' fights=' + allFights.length + ' verdict=' + verdict);
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
