#!/usr/bin/env node
// sighit-a-fixture-20261031.js — sim-sighit-a forced-meeting fixture band.
// MEASUREMENT ONLY. No game code is changed by this script; it only calls
// the real Game.fieldFight through the sim harness, plus a process-local
// wrapper around Game.sigW4FieldMonster for the NOSIG leg (the wrapper
// still calls the original — same RNG draws, same side effects incl.
// audit tax and sig narration — but returns the pre-signature total).
// See evidence/2026-10-31/sim-sighit-a-prereg.md for the design.
//
// Usage:
//   node scripts/sighit-a-fixture-20261031.js [outPath]
// Default out: evidence/2026-10-31/perseed-sighit-a/fixture-band.json
// The file contains NO timestamps or timings, so two runs on the same
// base are byte-comparable (the determinism gate in the prereg).
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

// P2-BOW, exactly the spearxbow-a BOW tier: leader machete + crude_bow
// + 8 arrows + hide_armor; ally unarmed, from-start (co-presence).
const GEAR = [{ itemId: 'machete', units: 1 }, { itemId: 'crude_bow', units: 1 }, { itemId: 'arrow', units: 8 }, { itemId: 'hide_armor', units: 1 }];
const BEASTS = [
  { id: 'congregation', hpMid: 1000, speed: 2, pierce: 0.3 },
  { id: 'eater', hpMid: 1050, speed: 4, pierce: 0.35 },
  { id: 'audit', hpMid: 1200, speed: 2, pierce: 0.4 },
  { id: 'suburb', hpMid: 1400, speed: 1, pierce: 0.2 },
];
const PILOT_STREAMS = [101, 102, 103, 104, 105, 106, 107, 108];
const CONFIRM_STREAMS = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212];
const LEGS = ['MAIN', 'NOSIG'];

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
    medianRounds: median(fights.map(f => f.rounds)),
    meanRounds: mean(fights.map(f => f.rounds)),
    medianTotalDmg: median(fights.map(f => f.totalDmg)),
    medianDpr: median(fights.filter(f => f.rounds > 0).map(f => f.dpr)),
    outcomes,
    vDieRate: rate(fights, f => f.outcome === 'vDie'),
    allyDownRate: rate(fights, f => f.allyDown),
    fromStartRate: rate(fights, f => f.fromStartJoined),
    medianVHpLeft: median(fights.map(f => f.vHpLeft)),
    medianAllyHpLeft: median(fights.map(f => f.allyHpLeft)),
    medianVTaken: median(fights.map(f => f.vTaken)),
    medianAllyTaken: median(fights.map(f => f.allyTaken)),
    medianVolleyDmg: median(fights.map(f => f.volleyDmg === null ? 0 : f.volleyDmg)),
  };
}

