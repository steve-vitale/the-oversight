#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R14 — THE FIRST CONTEST, PLAYED NOT RNG
// (2026-10-18). No queue jump — rotation index is 1 (establishment).
//
// Pre-registered in hidden_files/evidence/2026-10-18/journey-establishment-r14-note.md:
//   Seeds: 7, 61, 82. Horizon: 40 game-days. Policy: competent PINNED.
//   Binding metrics:
//     M1 (reachable): pilot/first contest fires on >=3/4 pilot seeds by day 21;
//        >=1 contest fires in days 14-40 on EVERY seed.
//     M2 (legible): eligibility panel shows "who can go, and why" — castable
//        list readable with reasons before the contest.
//     M3 (played): on seeds where the player is taken, >=1 PLAYED contest per
//        seed: blood -> blow-by-blow rounds (>=3 rounds observed);
//        moot/weird -> >=1 player choice through the show phase engine.
//        A contest resolving as a single outcome roll = BLANK.
//     M4 (aftermath): >=1 village reaction line (gossip/favor/System) referencing
//        the contest within 3 game-days after; contestant state change
//        (prize/fan/trauma) recorded on >=1 participant per played contest.
//     M5 (people): >=6 full transcripts sense-read (contest windows), 0 senseless.
//   Guardrails: no contest softlock (day 40 reached all seeds); starvation
//     deaths reported with cause; pantry unit atom <=500 kcal; wave-2 gate
//     respected (day 8 + 5 wave-1 ledger points).
// Usage: node scripts/journey-establishment-r14-20261018.js
//        SEEDS=7,61 node scripts/journey-establishment-r14-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-18';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 61, 82]);
const DAYS = parseInt(process.env.DAYS || '40', 10);

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
    const sid = Game.villagerId;
    return (v.roster || []).filter(id => {
      if (id === sid) return false;
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

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) {} }

  // ---- instrumentation ----
  const dayLines = {}; // day -> [say lines]
  const choiceLog = []; // every contestChoose: {day, cid, cat, risk, phaseIdx, playerTaken, watch, arena, phaseHead, choiceIdx, choiceLabel, nChoices}
  const arenaFights = []; // {day, cid, rounds}
  const fires = []; // fireContest: {day, cid, pilot, eligible:[names+notes], ineligible:[name+reason], takenIds}
  const contests = []; // contest_end: {day, cid, outcome, participants, playerTaken, fanBefore, fanAfter, traumaBefore, traumaAfter, stateChanges:[]}
  let pilotDay = null;
  const _say0 = Game.say, _sysSay0 = Game.sysSay;
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) {}
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) {}
    };
  }
  // eligibility panel at the exact moment the System casts (M2: the same bar the engine uses)
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const d = nowDay(Game);
      let elig = { eligible: [], ineligible: [], reason: null };
      try { elig = Game.contestEligible() || elig; } catch (e) {}
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try {
        fires.push({
          day: d, cid: (contest && contest.id) || '?',
          cat: (contest && contest.cat) || '?', risk: (contest && contest.risk) || '?',
          pilot: !wasPilotAired,
          eligible: (elig.eligible || []).map(x => ({ name: x.name || nameOf(Game, x.id), notes: (x.notes || []).join('; ') || null, notability: x.notability != null ? +(+x.notability).toFixed(2) : null })),
          ineligible: (elig.ineligible || []).map(x => ({ name: x.name || nameOf(Game, x.id), reason: x.reason || '?' })),
          reason: elig.reason || null,
          takenIds: ((Game.state.activeContest || {}).participants || []).slice(),
        });
        if (!wasPilotAired && Game.state.pilotAired && pilotDay === null) pilotDay = d;
      } catch (e) {}
      return r;
    };
  }
  // every choice through the phase engine (M3), incl. watch-mode and arena gating
  const _contestChoose = Game.contestChoose.bind(Game);
  Game.contestChoose = function (idx) {
    const ac = Game.state.activeContest;
    if (ac && ac.phase !== 'done') {
      try {
        const phase = (ac.phases || [])[ac.phaseIdx || 0] || {};
        const ch = (phase.choices || []);
        choiceLog.push({
          day: nowDay(Game), cid: ac.contestId, phaseIdx: ac.phaseIdx || 0,
          playerTaken: (ac.participants || []).indexOf('player') >= 0,
          watch: ac.participant !== 'player' && !ac.participants,
          arena: !!ac.arenaSuspended,
          nChoices: ch.length,
          choiceIdx: idx,
          choiceLabel: (ch[idx] && (ch[idx].label + (ch[idx].sub ? ' — ' + ch[idx].sub : ''))) || null,
          phaseHead: String(phase.text || '').replace(/^📺\s*/, '').slice(0, 160),
        });
      } catch (e) {}
    }
    return _contestChoose(idx);
  };
  // arena rounds: the blow-by-blow evidence (M3 blood path)
  const _tbEnd = Game.tbEnd ? Game.tbEnd.bind(Game) : null;
  if (_tbEnd) {
    Game.tbEnd = function (...a) {
      try {
        const ac = Game.state.activeContest;
        if (ac && ac.arenaSuspended && Game.tbfight) {
          arenaFights.push({ day: nowDay(Game), cid: ac.contestId, rounds: Game.tbfight.round || 0,
            playerHp: Math.round(((Game.tbfight.fighters || []).find(f => f.key === 'p') || {}).hp || 0) });
        }
      } catch (e) {}
      return _tbEnd(...a);
    };
  }
  // contest end: tele gives outcome; snapshot aftermath state for deltas
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
          fanAfter: null, traumaAfter: null,
        });
      }
    } catch (e) {}
    return r;
  };

  const dayStart = nowDay(Game);
  const waveDay = {}; // wave number -> first day unlocked
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) {} }
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) {} }
    try { Game.sleep(); } catch (e) {}
    try { driveContests(Game, policy, ctx); } catch (e) {}
    if (Game.over) break;
    // wave unlock tracking (wave-2 gate guardrail)
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      const gd = nowDay(Game);
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) {}
    // death-aware: stop if the village is gone (+10d tail)
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }
  // close out aftermath deltas (fan/trauma after each contest end)
  for (const c of contests) { c.fanAfter = fanClubs(Game); c.traumaAfter = scholarTrauma(Game); }

  // deaths (live capture from telemetry — full stream is on)
  const deaths = [];
  try {
    for (const t of (Game.state.telemetry || [])) {
      if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
    }
  } catch (e) {}
  const teleTypes = {};
  try {
    for (const t of (Game.state.telemetry || [])) {
      const ty = t && t.type;
      if (/contest|show_aired|pilot|prize|death/.test(ty)) teleTypes[ty] = (teleTypes[ty] || 0) + 1;
    }
  } catch (e) {}

  // ---- verdicts ----
  // M1: pilot fired on >=3/4 pilot seeds by day 21 (3 seeds here: need 3/3);
  //     >=1 contest in days 14-40 on every seed.
  const pilotFire = fires.find(f => f.pilot) || null;
  const contestsInLeg = fires.filter(f => f.day >= 14 && f.day <= 40).length;
  const m1 = { pilotDay: pilotFire ? pilotFire.day : null, pilotBy21: pilotFire ? pilotFire.day <= 21 : false,
               contestsInLeg, verdict: pilotFire && pilotFire.day <= 21 && contestsInLeg >= 1 ? 'GO' : 'NO-GO' };
  // M2: eligibility panel legible at the pilot cast
  let m2 = { verdict: 'NO-GO', note: 'no pilot fire' };
  if (pilotFire) {
    const hasElig = pilotFire.eligible.length > 0;
    const eligReasons = pilotFire.eligible.filter(e => e.notes || e.notability != null).length;
    const ineligReasons = pilotFire.ineligible.filter(e => e.reason && e.reason !== '?').length;
    m2 = { verdict: (hasElig && eligReasons > 0 && ineligReasons > 0) ? 'GO' : 'NO-GO',
           eligible: pilotFire.eligible.length, eligibleWithWhy: eligReasons,
           ineligible: pilotFire.ineligible.length, ineligibleWithWhy: ineligReasons };
  }
  // M3: per seed, on seeds where the player is taken: >=1 PLAYED contest.
  //   blood -> >=3 blow-by-blow arena rounds; moot/weird -> >=1 choice through the engine.
  const playerContests = contests.filter(c => c.playerTaken);
  const m3seeds = playerContests.map(c => {
    const rounds = arenaFights.filter(a => a.cid === c.cid && a.day <= c.day + 1).reduce((t, a) => t + a.rounds, 0);
    const choices = choiceLog.filter(l => l.cid === c.cid && !l.arena).length;
    const cat = (fires.find(f => f.cid === c.cid) || {}).cat || '?';
    const played = rounds >= 3 || choices >= 1;
    return { cid: c.cid, cat, outcome: c.outcome, rounds, choices, played };
  });
  const m3 = { playerTakenCount: playerContests.length, contests: m3seeds,
               verdict: playerContests.length === 0 ? 'n/a (player never taken)'
                 : (m3seeds.every(x => x.played) ? 'GO' : 'NO-GO') };
  // M4: reaction lines within 3 days after each contest end; state change on >=1 participant.
  const reactRe = /contest|challenge|pilot|taken with|taken:|arena|cameras|oversight|win.*camera|fans?|the show|televised|the crowd|audience|won .*on camera|brought home/i;
  const m4seeds = contests.map(c => {
    const lines = [];
    for (let d = c.day; d <= c.day + 3; d++) {
      for (const l of (dayLines[d] || [])) {
        if (reactRe.test(l) && !/contestHIDE|contestPit|contestDuel|contestGauntlet/i.test(l)) lines.push({ day: d, line: l.slice(0, 220) });
      }
    }
    // r14 metric review: sum of |lane deltas| — the old Math.abs(sum) let
    // fight −2 + showbiz +2 cancel to 0, understating state change.
    const fanDelta = Math.abs(c.fanAfter.fight - c.fanBefore.fight) + Math.abs(c.fanAfter.survival - c.fanBefore.survival) +
      Math.abs(c.fanAfter.social - c.fanBefore.social) + Math.abs(c.fanAfter.showbiz - c.fanBefore.showbiz);
    const traumaDelta = c.traumaAfter - c.traumaBefore;
    const prizeTele = (Game.state.telemetry || []).some(t => t && /^prize_/.test(t.type) && (t.day || 0) >= c.day && (t.day || 0) <= c.day + 3);
    const diedAfter = deaths.some(t => (c.participants || []).indexOf(t.who && (t.who === 'You' ? 'player' : t.who)) >= 0 ||
      (c.participants || []).some(p => nameOf(Game, p) === t.who && (t.day || 0) >= c.day && (t.day || 0) <= c.day + 3));
    const stateChange = (traumaDelta !== 0) || (fanDelta !== 0) || prizeTele || diedAfter;
    return { cid: c.cid, day: c.day, outcome: c.outcome, playerTaken: c.playerTaken,
             reactionLines: lines.length, fanDelta, traumaDelta, prizeTele, diedAfter,
             verdict: (lines.length >= 1 && stateChange) ? 'GO' : 'NO-GO' };
  });
  const m4 = { verdict: contests.length === 0 ? 'NO-GO (no contests)' : (m4seeds.every(x => x.verdict === 'GO') ? 'GO' : 'NO-GO'),
               perContest: m4seeds };
  // M5: transcripts to sense-read (written below); flags counted by hand in analysis.
  // guardrails
  const starvation = deaths.filter(t => /starvat|hunger/.test(String(t.cause || '')));
  const mG = { reachedDay: nowDay(Game), over: !!Game.over,
               starvationDeaths: starvation.map(t => ({ day: t.day, who: t.who, cause: t.cause })),
               pantryUnitAtom: pantryUnitAtom(Game), atomOk: pantryUnitAtom(Game) <= 500,
               waveUnlockDays: waveDay,
               wave2GateOk: (waveDay[2] == null) || waveDay[2] >= 8,
               popAlive: livingVids(Game).length, pantryEnd: Math.round(pantryKcal(Game)),
               deaths: deaths.length };
  const metricForTele = { pilotAired: pilotFire ? pilotFire.day : null,
    contestFinal: { held: contests.length, outcomes: contests.map(c => c.outcome) },
    liveContestEvents: (teleTypes.contest_fired || 0) + (teleTypes.show_aired || 0) + (teleTypes.contest_end || 0),
    deaths: deaths.length, popAlive: livingVids(Game).length, pantryKcal: Math.round(pantryKcal(Game)) };

  // transcripts: full say-line dumps for contest-window days
  const windowDays = new Set();
  for (const f of fires) for (let d = Math.max(1, f.day - 1); d <= Math.min(DAYS + 10, f.day + 4); d++) windowDays.add(d);
  const transcripts = {};
  for (const d of Array.from(windowDays).sort((a, b) => a - b)) {
    transcripts['day' + d] = dayLines[d] || [];
  }
  const tpPath = EVID + `/journey-establishment-r14-transcript-seed${seed}.txt`;
  let tp = [`=== seed ${seed} — contest-window transcripts ===`];
  for (const d of Array.from(windowDays).sort((a, b) => a - b)) {
    tp.push(`\n----- day ${d} -----`);
    for (const l of (dayLines[d] || [])) tp.push(l);
  }
  try { fs.writeFileSync(tpPath, tp.join('\n')); } catch (e) {}

  // one held conversation for the people-check (contest aftermath flavor)
  const convoPath = EVID + `/journey-establishment-r14-convo-seed${seed}.txt`;
  const convoLines = [];
  try {
    const lastContest = contests[contests.length - 1];
    const cv = livingVids(Game).slice(0, 3);
    convoLines.push(`=== seed ${seed} — held conversations (after contest ${lastContest ? lastContest.cid + ' day ' + lastContest.day : 'none'}) ===`);
    for (const vid of cv) {
      const nm = nameOf(Game, vid);
      const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
      convoLines.push(`\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      convoLines.push('choices: ' + ((r.choices || []).map(ch => `[${ch.id}] ${String(ch.label || '').slice(0, 80)}`).join(' | ')));
      for (let turn = 0; turn < 6; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const pick = choices.find(ch => /^want:/.test(ch.id)) || choices.find(ch => /gossip/.test(ch.id)) || choices.find(ch => ch.id !== 'leave') || null;
        if (!pick) break;
        convoLines.push(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    }
  } catch (e) { convoLines.push('ERROR: ' + e.message); }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) {}

  const out = { seed, dayStart, reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    metrics: metricForTele,
    m1, m2, m3, m4, guardrails: mG,
    pilotDay, fires, contests, choiceLog, arenaFights,
    deaths, teleTypes, transcripts: Object.keys(transcripts),
    transcriptPath: tpPath, convoPath: convoPath,
    ctxNotes: ctx.notes.slice(0, 10) };
  const outPath = EVID + `/journey-establishment-r14-seed${seed}.json`;
  try { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); } catch (e) {}
  return { seed, outPath, m1, m2, m3, m4, guardrails: mG, pilotDay,
           contests: contests.map(c => ({ cid: c.cid, day: c.day, outcome: c.outcome, playerTaken: c.playerTaken })),
           fires: fires.map(f => ({ day: f.day, cid: f.cid, pilot: f.pilot, eligible: f.eligible.length })) };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r14 seed=${seed} ---`);
    const r = await runSeed(seed);
    results.push(r);
    console.log(JSON.stringify({ seed, pilotDay: r.pilotDay, m1: r.m1, m2: r.m2, m3: r.m3, m4: r.m4, guardrails: r.guardrails, contests: r.contests }, null, 1));
    try { require('child_process').execSync('bash scripts/worktree-heartbeat.sh journey-establishment', { cwd: ROOT, timeout: 15000 }); } catch (e) {}
  }
  const apPath = EVID + '/journey-establishment-r14-analysis.md';
  let md = ['# Journey establishment R14 — THE FIRST CONTEST, PLAYED NOT RNG (2026-10-18)', '',
    'Pilot (3 seeds × 40d, competent pinned). Pre-registered metrics in `journey-establishment-r14-note.md`.', '',
    '| seed | pilotDay | contests fired (day 14-40) | player-taken | M1 | M2 | M3 | M4 | reachedDay |',
    '|---|---|---|---|---|---|---|---|---|'];
  for (const r of results) {
    md.push(`| ${r.seed} | ${r.pilotDay == null ? '—' : r.pilotDay} | ${r.fires.map(f => f.cid + '@' + f.day).join(', ') || 'none'} | ${r.contests.filter(c => c.playerTaken).map(c => c.cid).join(', ') || 'none'} | ${r.m1.verdict} | ${r.m2.verdict} | ${r.m3.verdict} | ${r.m4.verdict} | ${r.guardrails.reachedDay} |`);
  }
  md.push('', '## Metric review', '', '(fill after sense-read)', '');
  try { fs.writeFileSync(apPath, md.join('\n')); } catch (e) {}
  console.log('analysis: ' + apPath);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
