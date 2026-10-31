#!/usr/bin/env node
// allycap-fixture-20261031.js — sim-allycap-a second-ally engine-cap census.
// MEASUREMENT ONLY. No game code is changed; it only calls the real
// Game.fieldFight through the sim harness (spearxbow-a lineage).
//
// Usage:
//   node scripts/allycap-fixture-20261031.js [outPath]
// Default out: evidence/2026-10-31/perseed-allycap-a/fixture-band.json
// The file contains NO timestamps or timings, so two runs on the same
// base are byte-comparable (the determinism gate in the prereg).
// anchorCommit is the last commit touching src/, not HEAD (spearxbow-a
// lesson: a HEAD anchor moves when the corpus itself is committed).
//
// Design (see evidence/2026-10-31/sim-allycap-a-prereg.md): three roster
// NPC fighters (leader + allies A, B), fixed at age 35 / steady / 100 HP,
// restored before EVERY fight from snapshots (villager records in place +
// the FULL Game.state deep snapshot). Beast entity is fresh per fight.
// No awareness (forced meeting). Leader tier fixed: machete + crude_bow
// + 8 arrows + hide_armor (spearxbow-a P2-BOW shape).
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

const TIER = [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'hide_armor', units: 1 }];
const BEASTS = [
  { id: 'congregation', hpMid: 1000, speed: 2 },
  { id: 'eater', hpMid: 1050, speed: 4 },
];
// variant: { kind: 'FS'|'SH'|'CORN', allies, vids: ['A'|'B'...], beast }
const PILOT_VARIANTS = [
  { kind: 'FS', allies: 2, vids: ['A', 'B'], beast: 'congregation' },
  { kind: 'SH', allies: 2, vids: ['A', 'B'], beast: 'congregation' },
  { kind: 'SH', allies: 2, vids: ['A', 'B'], beast: 'eater' },
];
const PILOT_STREAMS = [101, 102, 103, 104];
const CONFIRM_STREAMS = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212];

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
function rate(arr, pred) { return arr.length ? arr.filter(pred).length / arr.length : null; }

function summarize(fights) {
  const outcomes = {};
  for (const f of fights) outcomes[f.outcome] = (outcomes[f.outcome] || 0) + 1;
  return {
    n: fights.length,
    medianTotalDmg: median(fights.map(f => f.totalDmg)),
    meanTotalDmg: mean(fights.map(f => f.totalDmg)),
    medianRounds: median(fights.map(f => f.rounds)),
    meanRounds: mean(fights.map(f => f.rounds)),
    medianDpr: median(fights.filter(f => f.rounds > 0).map(f => f.dpr)),
    outcomes,
    fromStartRate: rate(fights, f => f.fromStartJoined),
    shoutRate: rate(fights, f => f.shoutJoined),
    maxShouts: fights.length ? Math.max(...fights.map(f => f.shoutCount)) : null,
    secondEntryRate: rate(fights, f => f.secondEntered),
    medianVolleyDmg: median(fights.map(f => f.volleyDmg === null ? 0 : f.volleyDmg)),
    medianAllyDealt: median(fights.map(f => f.allyDealt || 0)),
    vDieRate: rate(fights, f => f.outcome === 'vDie'),
    rearGuardRate: rate(fights, f => f.rearGuardHasB),
    bHealthDeltaMax: fights.length ? Math.max(...fights.map(f => Math.abs(f.bHealthAfter - f.bHealthBefore))) : null,
  };
}

