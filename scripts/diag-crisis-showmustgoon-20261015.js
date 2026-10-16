#!/usr/bin/env node
// diag-crisis-showmustgoon-20261015.js — CRISIS LEG r17: the show must go on.
// A contest fires MID-COMPOUND-CRISIS (famine + outbreak). Steve's contest
// interruption principle (2026-10-05): contests are UNAVOIDABLE — "If you're
// not taken, it's announced. If you are, sometimes you get a choice but
// usually it grabs you." r5/r6/r10 covered raids, r7 famine slope, r8
// outbreak talk, r9 the famine+outbreak compound, r16 the alien outbreak.
// NEVER tested as a focused question: does the show still grab when the
// village is starving and sick — and does village talk carry BOTH?
//
// Method (r9's compound recipe + organic contests):
//   1. oracleV2 establish 20d
//   2. blight: pantryAdd + stockPantry refused from d20 (record pre-blight kcal)
//   3. d25: stage gut-rot on 5 adults (v.sick entries; every downstream machine real)
//   4. contests fire organically via contestTick — pilot guarantee (day>=21,
//      no pilot aired -> schedule bump) puts the pilot right at blight start;
//      weekly-budget contests land in the compound window. runDays drives them
//      through the harness's default contest driver (choice 0).
//   5. run to d55 (death-aware: pop<=2 -> collapse, +10d tail max)
//   6. mid-crisis convos (d35+, 2 villagers), end convos (2 sick + 2 healthy),
//      full transcripts, SENSE-read for crisis AND contest topics.
// Leg question: when the System grabs villagers mid-compound-crisis, does the
// village bend like people — announcement/dread/grab intact, talk carries the
// double load, the returned are tended or mourned, no deadlock between the
// two systems?
// Interesting-finding criteria:
//   - a contest fires while pantry is collapsed AND >=3 sick, and resolves;
//   - talk carries the contest (arena/show/grab/taken/audience) AND the crisis
//     in the same conversations;
//   - participants return injured/sick and the village tends them;
//   - no contest stall (every fired contest resolves within 7d);
//   - no deadlock: tending doesn't stop foraging, contest doesn't starve tending.
// Usage: SEED=777 node scripts/diag-crisis-showmustgoon-20261015.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '777', 10);
const ESTABLISH = 20, OUTBREAK_DAY = 25, END_DAY = 55;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function isAdult(Game, vid) { try { return Game.npcAge(vid) >= 15; } catch (e) { return true; } }
function isSick(Game, vid) {
  try { const s = (Game.state.village.sick || {})[vid]; return s && (s.daysLeft || 0) > 0 && Game.vpOf(vid) && !Game.vpOf(vid).dead; } catch (e) { return false; }
}
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}

const rec = { seed: SEED, staged: [], contests: [], deaths: [], convos: [], dawns: [],
  notes: [], sickPeak: 0, preBlightPantry: 0, pantryMin: Infinity, carriedCount: 0, carriedContestCount: 0 };
const E = (s) => console.error(s);

