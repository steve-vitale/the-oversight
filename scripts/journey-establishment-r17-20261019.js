#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R17 — THE WILD SURFACING RATE
// (2026-10-19). Rotation index 1 (establishment). Base: journey-establishment-r16.
//
// Pre-registered in hidden_files/evidence/2026-10-19/journey-establishment-r17-note.md:
//   Seeds: 61, 82, 103, 124, 901, 902. Horizon: 42 game-days (+2 buffer).
//   Policy: competent PINNED.
//   Binding metrics (a miss is NO-GO, never re-scored mid-run):
//     M1 (wild surfacing rate): >=8 contest-aired events across the 6 seeds;
//        rate = contests with >=1 NAMED gossip line within 3d of airing / aired.
//        GO if >=25%; NO-GO if <10% (loss breakdown => concrete lever proposal,
//        NOT landed — gossip weighting is Steve's call per r16).
//     M2 (r16 fixes hold): atom <=500 ALL seeds; records ZERO placeholders;
//        ZERO null renders in held convos — all GO required.
//     M3 (people): >=6 full transcripts sense-read, 0 senseless.
//   Guardrails: no softlock (day 42 all seeds); starvation deaths with cause;
//     wave-2 gate respected (day 8 + 5 wave-1 ledger points); death-aware stop.
// Usage: SEEDS=61 node scripts/journey-establishment-r17-20261019.js   (one process per seed)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-19';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124, 901, 902]);
const DAYS = parseInt(process.env.DAYS || '42', 10);