async function main() {
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-allycap-a', 'fixture-band.json');
  let anchor = 'unknown';
  try { anchor = execSync('git log -1 --format=%H -- src/', { cwd: REPO }).toString().trim(); } catch (e) {}
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'allycap-fixture' });
  if (loadFails && loadFails.length) { console.error('LOAD FAILS: ' + loadFails.join('; ')); process.exit(1); }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.error('NEED 3 NPC ROSTER, HAVE ' + roster.length); process.exit(1); }
  const leaderVid = roster.indexOf('boris_kowalski') >= 0 ? 'boris_kowalski' : roster[0];
  const others = roster.filter(id => id !== leaderVid);
  const allyA = others[0], allyB = others[1];
  const staged = [leaderVid, allyA, allyB];
  const vpOf = (vid) => (Game.data.villagers || []).find(v => v.id === vid) || {};
  const firstName = (vid) => {
    try {
      const d = Game.displayName ? Game.displayName(vid) : vid;
      return String(d).split(' ')[0];
    } catch (e) { return vid; }
  };
  const bFirst = firstName(allyB), aFirst = firstName(allyA);
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  for (const b of BEASTS) if (!mdef(b.id)) { console.error('MISSING MONSTER DEF: ' + b.id); process.exit(1); }
  for (const it of TIER) {
    if (!(Game.data.items || []).some(i => i.id === it.itemId)) { console.error('MISSING ITEM DEF: ' + it.itemId); process.exit(1); }
  }
  for (const vid of staged) {
    const vp = vpOf(vid);
    vp.age = 35;
    try { vp.personality = { temperament: 'steady' }; } catch (e) {}
  }
  const vpSnaps = {};
  for (const vid of staged) vpSnaps[vid] = JSON.parse(JSON.stringify(vpOf(vid)));
  const stateSnap = JSON.parse(JSON.stringify(Game.state));
  const fighterInfo = {};
  for (const vid of staged) {
    fighterInfo[vid] = { age: 35, temperament: 'steady', health: 100, firstName: firstName(vid) };
  }

  function restoreAll() {
    const st = Game.state;
    for (const k of Object.keys(st)) if (!(k in stateSnap)) delete st[k];
    for (const k of Object.keys(stateSnap)) st[k] = JSON.parse(JSON.stringify(stateSnap[k]));
    for (const vid of staged) {
      const vp = vpOf(vid), snap = vpSnaps[vid];
      for (const k of Object.keys(vp)) if (!(k in snap)) delete vp[k];
      for (const k of Object.keys(snap)) vp[k] = JSON.parse(JSON.stringify(snap[k]));
    }
  }
  function resetFighters() {
    restoreAll();
    for (const vid of staged) {
      try { (Game.state.village.health = Game.state.village.health || {})[vid] = 100; } catch (e) {}
    }
    const leader = vpOf(leaderVid);
    leader.items = JSON.parse(JSON.stringify(TIER));
    try { delete leader.equipped; } catch (e) {}
    for (const vid of [allyA, allyB]) {
      const ap = vpOf(vid);
      ap.items = [];
      try { ap.equipped = {}; } catch (e) {}
    }
  }
  const bHealth = () => {
    try { return (Game.state.village.health || {})[allyB]; } catch (e) { return null; }
  };

  function variantName(v) {
    const vidPart = v.vids.join('+');
    return v.kind + '-a' + v.allies + '-v[' + vidPart + ']x' + v.beast;
  }
  function runVariant(variant, streams, stage) {
    const fights = [];
    const beast = BEASTS.find(b => b.id === variant.beast);
    const vids = variant.vids.map(x => (x === 'A' ? allyA : allyB));
    for (const s of streams) {
      resetFighters();
      const bBefore = bHealth();
      const m = { hp: beast.hpMid, maxHp: beast.hpMid };
      const opts = { rng: mulberry32(s), allies: variant.allies, allyVids: vids.slice() };
      if (variant.kind === 'FS') opts.allyFromStart = true;
      if (variant.kind === 'CORN') opts.cornered = true;
      let rec;
      try { rec = Game.fieldFight(leaderVid, mdef(variant.beast), m, opts); }
      catch (e) { console.error('FIGHT THREW ' + JSON.stringify(variant) + '/' + s + ': ' + e.message); process.exit(1); }
      const bAfter = bHealth();
      const vol = rec.volley || null;
      const volDmg = vol ? (vol.dmg || 0) : null;
      const allyDealt = rec.allyDealt || 0;
      const total = rec.mDealt || 0;
      const log = Array.isArray(rec.log) ? rec.log.slice() : [];
      const logText = log.join('\n');
      const chargesLines = log.filter(l => l.indexOf('charges in') >= 0);
      const shoutCount = (logText.match(/shouts for help/g) || []).length;
      // NOTE: bStrike detection is done in the post-pass below (descriptors
      // are read off the engine's own log lines — displayName returns a
      // description, not a first name, so a first-token match is vacuous).
      // In-loop values here are placeholders, overwritten post-pass.
      const bStrikeLines = [];
      const bNamedCharges = [];
      // A second entry is evidenced by ANY of: rec.allyVid == B, a
      // charges-in line naming B, or a strike line naming B.
      const secondEntered = (rec.allyVid === allyB) || bNamedCharges.length > 0 || bStrikeLines.length > 0;
      fights.push({
        stage, variant: variantName(variant),
        kind: variant.kind, allies: variant.allies, vids: variant.vids.slice(), beast: variant.beast,
        beastStartHp: beast.hpMid, beastSpeed: beast.speed, stream: s,
        volleyShots: vol ? (vol.shots || 0) : null, volleyHits: vol ? (vol.hits || 0) : null,
        volleyDmg: volDmg, totalDmg: total, allyDealt,
        rounds: rec.rounds !== undefined ? rec.rounds : null,
        dpr: (rec.rounds > 0) ? total / rec.rounds : null,
        outcome: rec.outcome || 'unresolved',
        allyVid: rec.allyVid || null, allyVidIsB: rec.allyVid === allyB,
        fromStartJoined: logText.indexOf('already at the door') >= 0,
        shoutJoined: logText.indexOf('shouts for help') >= 0,
        shoutCount, chargesLines, bStrikeCount: bStrikeLines.length,
        secondEntered,
        vHpLeft: rec.vHpLeft !== undefined ? rec.vHpLeft : null,
        allyHpLeft: rec.allyHpLeft !== undefined ? rec.allyHpLeft : null,
        mHpLeft: rec.mHpLeft !== undefined ? rec.mHpLeft : null,
        rearGuard: rec.rearGuard || null,
        rearGuardHasB: Array.isArray(rec.rearGuard) && rec.rearGuard.indexOf(allyB) >= 0,
        bHealthBefore: bBefore, bHealthAfter: bAfter,
        log,
      });
    }
    return fights;
  }

  const pilotFights = [];
  for (const v of PILOT_VARIANTS) pilotFights.push(...runVariant(v, PILOT_STREAMS, 'pilot'));
  const fsPilot = pilotFights.filter(f => f.kind === 'FS');
  const shCongPilot = pilotFights.filter(f => f.kind === 'SH' && f.beast === 'congregation');
  const shEaterPilot = pilotFights.filter(f => f.kind === 'SH' && f.beast === 'eater');
  const fsGate = rate(fsPilot, f => f.fromStartJoined);
  const shCongShouts = shCongPilot.reduce((a, f) => a + f.shoutCount, 0);
  const shEaterShouts = shEaterPilot.reduce((a, f) => a + f.shoutCount, 0);
  const shBeast = shCongShouts > 0 ? 'congregation' : (shEaterShouts > 0 ? 'eater' : null);
  const pilotGate = {
    fs_fromStartRate: fsGate,
    sh_congregation_shouts: shCongShouts, sh_eater_shouts: shEaterShouts,
    sh_confirm_beast: shBeast,
  };
  const pilotPassFs = fsGate === 1;
  console.log('PILOT: ' + JSON.stringify(summarize(pilotFights)));
  console.log('PILOT GATE: ' + JSON.stringify(pilotGate) + ' -> FS ' + (pilotPassFs ? 'PASS' : 'FAIL'));
  if (!pilotPassFs) { console.log('PILOT FS GATE FAILED -> stop, no confirm'); process.exit(2); }

  const CONFIRM_VARIANTS = [
    { kind: 'FS', allies: 1, vids: ['A'], beast: 'congregation' },
    { kind: 'FS', allies: 2, vids: ['A'], beast: 'congregation' },
    { kind: 'FS', allies: 2, vids: ['A', 'B'], beast: 'congregation' },
    { kind: 'FS', allies: 3, vids: ['A', 'B'], beast: 'congregation' },
    { kind: 'CORN', allies: 2, vids: ['A', 'B'], beast: 'congregation' },
  ];
  if (shBeast) {
    CONFIRM_VARIANTS.push({ kind: 'SH', allies: 1, vids: ['A'], beast: shBeast });
    CONFIRM_VARIANTS.push({ kind: 'SH', allies: 2, vids: ['A', 'B'], beast: shBeast });
  }
  let confirmFights = [];
  for (const v of CONFIRM_VARIANTS) confirmFights.push(...runVariant(v, CONFIRM_STREAMS, 'confirm'));

  // POST-PASS (descriptor-grounded second-ally detection): the engine
  // names fighters by description in log lines. Read the descriptors off
  // the engine's own lines — leader + ally A from any door line, ally B
  // from a rear-guard line in a fight where A joined (rear = B alone) —
  // then recompute per-fight B-strike / B-charge evidence from the logs.
  // A B strike is any strike line whose actor is neither the leader nor A.
  const allFights = [...pilotFights, ...confirmFights];
  let leaderDesc = null, allyDesc = null, bDesc = null;
  for (const f of allFights) {
    for (const l of f.chargesLines) {
      const dm = l.match(/^(.*) is already at the door — charges in with (.*)!$/);
      if (dm) { allyDesc = dm[1]; leaderDesc = dm[2]; }
    }
  }
  for (const f of allFights) {
    if (f.allyVid === allyA) {
      for (const l of f.log) {
        const rm = l.match(/^(.*) stood the rear through it/);
        if (rm) bDesc = rm[1];
      }
    }
  }
  for (const f of allFights) {
    const strikes = f.log.map(l => { const m = l.match(/^R\d+: (.*) strikes for /); return m ? m[1] : null; }).filter(Boolean);
    f.bStrikeCount = strikes.filter(a => a !== leaderDesc && a !== allyDesc).length;
    f.bStrikeActors = [...new Set(strikes.filter(a => a !== leaderDesc && a !== allyDesc))];
    f.bNamedChargeCount = bDesc ? f.chargesLines.filter(l => l.indexOf(bDesc) >= 0).length : 0;
    f.secondEntered = (f.allyVid === allyB) || f.bNamedChargeCount > 0 || f.bStrikeCount > 0;
  }

  const byVariant = (pred) => confirmFights.filter(pred);
  const fsC1 = byVariant(f => f.kind === 'FS' && f.allies === 1);
  const fsC2 = byVariant(f => f.kind === 'FS' && f.allies === 2 && f.vids.join() === 'A');
  const fsV2 = byVariant(f => f.kind === 'FS' && f.allies === 2 && f.vids.join() === 'A,B');
  const fsV3 = byVariant(f => f.kind === 'FS' && f.allies === 3);
  const cornV2 = byVariant(f => f.kind === 'CORN');
  const shC1 = byVariant(f => f.kind === 'SH' && f.allies === 1);
  const shV2 = byVariant(f => f.kind === 'SH' && f.allies === 2);
  const stripForIdentity = (f) => {
    const c = Object.assign({}, f);
    delete c.stage; delete c.variant; delete c.kind; delete c.allies; delete c.vids;
    return c;
  };
  const identityPairs = [];
  for (const s of CONFIRM_STREAMS) {
    const a = fsC2.find(f => f.stream === s), b = fsV2.find(f => f.stream === s);
    identityPairs.push({ stream: s, identical: JSON.stringify(stripForIdentity(a)) === JSON.stringify(stripForIdentity(b)) });
  }
  const c1Entries = [...fsV2, ...shV2].filter(f => f.secondEntered).length;
  const c1Denom = fsV2.length + shV2.length;
  const shAllyDown = shV2.filter(f => f.allyHpLeft === 0);
  const shAllyDownFollowed = shAllyDown.length; // allyHpLeft==0 means the ally fell during the fight; rounds after are implied by fight continuation to outcome
  const shSecondShouts = shV2.filter(f => f.shoutCount > 1).length;
  const confirm = {
    fsC1: summarize(fsC1), fsC2: summarize(fsC2), fsV2: summarize(fsV2), fsV3: summarize(fsV3),
    cornV2: summarize(cornV2),
    shC1: shC1.length ? summarize(shC1) : null, shV2: shV2.length ? summarize(shV2) : null,
    shBeast,
    c1: { secondEntries: c1Entries, denom: c1Denom, rate: c1Denom ? c1Entries / c1Denom : null },
    c2: { identityPairs, identicalCount: identityPairs.filter(p => p.identical).length, denom: identityPairs.length },
    c3: { maxShouts: shV2.length ? Math.max(...shV2.map(f => f.shoutCount)) : null,
      secondShoutFights: shSecondShouts, allyDownFights: shAllyDownFollowed,
      allyDownSecondShouts: shAllyDown.filter(f => f.shoutCount > 1).length },
    countChannel: { fsC2_vs_fsC1_diffStreams: CONFIRM_STREAMS.filter(s => {
      const a = fsC1.find(f => f.stream === s), b = fsC2.find(f => f.stream === s);
      return JSON.stringify(stripForIdentity(a)) !== JSON.stringify(stripForIdentity(b));
    }) },
    countPastVids: { fsV3_vs_fsV2_diffStreams: CONFIRM_STREAMS.filter(s => {
      const a = fsV2.find(f => f.stream === s), b = fsV3.find(f => f.stream === s);
      return JSON.stringify(stripForIdentity(a)) !== JSON.stringify(stripForIdentity(b));
    }) },
    verdict: null,
  };
  const c1Pass = c1Entries === 0;
  const c2Pass = confirm.c2.identicalCount === confirm.c2.denom;
  const c3Pass = shV2.length === 0 || (confirm.c3.maxShouts <= 1 && confirm.c3.allyDownSecondShouts === 0);
  confirm.verdict = (c1Pass && c2Pass && c3Pass) ? 'CLAIM-CONFIRMED' : 'CLAIM-REFUTED-OR-QUALIFIED';
  confirm.judges = { c1_secondEntryZero: c1Pass, c2_identity12of12: c2Pass, c3_shoutOnce: c3Pass,
    shObserved: shV2.length > 0 };
  console.log('CONFIRM: ' + JSON.stringify(confirm));

  const perVariant = {};
  for (const f of [...pilotFights, ...confirmFights]) {
    const k = f.stage + ':' + f.variant;
    perVariant[k] = perVariant[k] || { stage: f.stage, variant: f.variant, n: 0, fights: [] };
    perVariant[k].fights.push(f);
  }
  for (const k of Object.keys(perVariant)) {
    const p = perVariant[k], s = summarize(p.fights);
    perVariant[k] = { stage: p.stage, variant: p.variant, n: p.fights.length, summary: s };
  }

  const out = {
    arm: 'sim-allycap-a', anchorCommit: anchor, harnessSeed: 4242,
    leader: leaderVid, allyA, allyB, leaderDesc, allyDesc, bDesc, fighterInfo,
    pilotGate, pilotPassFs, shBeast,
    confirm, confirmVerdict: confirm.verdict, perVariant,
    fights: [...pilotFights, ...confirmFights],
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('WROTE ' + outPath + ' fights=' + out.fights.length + ' verdict=' + confirm.verdict);
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