async function main() {
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-sighit-a', 'fixture-band.json');
  let anchor = 'unknown';
  try { anchor = execSync('git log -1 --format=%H -- src/', { cwd: REPO }).toString().trim(); } catch (e) {}
  const { Game, loadFails } = await loadGame({ seed: 4242, mode: 'sighit-a-fixture' });
  if (loadFails && loadFails.length) { console.error('LOAD FAILS: ' + loadFails.join('; ')); process.exit(1); }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 2) { console.error('NEED 2 NPC ROSTER, HAVE ' + roster.length); process.exit(1); }
  const leaderVid = roster.indexOf('boris_kowalski') >= 0 ? 'boris_kowalski' : roster[0];
  const allyVid = roster.filter(id => id !== leaderVid)[0];
  const staged = [leaderVid, allyVid];
  const vpOf = (vid) => (Game.data.villagers || []).find(v => v.id === vid) || {};
  const heldAb = (vid) => { try { return Game.npcOwnedIds ? Game.npcOwnedIds(vid) : []; } catch (e) { return []; } };
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  for (const b of BEASTS) if (!mdef(b.id)) { console.error('MISSING MONSTER DEF: ' + b.id); process.exit(1); }
  for (const it of GEAR) {
    if (!(Game.data.items || []).some(i => i.id === it.itemId)) { console.error('MISSING ITEM DEF: ' + it.itemId); process.exit(1); }
  }
  if (typeof Game.sigW4FieldMonster !== 'function') { console.error('NO Game.sigW4FieldMonster TO WRAP'); process.exit(1); }
  const baseBand = {};
  for (const b of BEASTS) {
    baseBand[b.id] = {};
    for (const a of (mdef(b.id).attacks || [])) if (a.name && a.damage) baseBand[b.id][a.name] = a.damage;
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
    fighterInfo[vid] = { age: 35, temperament: 'steady', health: 100, heldAbilities: heldAb(vid),
      speed: (Game.villagerSpeed ? Game.villagerSpeed(vid) : null) };
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
    leader.items = JSON.parse(JSON.stringify(GEAR));
    try { delete leader.equipped; } catch (e) {}
    const ap = vpOf(allyVid);
    ap.items = [];
    try { ap.equipped = {}; } catch (e) {}
  }

  let hitCalls = [];
  const origSigW4 = Game.sigW4FieldMonster.bind(Game);
  let nosigActive = false;
  Game.sigW4FieldMonster = function (md, rec, ctx) {
    const incoming = (ctx && typeof ctx.total === 'number') ? ctx.total : 0;
    const ret = origSigW4(md, rec, ctx);
    hitCalls.push({ round: (ctx && ctx.round) || null, incoming, returned: ret, delta: ret - incoming });
    return nosigActive ? incoming : ret;
  };

  function isSigAddRound(beast, round) {
    if (beast === 'congregation') return round % 3 === 1;
    if (beast === 'eater') return true;
    if (beast === 'suburb') return round % 2 === 1;
    if (beast === 'audit') return false;
    return false;
  }

  function runFight(beast, leg, stream) {
    const b = BEASTS.find(x => x.id === beast);
    resetFighters();
    hitCalls = [];
    nosigActive = (leg === 'NOSIG');
    const m = { hp: b.hpMid, maxHp: b.hpMid };
    const opts = { rng: mulberry32(stream), allies: 1, allyVids: [allyVid], allyFromStart: true };
    let rec;
    try { rec = Game.fieldFight(leaderVid, mdef(beast), m, opts); }
    catch (e) { console.error('FIGHT THREW ' + beast + '/' + leg + '/' + stream + ': ' + e.message); process.exit(1); }
    nosigActive = false;
    const log = Array.isArray(rec.log) ? rec.log.slice() : [];
    const logText = log.join('\n');
    let allyName = null;
    const door = logText.match(/^(.*?) is already at the door/m);
    if (door) allyName = door[1];
    const hitLines = [];
    const hitRe = /^R(\d+): (.+?) hits (.+?) for (\d+) \((\d+) left\)$/;
    for (const line of log) {
      const mm = line.match(hitRe);
      if (mm) hitLines.push({ round: +mm[1], attack: mm[2], targetName: mm[3], dmg: +mm[4], hpLeft: +mm[5] });
    }
    const hits = hitLines.map((hl, i) => {
      const call = hitCalls[i] || null;
      const band = (baseBand[beast][hl.attack] || null);
      return {
        round: hl.round, attack: hl.attack, targetName: hl.targetName,
        target: (allyName && hl.targetName === allyName) ? 'ally' : 'leader',
        finalDmg: hl.dmg, hpLeftAfter: hl.hpLeft,
        preSig: call ? call.incoming : null, postSig: call ? call.returned : null,
        sigDelta: call ? call.delta : null,
        baseBand: band,
        baseBandTop: band ? band[1] : null,
        preSigInBand: band ? (call && call.incoming >= band[0] && call.incoming <= band[1]) : null,
        postSigAboveBandTop: band ? (call && call.returned > band[1]) : null,
        sigAddRound: isSigAddRound(beast, hl.round),
        wrapperMatched: !!call,
      };
    });
    const vol = rec.volley || null;
    const volDmg = vol ? (vol.dmg || 0) : null;
    const allyDealt = rec.allyDealt || 0;
    const total = rec.mDealt || 0;
    const sigSum = hits.reduce((a, h) => a + (h.sigDelta || 0), 0);
    const preSum = hits.reduce((a, h) => a + (h.preSig || 0), 0);
    return {
      beast, leg, stream, beastStartHp: b.hpMid, beastSpeed: b.speed, beastPierce: b.pierce,
      volleyShots: vol ? (vol.shots || 0) : null, volleyDmg: volDmg,
      totalDmg: total, leaderDealt: total - (volDmg || 0) - allyDealt, allyDealt,
      rounds: rec.rounds !== undefined ? rec.rounds : null,
      dpr: (rec.rounds > 0) ? total / rec.rounds : null,
      outcome: rec.outcome || 'unresolved', intent: rec.intent || null,
      fromStartJoined: logText.indexOf('already at the door') >= 0,
      vTaken: rec.vTaken !== undefined ? rec.vTaken : null, vHpLeft: rec.vHpLeft !== undefined ? rec.vHpLeft : null,
      allyTaken: rec.allyTaken !== undefined ? rec.allyTaken : null, allyHpLeft: rec.allyHpLeft !== undefined ? rec.allyHpLeft : null,
      allyDown: rec.allyHpLeft !== undefined ? rec.allyHpLeft === 0 : null,
      mHpLeft: rec.mHpLeft !== undefined ? rec.mHpLeft : null,
      wrapperCalls: hitCalls.length, hitLines: hitLines.length,
      wrapperMatchedAll: hits.length > 0 && hits.every(h => h.wrapperMatched) && hitCalls.length === hitLines.length,
      hits, sigSum, preSum,
      sigShare: (preSum + sigSum) > 0 ? sigSum / (preSum + sigSum) : null,
      log,
    };
  }

  function runBand(streams, stage) {
    const fights = [];
    for (const beast of BEASTS.map(b => b.id)) for (const leg of LEGS) for (const s of streams) {
      fights.push({ stage, ...runFight(beast, leg, s) });
    }
    return fights;
  }

  const pilotFights = runBand(PILOT_STREAMS, 'pilot');
  const p1 = rate(pilotFights, f => f.fromStartJoined);
  const p2 = rate(pilotFights, f => f.wrapperMatchedAll);
  const hitsByBeast = {};
  for (const f of pilotFights.filter(f => f.leg === 'MAIN')) {
    (hitsByBeast[f.beast] = hitsByBeast[f.beast] || []).push(...f.hits);
  }
  const p3 = {};
  for (const beast of BEASTS.map(b => b.id)) {
    const hs = hitsByBeast[beast] || [];
    const add = hs.filter(h => h.sigAddRound);
    if (beast === 'audit') p3[beast] = rate(hs, h => h.sigDelta === 0);
    else p3[beast] = rate(add, h => h.sigDelta > 0);
  }
  const pilotGate = { p1_fromStartRate: p1, p2_wrapperMatchedRate: p2, p3_sigAdd: p3 };
  const pilotPass = p1 >= 0.9 && p2 === 1 && p3.congregation >= 0.9 && p3.eater >= 0.9 && p3.suburb >= 0.9 && p3.audit === 1;
  console.log('PILOT: ' + JSON.stringify(summarize(pilotFights)));
  console.log('PILOT GATE: ' + JSON.stringify(pilotGate) + ' -> ' + (pilotPass ? 'PASS -> confirm' : 'FAIL -> stop, no confirm'));

  let confirmFights = [], confirm = null, verdict = null;
  if (pilotPass) {
    confirmFights = runBand(CONFIRM_STREAMS, 'confirm');
    const pairs = [];
    for (const beast of BEASTS.map(b => b.id)) for (const s of CONFIRM_STREAMS) {
      const mn = confirmFights.find(f => f.beast === beast && f.leg === 'MAIN' && f.stream === s);
      const ns = confirmFights.find(f => f.beast === beast && f.leg === 'NOSIG' && f.stream === s);
      if (mn && ns) pairs.push({ beast, stream: s, mainRounds: mn.rounds, nosigRounds: ns.rounds, dRounds: ns.rounds - mn.rounds, mainVHp: mn.vHpLeft, nosigVHp: ns.vHpLeft, dVHp: ns.vHpLeft - mn.vHpLeft, mainOutcome: mn.outcome, nosigOutcome: ns.outcome });
    }
    const mainC = confirmFights.filter(f => f.leg === 'MAIN');
    const nosigC = confirmFights.filter(f => f.leg === 'NOSIG');
    const mainSum = summarize(mainC), nosigSum = summarize(nosigC);
    const r1 = nosigSum.medianRounds >= mainSum.medianRounds + 1;
    const r2 = mean(pairs.map(p => p.dRounds)) >= 0.5;
    const r3 = nosigSum.medianVHpLeft >= mainSum.medianVHpLeft + 10;
    const perBeast = {};
    for (const beast of BEASTS.map(b => b.id)) {
      const bp = pairs.filter(p => p.beast === beast);
      const bm = mainC.filter(f => f.beast === beast), bn = nosigC.filter(f => f.beast === beast);
      perBeast[beast] = {
        medianRoundsMain: median(bm.map(f => f.rounds)), medianRoundsNosig: median(bn.map(f => f.rounds)),
        meanPairedDRounds: mean(bp.map(p => p.dRounds)),
        medianVHpMain: median(bm.map(f => f.vHpLeft)), medianVHpNosig: median(bn.map(f => f.vHpLeft)),
        outcomesMain: summarize(bm).outcomes, outcomesNosig: summarize(bn).outcomes,
        roundCapped: (median(bn.map(f => f.rounds)) >= median(bm.map(f => f.rounds)) + 1) && (mean(bp.map(p => p.dRounds)) >= 0.5),
      };
    }
    confirm = { main: mainSum, nosig: nosigSum, pairs,
      r1_medianRoundsPlus1: r1, r2_meanPairedDRoundsGe05: r2, r3_medianVHpPlus10: r3,
      meanPairedDRounds: mean(pairs.map(p => p.dRounds)), perBeast };
    verdict = (r1 && r2 && r3) ? 'DIAG-GO' : 'DIAG-NO-GO';
    console.log('CONFIRM: ' + JSON.stringify({ main: mainSum, nosig: nosigSum, r1, r2, r3, meanPairedDRounds: confirm.meanPairedDRounds, perBeast }));
  } else {
    verdict = 'KILLED-AT-PILOT';
  }

  const perBeastLegHits = {};
  for (const f of confirmFights) {
    const k = f.beast + ':' + f.leg;
    (perBeastLegHits[k] = perBeastLegHits[k] || []).push(...f.hits);
  }
  const hitSummary = {};
  for (const k of Object.keys(perBeastLegHits)) {
    const hs = perBeastLegHits[k];
    hitSummary[k] = {
      nHits: hs.length,
      medianPreSig: median(hs.map(h => h.preSig)), medianSigDelta: median(hs.map(h => h.sigDelta)),
      medianPostSig: median(hs.map(h => h.postSig)), medianFinalDmg: median(hs.map(h => h.finalDmg)),
      rangePreSig: hs.length ? [Math.min(...hs.map(h => h.preSig)), Math.max(...hs.map(h => h.preSig))] : null,
      rangeSigDelta: hs.length ? [Math.min(...hs.map(h => h.sigDelta)), Math.max(...hs.map(h => h.sigDelta))] : null,
      rangePostSig: hs.length ? [Math.min(...hs.map(h => h.postSig)), Math.max(...hs.map(h => h.postSig))] : null,
      shareSigDeltaPos: rate(hs, h => h.sigDelta > 0),
      sharePostSigAboveBandTop: rate(hs, h => h.postSigAboveBandTop === true),
      sharePreSigInBand: rate(hs, h => h.preSigInBand === true),
      shareLeader: rate(hs, h => h.target === 'leader'),
      medianSigDeltaLeader: median(hs.filter(h => h.target === 'leader').map(h => h.sigDelta)),
      medianSigDeltaAlly: median(hs.filter(h => h.target === 'ally').map(h => h.sigDelta)),
      medianSigShareFight: median(confirmFights.filter(f => (f.beast + ':' + f.leg) === k).map(f => f.sigShare)),
    };
  }
  const r1Summary = {};
  for (const beast of BEASTS.map(b => b.id)) {
    const hs = confirmFights.filter(f => f.beast === beast && f.leg === 'MAIN').flatMap(f => f.hits.filter(h => h.round === 1));
    r1Summary[beast] = {
      n: hs.length,
      medianPreSig: median(hs.map(h => h.preSig)), medianSigDelta: median(hs.map(h => h.sigDelta)),
      medianPostSig: median(hs.map(h => h.postSig)), medianFinalDmg: median(hs.map(h => h.finalDmg)),
      rangePostSig: hs.length ? [Math.min(...hs.map(h => h.postSig)), Math.max(...hs.map(h => h.postSig))] : null,
      sharePostSigAboveBandTop: rate(hs, h => h.postSigAboveBandTop === true),
      attacks: (() => { const o = {}; for (const h of hs) o[h.attack] = (o[h.attack] || 0) + 1; return o; })(),
    };
  }

  // COMPACT mode (flap mitigation, 2026-10-31): when SIGHIT_COMPACT=1,
  // keep the full log only for the first MAIN confirm fight per beast
  // (the four sense-testing transcripts) and drop the other fights'
  // logs from the stored corpus. Every judged field (hits, rounds,
  // outcomes, HP, volley, sig sums) is intact; only redundant log
  // text is trimmed, because the EPERM flap will not land a ~300KB
  // file write in this worktree at all. The fixture still GENERATES
  // the full logs; compaction is storage-only, documented in evidence.
  let storedFights = [...pilotFights, ...confirmFights];
  if (process.env.SIGHIT_COMPACT === '1') {
    const kept = new Set();
    storedFights = storedFights.map(f => {
      const key = f.beast;
      if (f.stage === 'confirm' && f.leg === 'MAIN' && !kept.has(key)) { kept.add(key); return f; }
      return { ...f, log: [] };
    });
  }
  const out = {
    arm: 'sim-sighit-a', anchorCommit: anchor, harnessSeed: 4242,
    leader: leaderVid, ally: allyVid, fighterInfo,
    pilotGate, pilotPass,
    confirm, confirmVerdict: verdict, hitSummary, r1Summary,
    fights: storedFights,
  };
  if (process.env.SIGHIT_OUT === 'stdout') {
    console.log(JSON.stringify(out, null, 1));
    console.log('WROTE stdout fights=' + out.fights.length + ' verdict=' + verdict);
    return;
  }
  if (process.env.SIGHIT_SUMMARY_OUT === 'stdout') {
    // Flap-safe summary corpus: all judged fields + the four kept
    // transcripts, no per-fight array (which is what makes the full
    // corpus ~230KB and unwritable through the EPERM flap). Requires
    // SIGHIT_COMPACT=1 so transcripts are exactly the four kept fights.
    const summary = {
      arm: out.arm, anchorCommit: out.anchorCommit, harnessSeed: out.harnessSeed,
      leader: out.leader, ally: out.ally, fighterInfo: out.fighterInfo,
      pilotGate: out.pilotGate, pilotPass: out.pilotPass,
      confirm: out.confirm, confirmVerdict: out.confirmVerdict,
      hitSummary: out.hitSummary, r1Summary: out.r1Summary,
      compactSummary: true,
      note: 'Summary corpus: per-fight array omitted because the EPERM flap blocked every ~230KB file write in this worktree; all judged fields (pairs, medians, hit summaries, round-1 summaries) and the four sense-testing transcripts are intact. Re-run scripts/sighit-a-fixture-20261031.js to regenerate the full corpus.',
      transcripts: storedFights.filter(f => f.log && f.log.length > 0),
    };
    console.log(JSON.stringify(summary, null, 1));
    console.log('WROTE summary-stdout transcripts=' + summary.transcripts.length + ' verdict=' + verdict);
    return;
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // EPERM-flap-tolerant chunked write: this box intermittently denies
  // write(2) with EPERM for minutes at a time, which truncates a single
  // writeFileSync into a 0-byte file. Write in 16KB chunks, retrying
  // each chunk (with sleep) until it lands, then verify by re-reading
  // and parsing the file before reporting success.
  (function writeChunkedRetry(file, text) {
    const CH = 16384;
    let fd;
    for (let attempt = 0; attempt < 5; attempt++) {
      try { fd = fs.openSync(file, 'w'); break; }
      catch (e) { if (e.code !== 'EPERM' || attempt === 4) throw e; try { execSync('sleep 10'); } catch (_) {} }
    }
    try {
      let off = 0;
      while (off < text.length) {
        let end = Math.min(text.length, off + CH);
        // Never split a surrogate pair at the chunk boundary.
        if (end < text.length && text.charCodeAt(end - 1) >= 0xD800 && text.charCodeAt(end - 1) <= 0xDBFF) end += 1;
        const chunk = Buffer.from(text.slice(off, end), 'utf8');
        const adv = end - off;
        let done = false;
        for (let attempt = 0; attempt < 240 && !done; attempt++) {
          try { let w = 0; while (w < chunk.length) w += fs.writeSync(fd, chunk, w, chunk.length - w); done = true; }
          catch (e) { if (e.code !== 'EPERM') throw e; try { execSync('sleep 2'); } catch (_) {} }
        }
        if (!done) throw new Error('chunk write never landed after retries at offset ' + off);
        off += adv;
      }
      fs.fsyncSync(fd);
    } finally { try { fs.closeSync(fd); } catch (_) {} }
    const back = fs.readFileSync(file, 'utf8');
    if (back !== text) throw new Error('corpus verify mismatch: wrote ' + text.length + ' chars, read back ' + back.length);
    JSON.parse(back);
  })(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('WROTE ' + outPath + ' fights=' + out.fights.length + ' verdict=' + verdict);
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