const CRISIS_RE = /hunger|hungry|starv|food|eat\b|sick|ill|fever|tired|tire|worse|disease|gut|tending|tend|heal|water|boil|herb|dead|died|gone|grief|mourn|buri|funeral|moot|cannibal/i;
const CONTEST_RE = /contest|\barena\b|grabbed|taken by|the show\b|broadcast|audience|\bcameras?\b|System's whim|televis|episode|prize|\bcrowd\b|ratings|spotlight/i;

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))} (sick=${isSick(Game, vid) ? 'yes' : 'no'})`];
  let latelyKind = 'unknown';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; latelyKind = ev ? ev.kind : 'none'; } catch (e) {}
  out.push(`[latelyKind=${latelyKind}]`);
  try { Game.startConvo(vid); } catch (e) { return { vid, tag, latelyKind, lines: out, err: 'startConvo threw: ' + e.message }; }
  for (let t = 0; t < maxTurns; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { out.push('(convoChoices threw)'); break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /sick|ill|fever|water|boil|herb|heal|tire|worse|disease|gut|hunger|hungry|starv|food|eat|contest|arena|grab|taken|show|broadcast|audience|camera|chosen|stage|dread|dead|died|gone|grief|mourn|buri|funeral|scared|afraid/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> [${pick.id}] ${pick.text}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push('(convoTurn threw: ' + e.message + ')'); break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  let full = [];
  try { const c = Game.convoGet(vid); full = (c && c.transcript) || []; } catch (e) {}
  const fullText = full.map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  const text = fullText.join('\n');
  const carried = CRISIS_RE.test(text);
  const carriedContest = CONTEST_RE.test(text);
  out.push('\n### FULL TRANSCRIPT');
  out.push(...fullText);
  return { vid, name: firstName(rawName(Game, vid)), tag, latelyKind, carried, carriedContest, lines: out };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-showmustgoon', fullTelemetry: true });
  await setupGame(Game);

  // instrumentation (all call-through): contests.
  // NOTE (r17 pilot bug, fixed): contest.participants is a COUNT (number),
  // not an id array — the cast lives on state.pendingContest.participants[].
  // The wrapper must call through FIRST, then read the cast from pendingContest.
  const _fireContest = Game.fireContest;
  Game.fireContest = function (contest) {
    const ret = _fireContest ? _fireContest.call(this, contest) : undefined;
    try {
      const pc = (this.state || {}).pendingContest;
      const ids = (pc && pc.participants) || [];
      const parts = ids.map(p => firstName(rawName(Game, p)));
      const pan = pantryKcal(Game);
      const sickN = livingRoster(Game).filter(id => isSick(Game, id)).length;
      const inCompound = rec.preBlightPantry > 0 && pan < 0.5 * rec.preBlightPantry && sickN >= 3;
      rec.contests.push({ fired: dayOf(Game), name: (contest || {}).name || (contest || {}).id || '?',
        participants: parts, inCompound, pantryAtFire: pan, sickAtFire: sickN, resolved: null });
      E(`[CONTEST-FIRE] d${dayOf(Game)} "${(contest || {}).name || (contest || {}).id || '?'}" took ${parts.join(', ') || '?'} inCompound=${inCompound} (pantry=${pan} sick=${sickN})`);
    } catch (we) { E('[CONTEST-WRAP-ERR] ' + we.message); }
    return ret;
  };
  const _resolveContest = Game.resolveContest;
  Game.resolveContest = function (contest) {
    const r = rec.contests[rec.contests.length - 1];
    if (r && r.resolved == null) {
      r.resolved = dayOf(Game);
      r.daysIn = r.resolved - r.fired;
      E(`[CONTEST-RESOLVE] d${dayOf(Game)} "${r.name}" after ${r.daysIn}d`);
    }
    return _resolveContest ? _resolveContest.call(this, contest) : undefined;
  };
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.notes.push(`crisis:${kind}@d${dayOf(Game)}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  rec.preBlightPantry = pantryKcal(Game);
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${rec.preBlightPantry}`);

  // ---- phase 2: the blight — refuse ALL pantry inflows ----
  let blockedKcal = 0;
  const _pa = Game.pantryAdd;
  Game.pantryAdd = function (item) {
    blockedKcal += (item.kcalEach || 0) * (item.units || 1);
    return false;
  };
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal) { blockedKcal += (kcal || 0); return undefined; };
  rec.notes.push('blight: pantryAdd+stockPantry refused from d' + dayOf(Game));

  // ---- phase 3: the outbreak at d25 ----
  while (dayOf(Game) < OUTBREAK_DAY && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  const adults = livingRoster(Game).filter(id => isAdult(Game, id) && id !== Game.villagerId);
  const staged = adults.slice(0, 5);
  const v = Game.state.village;
  v.sick = v.sick || {};
  for (const id of staged) {
    v.sick[id] = { name: 'gut rot', daysLeft: 14, severity: 3 };
    rec.staged.push({ who: firstName(rawName(Game, id)) });
  }
  rec.notes.push(`staged gut-rot outbreak on ${staged.length} adults at d${dayOf(Game)}; downstream fully real`);
  E(`[OUTBREAK] d${dayOf(Game)} staged on ${staged.map(id => firstName(rawName(Game, id))).join(', ')}`);

  // Early end: the compound crisis can scatter the village before the show
  // arrives (777 pilot: scattered ~d25). wipe() has run, so convo phases are
  // meaningless — record the break and finish honestly.
  if (Game.over) {
    rec.earlyEnd = { day: dayOf(Game), villageLost: !!((Game.state || {}).villageLost) };
    E(`[EARLY-END] game over at d${dayOf(Game)} villageLost=${rec.earlyEnd.villageLost} — recorded, finishing`);
    console.log(JSON.stringify(rec));
    return;
  }

  // ---- phase 4: compound + show run to d55 (death-aware, +10d tail) ----
  const sampleDawn = () => {
    const pop = livingRoster(Game);
    const sickNow = pop.filter(id => isSick(Game, id));
    if (sickNow.length > rec.sickPeak) rec.sickPeak = sickNow.length;
    const pan = pantryKcal(Game);
    if (pan < rec.pantryMin) rec.pantryMin = pan;
    const d = { day: dayOf(Game), pantry: pan, pop: pop.length, sick: sickNow.length, blockedKcal };
    rec.dawns.push(d);
    E(`[DAWN] d${d.day} pantry=${d.pantry} pop=${d.pop} sick=${d.sick} contests=${rec.contests.length}`);
  };
  let collapsed = false, tail = 0, midDone = false;
  while (dayOf(Game) < END_DAY && !Game.over) {
    await runDays(Game, oracleV2, { days: 5 });
    if (Game.over) break;
    sampleDawn();
    if (!midDone && dayOf(Game) >= 35 && livingRoster(Game).length >= 4) {
      midDone = true;
      const sickM = livingRoster(Game).filter(id => isSick(Game, id));
      const healM = livingRoster(Game).filter(id => !isSick(Game, id) && id !== Game.villagerId);
      for (const id of [...sickM.slice(0, 1), ...healM.slice(0, 1)]) {
        const c = driveConvo(Game, id, 'MID', 12);
        rec.convos.push({ ...c, lines: undefined });
        E(c.lines.join('\n'));
      }
    }
    if (livingRoster(Game).length <= 2) { collapsed = true; tail++; if (tail >= 2) break; }
  }
  // Post-loop early end: the village scattered/broke mid-phase-4 (777 pilot:
  // pantry 0 + 5 sick at d30, game over by d35). Flag it on the record.
  if (Game.over && !rec.earlyEnd) {
    rec.earlyEnd = { day: dayOf(Game), villageLost: !!((Game.state || {}).villageLost) };
    E(`[EARLY-END] game over at d${dayOf(Game)} villageLost=${rec.earlyEnd.villageLost} (mid-phase-4)`);
  }
  if (rec.pantryMin === Infinity) rec.pantryMin = pantryKcal(Game);

  // ---- deaths ----
  const fallen = ((Game.state.village || {}).fallen || []);
  rec.deaths = fallen.map(f => ({ day: f.day, name: firstName(f.name || rawName(Game, f.villagerId)), cause: f.cause || '?' }));
  E(`[DEATHS] ${rec.deaths.length}: ${rec.deaths.map(d => `${d.name} d${d.day}(${d.cause})`).join('; ') || 'none'}`);

  // ---- contest summary: who went, did they come back ----
  const live = new Set(livingRoster(Game));
  for (const c of rec.contests) {
    c.returned = (c.participants || []).filter(p => {
      // match by first name against living roster
      return livingRoster(Game).some(id => firstName(rawName(Game, id)) === p);
    });
  }
  E(`[CONTESTS] ${rec.contests.length} fired: ${rec.contests.map(c => `${c.name} d${c.fired}${c.inCompound ? '(IN-COMPOUND)' : ''}${c.resolved != null ? `->d${c.resolved}` : '(UNRESOLVED)'}`).join('; ') || 'none'}`);

  // ---- conversations: 2 sick + 2 healthy ----
  const sickNow = livingRoster(Game).filter(id => isSick(Game, id));
  const healthy = livingRoster(Game).filter(id => !isSick(Game, id) && id !== Game.villagerId);
  for (const id of sickNow.slice(0, 2)) {
    const c = driveConvo(Game, id, 'SICK', 12);
    rec.convos.push({ ...c, lines: undefined });
    E(c.lines.join('\n'));
  }
  for (const id of healthy.slice(0, 2)) {
    const c = driveConvo(Game, id, 'HEALTHY', 12);
    rec.convos.push({ ...c, lines: undefined });
    E(c.lines.join('\n'));
  }
  rec.carriedCount = rec.convos.filter(c => c.carried).length;
  rec.carriedContestCount = rec.convos.filter(c => c.carriedContest).length;
  rec.collapsed = collapsed;
  E(`[CARRY] crisis ${rec.carriedCount}/${rec.convos.length}, contest ${rec.carriedContestCount}/${rec.convos.length}`);
  console.log(JSON.stringify(rec));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