// warn-once helper: no silent swallows in new instrumentation
const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r17:' + key + ']', (e && e.message) || e);
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function pantryUnitAtom(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((m, i) => Math.max(m, (i.kcalEach || 0)), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function fanClubs(Game) {
  try { const fc = (Game.apState ? Game.apState() : {}).fanClubs || {}; return { fight: fc.fight || 0, survival: fc.survival || 0, social: fc.social || 0, showbiz: fc.showbiz || 0 }; }
  catch (e) { return { fight: 0, survival: 0, social: 0, showbiz: 0 }; }
}
function scholarTrauma(Game) {
  try { return (Game.state.scholar || {}).trauma || 0; } catch (e) { return 0; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function teleStream(Game) {
  try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; }
}
// NOTE (r15): Game.tele() merges the data payload into the top-level event
// object — there is no t.data. Read prize fields straight off the event.
function teleFields(t) {
  const out = {};
  if (!t) return out;
  for (const k of ['id', 'tier', 'to', 'ids', 'plant', 'item', 'gain', 'bond', 'who', 'contest', 'attempt', 'for']) {
    if (t[k] !== undefined) out[k] = t[k];
  }
  return out;
}
function plantKnown(Game, pid) {
  try { return Game.plantKnown ? Game.plantKnown(pid) : false; } catch (e) { return false; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('policy.setup', e); } }

  // ---- instrumentation ----
  const dayLines = {}; // day -> [say lines] (ALL days, for repeat + memory scans)
  const arenaFights = [];
  const fires = []; // {day, cid, name, cat, risk, pilot, eligible n, ineligible n, takenIds}
  let pilotDay = null;
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const d = nowDay(Game);
      let elig = { eligible: [], ineligible: [], reason: null };
      try { elig = Game.contestEligible() || elig; } catch (e) { warnOnce('contestEligible', e); }
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try {
        fires.push({
          day: d, cid: (contest && contest.id) || '?',
          name: (contest && contest.name) || null,
          cat: (contest && contest.cat) || '?', risk: (contest && contest.risk) || '?',
          pilot: !wasPilotAired,
          eligibleN: (elig.eligible || []).length, ineligibleN: (elig.ineligible || []).length,
          takenIds: ((Game.state.activeContest || {}).participants || []).slice(),
        });
        if (!wasPilotAired && Game.state.pilotAired && pilotDay === null) pilotDay = d;
      } catch (e) { warnOnce('fires', e); }
      return r;
    };
  }
  const _tbEnd = Game.tbEnd ? Game.tbEnd.bind(Game) : null;
  if (_tbEnd) {
    Game.tbEnd = function (...a) {
      try {
        const ac = Game.state.activeContest;
        if (ac && ac.arenaSuspended && Game.tbfight) {
          arenaFights.push({ day: nowDay(Game), cid: ac.contestId, rounds: Game.tbfight.round || 0 });
        }
      } catch (e) { warnOnce('tbEnd', e); }
      return _tbEnd(...a);
    };
  }
  // contest end snapshots
  const contests = []; // {day, cid, name, outcome, participants, playerTaken, fanBefore, traumaBefore, pantryBefore}
  const _tele0 = Game.tele;
  Game.tele = function (type, data) {
    const r = _tele0.apply(this, arguments);
    try {
      if (type === 'contest_end') {
        const ac = Game.state.activeContest;
        contests.push({
          day: nowDay(Game), cid: (data && data.id) || '?', outcome: (data && data.outcome) || '?',
          participants: ac ? ((ac.participants || []).slice()) : [],
          playerTaken: ac ? (ac.participants || []).indexOf('player') >= 0 : false,
          fanBefore: fanClubs(Game), traumaBefore: scholarTrauma(Game),
        });
      }
    } catch (e) { warnOnce('tele.contest_end', e); }
    return r;
  };

  const waveDay = {};
  // ---- r17: wild surfacing-rate probe ----
  // Contest gossip decays after 3 days by design, so every aired contest gets
  // a probe on EACH day of [c.day, c.day+2] while the entry is fresh: for each
  // living teller who heard a contest_* entry, call the ask:gossip handler
  // directly (same small perturbation as r16's probe) and classify what
  // surfaced from the handler's return shape — 'contest' (named), 'dark',
  // 'npcAbout', 'aboutOther', 'scandal', 'fresh-other', 'none'. A contest is
  // SURFACED if any probe in its window renders a line naming the contest.
  // Losses = entry available (heard + fresh) but another branch surfaced.
  const gossipProbeLines = []; // {day, contest, teller, entryAvailable, surfacedType, namesContest, line}
  const lossByType = {}; // surfacedType -> count (only when entryAvailable && not contest)
  const contestNames = new Set();
  function isContestGossip(g) {
    return g && /^contest_(won|survived|died)$/.test(g.action || '');
  }
  function gossipProbe(Game, contests) {
    const gd = nowDay(Game);
    for (const c of contests) {
      if (gd < c.day || gd > c.day + 2) continue;
      const f = (fires || []).filter(x => x.cid === c.cid && x.day <= c.day).pop() || (fires || []).find(x => x.cid === c.cid);
      const cname = f ? f.name : null;
      if (!cname) continue;
      contestNames.add(cname);
      try {
        const vg = (Game.state.village || {}).gossip || [];
        const entries = vg.filter(g => isContestGossip(g) && (gd - (g.day || 0)) <= 3);
        if (!entries.length) continue;
        const livingIds = new Set(livingVids(Game).map(id => String(id)));
        const tellers = [];
        for (const e of entries) {
          for (const t of (e.heard || [])) {
            if (livingIds.has(String(t)) && tellers.indexOf(t) < 0) tellers.push(t);
          }
        }
        if (!tellers.length) continue;
        for (const teller of tellers) {
          const entryAvailable = entries.some(e => (e.heard || []).indexOf(teller) >= 0);
          const captured = [];
          const _say = Game.say;
          Game.say = function (...a) { try { captured.push(String(a[0] == null ? '' : a[0])); } catch (e) {} };
          let ret = null;
          try { ret = Game.askAbout(teller, 'gossip'); } catch (e) { warnOnce('probe.ask', e); } finally { Game.say = _say; }
          const line = captured.join(' | ').slice(0, 220);
          const namesContest = Array.from(contestNames).concat([cname]).some(n => n && line.indexOf(n) >= 0);
          let surfacedType = 'none';
          if (ret) {
            if (ret.darkGossip) surfacedType = 'dark';
            else if (ret.gossipAbout) surfacedType = 'npcAbout';
            else if (ret.gossip && /^contest_(won|survived|died)$/.test((ret.gossip.action || ''))) surfacedType = 'contest';
            else if (ret.aboutOther) surfacedType = 'aboutOther';
            else if (ret.gossip && /About you/.test(line)) surfacedType = 'scandal';
            else if (ret.gossip) surfacedType = 'fresh-other';
          }
          gossipProbeLines.push({ day: gd, contest: cname, teller, entryAvailable,
            surfacedType, namesContest, line });
          if (entryAvailable && surfacedType !== 'contest') {
            lossByType[surfacedType] = (lossByType[surfacedType] || 0) + 1;
          }
        }
      } catch (e) { warnOnce('probe', e); }
    }
  }
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    try { gossipProbe(Game, contests); } catch (e) { warnOnce('gossipProbe', e); }
    try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests3', e); }
    if (Game.over) break;
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      const gd = nowDay(Game);
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }

  // ---- end-of-run capture ----
  const tele = teleStream(Game);
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  }
  // resolve contest names onto contest_end records
  for (const c of contests) {
    const f = fires.filter(x => x.cid === c.cid && x.day <= c.day).pop() || fires.find(x => x.cid === c.cid);
    c.name = f ? f.name : null;
    c.participantNames = (c.participants || []).map(p => nameOf(Game, p));
  }
  const fanEnd = fanClubs(Game);

  // ---- M4: records champion lines, byte-honest (node string ops, no display pipeline) ----
  let recordsLines = [];
  try {
    const RR = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.RunRecords) || null;
    if (RR) recordsLines = RR.publicLines(Game) || [];
  } catch (e) { warnOnce('publicLines', e); }
  const championLines = recordsLines.filter(l => (l.id || '').indexOf('champion_') === 0);
  const fbWho = [], fbContest = [];
  for (const l of championLines) {
    const tx = l.text || '';
    if (/the Bearer/.test(tx)) fbWho.push({ day: l.day, text: tx });
    if (/won a contest\b/.test(tx)) fbContest.push({ day: l.day, text: tx });
  }
  // literal-corruption check: does the file bytes contain "<redacted>"? (node-side, exact)
  let recordsFileCorrupt = false;
  try {
    const rb = fs.readFileSync(path.join(ROOT, 'src/js/records.js'), 'utf8');
    recordsFileCorrupt = rb.indexOf('<redacted>') >= 0;
  } catch (e) { warnOnce('recordsFileRead', e); }

  // ---- M1 (r17): wild surfacing rate ----
  // Per aired contest: surfaced if >=1 probe in [c.day, c.day+2] rendered a
  // line naming the contest. Rate = surfaced / aired. Pre-registered bands:
  // GO >=25%, NO-GO <10% (10-25% => metric review: expand).
  const airedContests = [];
  for (const c of contests) {
    const f = fires.filter(x => x.cid === c.cid && x.day <= c.day).pop() || fires.find(x => x.cid === c.cid);
    const cname = f ? f.name : null;
    if (!cname) continue;
    const probes = gossipProbeLines.filter(pl => pl.contest === cname);
    const surfaced = probes.filter(pl => pl.surfacedType === 'contest' && pl.namesContest);
    airedContests.push({ name: cname, day: c.day, outcome: c.outcome, probes: probes.length,
      surfaced: surfaced.length > 0, surfacedDays: surfaced.map(s => s.day),
      samples: surfaced.slice(0, 2).map(s => s.line) });
  }
  const m1rate = airedContests.length ? airedContests.filter(c => c.surfaced).length / airedContests.length : 0;
  const m1verdict = m1rate >= 0.25 ? 'GO' : (m1rate < 0.10 ? 'NO-GO' : 'METRIC-REVIEW');
  const m1 = { aired: airedContests.length, surfaced: airedContests.filter(c => c.surfaced).length,
    rate: Math.round(m1rate * 1000) / 1000, verdict: m1verdict,
    lossByType, contests: airedContests.map(c => ({ name: c.name, day: c.day, surfaced: c.surfaced })) };

  // ---- M1: named-contestant fan lines ----
  const fanLines = []; // SYS favor lines naming a contestant
  const contestantNames = new Set();
  for (const c of contests) for (const n of (c.participantNames || [])) contestantNames.add(n);
  for (let d = 1; d <= DAYS + 2; d++) {
    for (const l of (dayLines[d] || [])) {
      if (/your (fight|survival|moot|showbiz) fans/.test(l) && /won/.test(l)) {
        fanLines.push({ day: d, line: l.slice(0, 220) });
      }
    }
  }
  const namedFanLines = fanLines.filter(fl => {
    // r16: the player-win favor line now reads "You won X on camera" — the
    // player IS a named champion. Villager wins name the contestant.
    if (/You won /.test(fl.line)) return true;
    for (const n of contestantNames) { if (n && n !== 'You' && fl.line.indexOf(n) >= 0) return true; }
    return false;
  });
  const membershipTotal = fanEnd.fight + fanEnd.survival + fanEnd.social + fanEnd.showbiz;
  const fanm1 = { membershipTotal, fanEnd, namedFanLines: namedFanLines.length,
    verdict: (membershipTotal > 0 && namedFanLines.length >= 1) ? 'GO' : 'NO-GO' };
  // r17: fan naming is observed, non-binding (r16 proved the leg); the binding
  // metric this run is the gossip surfacing rate (m1, above).

  // ---- prizes (r16: observed, non-binding — r15 proved this leg) ----
  const prizes = []; // {contest, day, kind, id, recipient, landed, stateChange, stateKind}
  const endInv = (() => { try { return (Game.state.scholar || {}).inventory || []; } catch (e) { return []; } })();
  const endInvIds = new Set(endInv.map(i => i.itemId || i.id));
  const scholarAbils = (() => { try { return ((Game.state.scholar || {}).abilities || []).map(a => (a && a.id) || a); } catch (e) { return []; } })();
  const grantedAbils = new Set();
  for (const t of tele) {
    if (t && t.type === 'ability_granted') {
      const f = teleFields(t);
      if (f.who === 'player') grantedAbils.add(f.id);
    }
  }
  const pantryNames = (() => { try { return ((Game.state.village || {}).pantry || []).map(i => i.name); } catch (e) { return []; } })();
  function nearestContest(day) {
    let best = null;
    for (const c of contests) { if (Math.abs(c.day - day) <= 2 && (!best || Math.abs(c.day - day) < Math.abs(best.day - day))) best = c; }
    return best;
  }
  for (const t of tele) {
    if (!t || t.day == null) continue;
    const d = teleFields(t);
    if (t.type === 'loot_dropped' && d.to === 'player') {
      const itemId = d.id;
      const c = nearestContest(t.day);
      const held = endInvIds.has(itemId);
      let used = false, useLine = null;
      for (let dd = t.day; dd <= DAYS + 2 && !used; dd++) {
        for (const l of (dayLines[dd] || [])) {
          if (/✨ Now you understand it/.test(l)) { used = true; useLine = l.slice(0, 140); break; }
        }
      }
      prizes.push({ contest: c ? (c.name || c.cid) : '?', contestDay: c ? c.day : null, day: t.day,
        kind: 'loot', id: itemId, tier: d.tier, recipient: 'player',
        landed: true, stateChange: held || used, stateKind: used ? 'used(revealed): ' + (useLine || '') : (held ? 'held-in-pack' : 'gone-no-trace') });
    } else if (t.type === 'prize_ability_offer') {
      const c = nearestContest(t.day);
      const ids = d.ids || [];
      const accepted = ids.filter(id => grantedAbils.has(id) || scholarAbils.indexOf(id) >= 0);
      prizes.push({ contest: c ? (c.name || c.cid) : '?', contestDay: c ? c.day : null, day: t.day,
        kind: 'ability_offer', id: ids.join(','), recipient: 'player',
        landed: true, stateChange: accepted.length > 0, stateKind: accepted.length ? 'equipped: ' + accepted.join(',') : 'offer-declined/ignored' });
    } else if (t.type === 'prize_evolution_assist') {
      const c = nearestContest(t.day);
      prizes.push({ contest: c ? (c.name || c.cid) : '?', contestDay: c ? c.day : null, day: t.day,
        kind: 'evolution_assist', id: d.item, recipient: 'player',
        landed: true, stateChange: true, stateKind: 'relic-bound +' + (d.gain || '?') + ' (bond ' + (d.bond || '?') + ')' });
    } else if (t.type === 'prize_synergy_hint') {
      const c = nearestContest(t.day);
      prizes.push({ contest: c ? (c.name || c.cid) : '?', contestDay: c ? c.day : null, day: t.day,
        kind: 'synergy_hint', id: d.id, recipient: 'player',
        landed: true, stateChange: true, stateKind: 'discovery-attempt +' + (d.attempt || '?') });
    } else if (t.type === 'prize_knowledge_dump') {
      const c = nearestContest(t.day);
      const known = d.plant ? plantKnown(Game, d.plant) : false;
      prizes.push({ contest: c ? (c.name || c.cid) : '?', contestDay: c ? c.day : null, day: t.day,
        kind: 'knowledge_dump', id: d.plant, recipient: 'player',
        landed: true, stateChange: known, stateKind: known ? 'identified: ' + d.plant : 'dump-fired-but-unverified' });
    }
  }
  // villager winner's share (no tele — SYS line + pantry)
  for (let dd = 1; dd <= DAYS + 2; dd++) {
    for (const l of (dayLines[dd] || [])) {
      if (/Winner's share/.test(l)) {
        const c = nearestContest(dd);
        const eaten = /eats them on the spot/.test(l);
        const inPantry = pantryNames.some(n => /Winner's share/.test(n || ''));
        prizes.push({ contest: c ? (c.name || c.cid) : '?', contestDay: c ? c.day : null, day: dd,
          kind: 'winners_share', id: "Winner's share (alien rations)", recipient: 'villager',
          landed: true, stateChange: true, stateKind: eaten ? 'pantry-drawn(eaten on the spot)' : (inPantry ? 'pantry-drawn(in pantry)' : 'pantry-drawn(consumed later)') });
      }
    }
  }
  // ability grants near a win that did NOT come through a prize_ability_offer
  // tele (e.g. the "PICK A TRICK — ON US" choice path): the grant itself is
  // the prize landing + the equipped state change.
  const offerMatched = new Set();
  for (const p of prizes) if (p.kind === 'ability_offer' && p.stateChange) {
    for (const id of String(p.id).split(',')) offerMatched.add(id + '@' + p.day);
  }
  for (const t of tele) {
    if (!t || t.type !== 'ability_granted' || t.day == null) continue;
    const f = teleFields(t);
    if (f.who !== 'player' && !(typeof f.who === 'string' && f.who.indexOf('villager:') === 0)) continue;
    const c = nearestContest(t.day);
    if (!c) continue;
    const key = f.id + '@' + t.day;
    if (offerMatched.has(key)) continue;
    // already counted via offer match?
    const already = prizes.some(p => p.kind === 'ability_offer' && String(p.id).split(',').indexOf(f.id) >= 0 && Math.abs(p.day - t.day) <= 3);
    if (already) continue;
    prizes.push({ contest: c.name || c.cid, contestDay: c.day, day: t.day,
      kind: 'ability_grant', id: f.id, recipient: f.who === 'player' ? 'player' : f.who,
      landed: true, stateChange: true, stateKind: 'equipped: ' + f.id + ' (grant, no offer tele)' });
  }
  const m3ok = prizes.filter(p => p.landed && p.stateChange);
  const rawPrizeTeles = tele.filter(t => t && /prize_|loot_dropped/.test(t.type))
    .map(t => ({ day: t.day, type: t.type, fields: teleFields(t) }));
  const prizesObserved = { prizeCount: prizes.length, usedCount: m3ok.length };

  // ---- M3 (r16): records — ZERO placeholder champion lines (re-verify r15 fix) ----
  const m3 = { championLineCount: championLines.length,
    fallbackWho: fbWho.length, fallbackContest: fbContest.length,
    recordsFileCorrupt,
    verdict: (fbWho.length === 0 && fbContest.length === 0) ? 'GO' : 'NO-GO' };

  // ---- M5: repeat-beat scan (verbatim repeats >7 days apart, all dayLines) ----
  // Narrative beats only: mechanical/systemic lines (day-part headers, wait/
  // sleep confirmations, warnings, favor deltas, ambient villager routines,
  // action confirmations, contest ritual lines) repeat by design and are
  // excluded — the metric targets WRITTEN beats (observation/gossip/coaching).
  const MECH_RE = /^(SAY|SYS): (— |You wait\.|You settle|No risky water|Hunger gnaws|Iron cold|⚠|💧 Drank|💧 .+ returns with water|📈|📉|\(|The pantry|The village eats|Night falls|Travel \d+ tile|Drank clean water|You drink|The lights take their cut|The crowd is a weather system|The System presses something humming|📺 The System (wants|was going to|has taken)|📺 ───|📺 While you (fought|stood)|📺 It is today|📺 The grab comes|📺 Arena|📺 CONTEST|📺 SYSTEM|◈ The Records:)/;
  const AMBIENT_RE = /heads out for water|returns with water|tends the|checks the traps|mends the|hauls .+ back|keeps watch|stokes the fire|sharpens .+ blade|weaves|carves/;
  const lineDays = {};
  for (let d = 1; d <= DAYS + 2; d++) {
    for (const l of (dayLines[d] || [])) {
      (lineDays[l] = lineDays[l] || new Set()).add(d);
    }
  }
  const repeatsAll = [];
  const repeatsNarr = [];
  for (const l of Object.keys(lineDays)) {
    const ds = Array.from(lineDays[l]).sort((a, b) => a - b);
    if (ds.length >= 2 && ds[ds.length - 1] - ds[0] > 7) {
      const mech = MECH_RE.test(l) || AMBIENT_RE.test(l);
      const rec = { line: l.slice(0, 200), days: ds, mechanical: mech };
      repeatsAll.push(rec);
      if (!mech) repeatsNarr.push(rec);
    }
  }
  repeatsAll.sort((a, b) => (b.days[b.days.length - 1] - b.days[0]) - (a.days[a.days.length - 1] - a.days[0]));
  repeatsNarr.sort((a, b) => (b.days[b.days.length - 1] - b.days[0]) - (a.days[a.days.length - 1] - a.days[0]));
  // r16: repeat scan is observed, not binding (r15 documented the pools as
  // designed-recycle; the binding people-metric is the null-line scan below).
  const repeatsObserved = { repeatCountAll: repeatsAll.length, repeatCountNarrative: repeatsNarr.length,
    repeatsNarrative: repeatsNarr,
    repeatsMechanicalSample: repeatsAll.filter(r => r.mechanical).slice(0, 10) };

  // ---- guardrails ----
  const starvation = deaths.filter(t => /starvat|hunger/.test(String(t.cause || '')));
  const atomNow = pantryUnitAtom(Game);
  const m4atom = { pantryUnitAtom: atomNow, verdict: atomNow <= 500 ? 'GO' : 'NO-GO' };
  const mG = { reachedDay: nowDay(Game), over: !!Game.over,
    starvationDeaths: starvation.map(t => ({ day: t.day, who: t.who, cause: t.cause })),
    pantryUnitAtom: atomNow, atomOk: atomNow <= 500,
    waveUnlockDays: waveDay, wave2GateOk: (waveDay[2] == null) || waveDay[2] >= 8,
    popAlive: livingVids(Game).length, pantryEnd: Math.round(pantryKcal(Game)),
    deaths: deaths.length };

  // ---- telemetry baseline keys ----
  const wk = (() => { try { return (Game.state.waveKills || {}); } catch (e) { return {}; } })();
  const killTotal = Object.values(wk).reduce((a, b) => a + (b || 0), 0);
  const metrics = {
    fanClubs: fanEnd,
    contestFinal: { held: contests.length, outcomes: contests.map(c => c.outcome),
      prizes: prizes.map(p => ({ kind: p.kind, id: p.id, recipient: p.recipient, stateKind: p.stateKind })) },
    codexKillSummary: { waveKills: wk, total: killTotal },
    pilotAired: pilotDay,
    deaths: deaths.length,
    popAlive: livingVids(Game).length,
    pantryKcal: Math.round(pantryKcal(Game)),
  };

  // ---- transcripts (contest windows + aftermath) ----
  const windowDays = new Set();
  for (const c of contests) for (let d = Math.max(1, c.day - 1); d <= Math.min(DAYS + 2, c.day + 6); d++) windowDays.add(d);
  const tpPath = EVID + `/journey-establishment-r17-transcript-seed${seed}.txt`;
  let tp = [`=== seed ${seed} — contest-window + aftermath transcripts (r16) ===`];
  for (const d of Array.from(windowDays).sort((a, b) => a - b)) {
    tp.push(`\n----- day ${d} -----`);
    for (const l of (dayLines[d] || [])) tp.push(l);
  }
  try { fs.writeFileSync(tpPath, tp.join('\n')); } catch (e) { warnOnce('tpWrite', e); }

  // one held conversation per seed for the people-check (gossip-seeking)
  const convoPath = EVID + `/journey-establishment-r17-convo-seed${seed}.txt`;
  const convoLines = [];
  try {
    const lastContest = contests[contests.length - 1];
    const cv = livingVids(Game).slice(0, 3);
    convoLines.push(`=== seed ${seed} — held conversations (after contest ${lastContest ? (lastContest.name || lastContest.cid) + ' day ' + lastContest.day : 'none'}, end day ${nowDay(Game)}) ===`);
    for (const vid of cv) {
      const nm = nameOf(Game, vid);
      const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
      convoLines.push(`\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      convoLines.push('choices: ' + ((r.choices || []).map(ch => `[${ch.id}] ${String(ch.label || '').slice(0, 80)}`).join(' | ')));
      for (let turn = 0; turn < 8; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const pick = choices.find(ch => /gossip|rumor/.test(ch.id)) || choices.find(ch => /^want:/.test(ch.id)) || choices.find(ch => ch.id !== 'leave') || null;
        if (!pick) break;
        convoLines.push(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        // r16: an ended turn with a null line is the quiet close (goodbye was
        // already spoken) — the phone closes the chat, no null renders. Only
        // a LIVE turn with a null line is a real null render.
        if (r.line == null && r.ended) convoLines.push('THEM: (quiet close — no line, ended)');
        else convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    }
  } catch (e) { convoLines.push('ERROR: ' + e.message); }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }

  // ---- M5 (r16): people — ZERO null-line renders in any held convo ----
  // (r15 nit: two convos rendered a literal "THEM: null" via the winddown
  // 'more' branch; the guard fix should kill it.)
  const nullConvoLines = convoLines.filter((l, i) => {
    if (!/^THEM: (null|undefined)\s*$/.test(l) && !/^(OPENING|closing): (null|undefined)$/.test(l)) return false;
    // a quiet close (next line) is by design, not a null render
    const nxt = convoLines[i + 1] || '';
    return nxt.indexOf('(quiet close') !== 0;
  });
  const m5 = { nullLineCount: nullConvoLines.length,
    verdict: nullConvoLines.length === 0 ? 'GO' : 'NO-GO',
    repeatsObserved };

  const out = { seed, run: 'r17', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    metrics,
    m1, fanm1, m2: { atom: m4atom.verdict, records: m3.verdict, nulls: m5.verdict,
      verdict: (m4atom.verdict === 'GO' && m3.verdict === 'GO' && m5.verdict === 'GO') ? 'GO' : 'NO-GO' },
    m3, m4: m4atom, m5,
    prizesObserved,
    gossipProbeLines: gossipProbeLines.slice(0, 40),
    guardrails: mG,
    pilotDay, fires, contests, arenaFights,
    fanLines: fanLines.slice(0, 20), namedFanLines: namedFanLines.slice(0, 10),
    deaths, transcriptPath: tpPath, convoPath: convoPath,
    recordsChampionLines: championLines.map(l => ({ day: l.day, text: l.text })),
    ctxNotes: ctx.notes.slice(0, 10) };
  const outPath = EVID + `/journey-establishment-r17-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('outWrite', e); }
  return { seed, outPath,
    m1: out.m1, m2: out.m2, m3: out.m3, m4: out.m4, m5: out.m5,
    guardrails: mG, pilotDay,
    contests: contests.map(c => ({ cid: c.cid, name: c.name, day: c.day, outcome: c.outcome, playerTaken: c.playerTaken })) };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r17 seed=${seed} ---`);
    const r = await runSeed(seed);
    results.push(r);
    console.log(JSON.stringify({ seed, pilotDay: r.pilotDay,
      m1: { verdict: r.m1.verdict, aired: r.m1.aired, surfaced: r.m1.surfaced, rate: r.m1.rate,
        lossByType: r.m1.lossByType,
        contests: r.m1.contests },
      m2: r.m2,
      m3: { verdict: r.m3.verdict, championLineCount: r.m3.championLineCount, fallbackWho: r.m3.fallbackWho, fallbackContest: r.m3.fallbackContest },
      m4: { verdict: r.m4.verdict, atom: r.m4.pantryUnitAtom },
      m5: { verdict: r.m5.verdict, nullLines: r.m5.nullLineCount },
      guardrails: r.guardrails, contests: r.contests }, null, 1));
    console.log('analysis: per-seed JSON + transcripts written; run all seeds then compose the analysis md by hand');
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
