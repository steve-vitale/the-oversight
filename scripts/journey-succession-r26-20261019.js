#!/usr/bin/env node
// journey-succession-r26-20261019.js — SUCCESSION LEG r26: "THE DEBT THE SUCCESSOR KEEPS"
// Journey leg 7: death of the player character, the mantle passing.
//
// LEG QUESTION (builds on r25's metric review): r25 built the open-book beat
// ("📜 X's book stays open on the table...") and proved the machinery on
// FORCED promises. r26 asks two things:
//   (a) ORGANIC reachability: under honest competent play with honest
//       convo-driving (NO forced commits — the driver accepts asks only when
//       a real player would), do open promises even exist at death? If the
//       open-book beat never fires organically, its trigger is unreachable
//       without orchestration — a reachability blank on the beat itself.
//   (b) LOOP CLOSE: when a re-asked favor is committed and FULFILLED by the
//       successor, does the fiction close cleanly? favor 'fulfilled' ->
//       repay convo -> 'thanked', promise kept=true, trust moves, no zombie
//       ledger entries. Never proven end-to-end before.
//
// INTERESTING-FINDING CRITERIA:
//   (a) full loop closes in fiction on >=1 seed -> end-to-end design working
//       for the first time (fulfilled -> thanked -> bond moves -> clean ledger).
//   (b) loop fails anywhere (fulfilled never thanked, zombie promise, trust
//       moves wrong) -> REAL BUG, fix justified.
//   (c) organic play produces zero open promises on all 4 seeds -> the
//       open-book beat's trigger is unreachable in the wild — reachability
//       blank on the beat itself (not a NO-GO, an honest finding).
//   (d) the repay gratitude line names the predecessor honestly vs awkwardly
//       -> sense-read, documented either way.
//
// SEEDS: 8101, 8102, 8103, 8104 (fresh; r25 used 7101-7104).
// POLICY: competent + daily honest convo driver. COMMIT RULE (documented as
// the driver's play): accept a favor ask only when trust >= 30 with the
// asker, the need is live, and no open promise with that NPC already exists.
// Pre-death the driver does NOT deliberately fulfill favor promises —
// incidental fulfillment by competent play is allowed. This measures whether
// honest competent play produces open promises at death.
// HORIZON: kill d16 via real playerDeath; successor plays to d30.
// Death-aware: village dead/scattered -> stop.
// PRIMARY METRICS (binding, MEASUREMENT.md §14):
//   M1: >=3/4 mantles pass cleanly (new bearer, lineage entry, game continues).
//   M2: open-book line fires on 100% of seeds where >=1 open promise existed
//       at death (r25 metric-review binding). If NO seed has an open promise,
//       the metric is vacuous -> organic-reachability finding (c) instead.
//   M3: >=1 full loop closes (re-ask -> commit -> fulfill via real action ->
//       repay convo -> favor 'thanked', promise kept=true, trust moved +15,
//       no zombie entries). Zero re-asks -> documented with cause, never
//       re-scored.
//   M4: >=2/4 successor-era transcripts meet the quality bar.
// KILL RULE: mantle fails to pass on >=2/4 seeds -> SUBSTRATE-MISSING.
//
// Usage: SEED=8101 node scripts/journey-succession-r26-20261019.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '8101', 10);
const KILL_DAY = 16, END_DAY = 30;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-19');

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; } }
function openPromise(Game, vid) {
  try { const p = ((Game.state.village || {}).promises || {})[vid]; return (p && !p.kept) ? p : null; } catch (e) { return null; }
}
function favorOf(Game, vid) {
  try { const f = ((Game.state.village || {}).favorLedger || {})[vid]; return f || null; } catch (e) { return null; }
}
function npcAlive(Game, vid) {
  try { return ((Game.state.village || {}).roster || []).includes(vid); } catch (e) { return false; }
}
function openPromiseCount(Game) {
  try { return Object.values((Game.state.village || {}).promises || {}).filter(p => p && !p.kept).length; } catch (e) { return 0; }
}

// Honest convo driver. commitRule(vid, favorCtx) -> bool decides dlg:commit.
function driveConvo(Game, vid, tag, commitRule, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false, committed = false, picked = [], commitPickTrust = null, commitPickWant = null;
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', committed: false, flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    return { text: out.join('\n') + '\n(convo refused or never opened)', refused, committed: false, flags: { want: (c0 && c0.want && c0.want.id) || 'none' } };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const c = Game.convoGet(vid);
    const wantId = (c && c.want && c.want.id) || '';
    const favor = (c && c.want && c.want.favor) || null;
    let pick = null;
    const commitChoice = choices.find(x => x.id === 'dlg:commit');
    // ORGANIC COMMIT (r26): the favor instance may not be attached to
    // c.want.favor at pick time (it attaches on commit) — gate on the
    // want being ask_favor-ish + the commit rule, then VERIFY an open
    // promise exists after the turn.
    if (commitChoice && commitRule && /favor/i.test(wantId)) {
      if (commitRule(vid, { favor, wantId })) pick = commitChoice;
    }
    if (!pick) pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) {
      // Generic fallback: NEVER take dlg:commit ungated (r26 pilot leak:
      // stage>=2 menus offer only commit/cant/leave, and the old fallback
      // committed at trust 8). Apply the gate; on refusal take dlg:cant.
      const fb = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
      if (fb) { pick = fb; }
      else {
        const cc2 = choices.find(x => x.id === 'dlg:commit');
        if (cc2 && commitRule && /favor/i.test(wantId) && commitRule(vid, { favor, wantId })) pick = cc2;
        else pick = choices.find(x => x.id === 'dlg:cant') || null;
      }
    }
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 110)}`);
    if (pick.id === 'dlg:commit') { commitPickTrust = trustOf(Game, vid); commitPickWant = (Game.convoGet(vid) || {}).want && Game.convoGet(vid).want.id; }
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    if (pick.id === 'dlg:commit' && openPromise(Game, vid)) committed = true;
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const cf = Game.convoGet(vid);
  const lines = [];
  for (const e2 of ((cf && cf.transcript) || [])) {
    lines.push(`${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 500)}`);
  }
  const txt = lines.join('\n');
  const m = txt.match(/I asked (\S+) about .*? — \1's gone/i);
  const thankedM = txt.match(/You came through on (.+?)\. I won't forget it/i);
  const flags = {
    want: (cf && cf.want && cf.want.id) || 'none',
    inheritedReask: !!m,
    thanked: !!thankedM,
    committed, picked: picked.join(','), commitPickTrust, commitPickWant,
  };
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  out.push(`\nCARRY-FLAGS: ${JSON.stringify(flags)}`);
  return { text: out.join('\n'), refused: false, committed, flags, fullText: txt, inheritedLine: m ? m[0].slice(0, 160) : null };
}

// Perform the real keep-action for a favor kind. Returns what was done.
function fulfillAction(Game, vid, kind) {
  try {
    if (kind === 'food_share' || kind === 'forage_help') {
      const r = Game.giveFood(vid, 'meal');
      return 'giveFood(meal): ' + (r ? 'ok' : 'null');
    }
    if (kind === 'heal_help' || kind === 'sick_help') {
      const r = Game.tendVillager(vid);
      return 'tendVillager: ' + (r ? 'ok' : 'null');
    }
    if (kind === 'stay_close') {
      // 'social' keeps fire on substantive convos (3+ exchanges) — the convo
      // driver already played one; drive one more short convo to trigger it.
      return 'social: drive another substantive convo';
    }
    // water_haul / snare_mend / watch_shift: keepKind 'task' fires in
    // resolveAssignments' end-of-day broadcast — no direct player action.
    // Play days and check.
    return 'task: no direct action — watch via runDays';
  } catch (e) { return 'threw: ' + e.message; }
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  mantle: {}, phase1Commits: [], openAtDeath: 0, openBookFired: false,
  loopCloses: [], m1: null, m2: null, m3: null, m4: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r26', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });

  const _say = Game.say;
  const handoffSay = [];
  let capturing = false;
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) handoffSay.push({ day: dayOf(Game), text: s.slice(0, 500) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: honest competent play + honest convo driving, d1..d16 ----
  // ORCHESTRATE=1 (r26 loop-close seed): on the last full day before the
  // kill, FORCE one commit through the real convo path (decision only — the
  // mechanism stays honest). Answers: can the loop close when a promise IS
  // open at death? Organic seeds answer whether it ever happens unforced.
  const ORCH = process.env.ORCHESTRATE === '1';
  rec.orchestrated = ORCH;
  const commitRule = (vid, ctx) => {
    if (openPromise(Game, vid)) return false;
    if (ORCH && dayOf(Game) >= KILL_DAY - 1) return true; // forced, documented
    return trustOf(Game, vid) >= 30;
  };
  for (let d = 1; d <= KILL_DAY; d++) {
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before the kill — seed skipped`); console.log(JSON.stringify(rec)); return; }
    await runDays(Game, competent, { days: 1 });
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before the kill — seed skipped`); console.log(JSON.stringify(rec)); return; }
    const self = Game.villagerId;
    const v = Game.state.village || {};
    const cands = [];
    for (const vid of (v.roster || [])) {
      if (vid === self) continue;
      try { if (Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid)) cands.push(vid); } catch (e) {}
    }
    cands.sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
    let drove = 0;
    for (const vid of cands.slice(0, 2)) {
      const r = driveConvo(Game, vid, `pre-death d${dayOf(Game)}`, commitRule);
      if (drove === 0 && d % 4 === 1) { E(`\n===== TRANSCRIPT d${dayOf(Game)} (${firstName(rawName(Game, vid))}) =====`); E(r.text.split('\n').slice(0, 40).join('\n')); }
      if (r.committed) {
        const f = favorOf(Game, vid);
        rec.phase1Commits.push({ day: dayOf(Game), vid: firstName(rawName(Game, vid)), kind: f && f.kind, trust: trustOf(Game, vid), commitPickTrust: r.flags.commitPickTrust, commitPickWant: r.flags.commitPickWant });
        E(`COMMIT d${dayOf(Game)}: ${firstName(rawName(Game, vid))} kind=${f && f.kind} trust=${trustOf(Game, vid)} pickTrust=${r.flags.commitPickTrust} pickWant=${r.flags.commitPickWant}`);
      }
      drove++;
    }
  }
  rec.openAtDeath = openPromiseCount(Game);
  E(`--- PRE-KILL d${dayOf(Game)}: bearer=${firstName(rawName(Game, Game.villagerId))}, roster ${((Game.state.village || {}).roster || []).length} living, OPEN PROMISES AT DEATH: ${rec.openAtDeath}`);

  // ---- the kill ----
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));
  if (process.env.DEBUG_DEATH) {
    try {
      const fl = (Game.state.village || {}).favorLedger || {};
      E('PRE-DEATH favorLedger: ' + Object.entries(fl).map(([vid, f]) => `${firstName(rawName(Game, vid))}:${f && f.state}:inhFrom=${f && f.inhFrom}:id=${f && f.id}`).join(' | '));
      const pr = (Game.state.village || {}).promises || {};
      E('PRE-DEATH promises: ' + Object.entries(pr).map(([vid, p]) => `${firstName(rawName(Game, vid))}:kept=${p && p.kept}:favorId=${p && p.favorId}`).join(' | '));
    } catch (e) {}
  }
  handoffSay.length = 0; capturing = true;
  Game.playerDeath('the expedition');
  capturing = false;
  if (process.env.DEBUG_DEATH) {
    try {
      const fl = (Game.state.village || {}).favorLedger || {};
      E('POST-DEATH favorLedger: ' + Object.entries(fl).map(([vid, f]) => `${firstName(rawName(Game, vid))}:${f && f.state}:inhFrom=${f && f.inhFrom}:id=${f && f.id}`).join(' | '));
    } catch (e) {}
  }
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  rec.mantle = {
    passed: newId !== oldId && !Game.over,
    oldFirst, newFirst,
    lineageEntry: !!(lastLin.cause && lastLin.villagerId === oldId),
  };
  rec.m1 = rec.mantle.passed && rec.mantle.lineageEntry;
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed} lineage=${rec.mantle.lineageEntry}`);
  // releasedAtHandoff: promises released BY THIS DEATH (kept='released' +
  // inherited flag) — distinct from betrayal.js's NPC-removal releases.
  try {
    rec.releasedAtHandoff = Object.values((Game.state.village || {}).promises || {})
      .filter(p => p && p.kept === 'released' && p.inherited === true).length;
  } catch (e) { rec.releasedAtHandoff = -1; }
  E(`RELEASED AT HANDOFF: ${rec.releasedAtHandoff}`);
  rec.openBookFired = handoffSay.some(l => /book stays open on the table/i.test(l.text));
  const bookLines = handoffSay.filter(l => /📜|book stays open|promises died/i.test(l.text));
  E(`OPEN-BOOK: fired=${rec.openBookFired} (open promises at death: ${rec.openAtDeath})`);
  for (const l of bookLines) E(`  📜 d${l.day}: ${l.text.slice(0, 260)}`);
  rec.handoffBookLines = bookLines.map(l => l.text);
  // M2: on seeds with >=1 promise released AT THE HANDOFF, the line must
  // fire. releasedAtHandoff (not openAtDeath) is the source of truth — it
  // excludes betrayal.js's NPC-removal releases, which the open book never
  // covers (the promiser lives; the promisee is gone).
  rec.m2 = rec.releasedAtHandoff > 0 ? rec.openBookFired : 'vacuous-no-open-promises';

  // ---- phase 2: the successor's days — chase released favors, close the loop ----
  // TWO-PASS HONESTY (r26 pilot fix): pass 1 never commits — it listens. The
  // driver commits (pass 2) ONLY if the NPC actually re-asked naming the
  // predecessor (the successor heard it in-fiction) OR the open-book beat
  // fired at the handoff (the successor read it in the book). Committing
  // blind to a variety-line re-ask is driver omniscience, not play.
  let reaskCount = 0;
  const askers = () => {
    const out = [];
    try {
      const fl = (Game.state.village || {}).favorLedger || {};
      for (const [vid, f] of Object.entries(fl)) {
        if (f && f.state === 'asked' && f.inhFrom && npcAlive(Game, vid)) out.push({ vid, kind: f.kind, inhFrom: f.inhFrom });
      }
    } catch (e) {}
    return out;
  };
  const closedVids = new Set();
  const pass1Seen = {};
  for (let d = KILL_DAY + 1; d <= END_DAY; d++) {
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} — stopping`); break; }
    await runDays(Game, competent, { days: 1 });
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} — stopping`); break; }
    const list = askers().filter(a => !closedVids.has(a.vid));
    if (process.env.DEBUG_ASKERS && d <= KILL_DAY + 3) {
      try {
        const fl = (Game.state.village || {}).favorLedger || {};
        const states = Object.entries(fl).map(([vid, f]) => `${firstName(rawName(Game, vid))}:${f && f.kind}:${f && f.state}:inhFrom=${(f && f.inhFrom) || 'none'}:id=${f && f.id}:alive=${npcAlive(Game, vid)}`).join(' | ');
        E(`ASKERS d${dayOf(Game)}: list=${list.length} ledger=[${states}]`);
      } catch (e) {}
    }
    if (!list.length) continue;
    for (const a of list) {
      const r = driveConvo(Game, a.vid, `reask-watch d${dayOf(Game)}`, () => false);
      pass1Seen[a.vid] = (pass1Seen[a.vid] || 0) + 1;
      if (pass1Seen[a.vid] <= 2) { E(`\n===== REASK-WATCH d${dayOf(Game)} (${firstName(rawName(Game, a.vid))}, favor ${a.kind}, inhFrom ${a.inhFrom}) =====`); E(r.text); }
      let heard = false;
      if (r.flags.inheritedReask) {
        reaskCount++; heard = true;
        E(`RE-ASK FIRED d${dayOf(Game)}: ${r.inheritedLine}`);
        rec.notes.push(`re-ask fired d${dayOf(Game)} from ${firstName(rawName(Game, a.vid))}: ${r.inheritedLine}`);
      } else if (rec.openBookFired) {
        heard = true; // the successor read the book — the ask is known in-fiction
        rec.notes.push(`d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))} re-asked WITHOUT the inherited line (variety/fresh opener); successor commits from the open book`);
      } else {
        rec.notes.push(`d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))} re-asked WITHOUT the inherited line and no open book — successor does NOT commit (never heard the debt in-fiction)`);
      }
      if (!heard) continue;
      const r2 = driveConvo(Game, a.vid, `reask-commit d${dayOf(Game)}`, () => true);
      const rc = r2;
      if (rc.committed && !closedVids.has(a.vid)) {
        closedVids.add(a.vid);
        const kind = (favorOf(Game, a.vid) || {}).kind || a.kind;
        const trustBefore = trustOf(Game, a.vid);
        let foodUnits = 0;
        try { foodUnits = (Game.state.scholar.inventory || []).filter(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0).reduce((s, i) => s + i.units, 0); } catch (e) {}
        E(`COMMITTED to re-ask d${dayOf(Game)}: kind=${kind} trustBefore=${trustBefore} scholarFoodUnits=${foodUnits}`);
        const act = fulfillAction(Game, a.vid, kind) + ` (scholarFoodUnits=${foodUnits})`;
        E(`FULFILL-ACTION: ${act}`);
        if (kind === 'stay_close') {
          // social keep: drive one more substantive convo
          const r2 = driveConvo(Game, a.vid, `social-keep d${dayOf(Game)}`, () => false);
          E(r2.text.split('\n').slice(0, 12).join('\n'));
        }
        if (kind === 'water_haul' || kind === 'snare_mend' || kind === 'watch_shift') {
          // task keep is a day-resolution broadcast: play 2 days, re-check
          await runDays(Game, competent, { days: 2 });
        }
        const p = openPromise(Game, a.vid);
        const f = favorOf(Game, a.vid);
        const keptNow = !p; // promise no longer open
        E(`POST-FULFILL: promiseOpen=${!!p} favorState=${f && f.state}`);
        // the repay convo: gratitude should fire -> 'thanked'
        const r3 = driveConvo(Game, a.vid, `repay d${dayOf(Game)}`, () => false);
        const f2 = favorOf(Game, a.vid);
        const trustAfter = trustOf(Game, a.vid);
        E(`POST-REPAY: favorState=${f2 && f2.state} thankedInTranscript=${r3.flags.thanked} trust ${trustBefore} -> ${trustAfter}`);
        E(r3.text);
        // zombie scan: no unkept promise with the old maker's id
        let zombies = 0;
        try {
          for (const [, pp] of Object.entries((Game.state.village || {}).promises || {})) {
            if (pp && !pp.kept && pp.maker === oldId) zombies++;
          }
        } catch (e) {}
        const closed = keptNow && f2 && f2.state === 'thanked' && r3.flags.thanked && zombies === 0;
        rec.loopCloses.push({
          day: dayOf(Game), vid: firstName(rawName(Game, a.vid)), kind,
          fulfillAction: act, favorState: f2 && f2.state, thanked: r3.flags.thanked,
          trustBefore, trustAfter, zombies, closed: !!closed,
        });
        E(`LOOP-CLOSE: ${closed ? 'CLOSED CLEANLY' : 'INCOMPLETE'} ${JSON.stringify(rec.loopCloses[rec.loopCloses.length - 1])}`);
      }
    }
  }
  rec.reaskCount = reaskCount;
  rec.m3 = rec.loopCloses.some(c => c.closed) ? true : (reaskCount > 0 ? 'reask-fired-no-close' : 'no-reask');

  // ---- census (plain words material) ----
  try {
    const vv = Game.state.village || {};
    rec.census = {
      day: dayOf(Game), living: (vv.roster || []).length,
      fallen: (vv.fallen || []).length,
      promisesOpen: openPromiseCount(Game),
      promisesReleased: Object.values(vv.promises || {}).filter(p => p && p.kept === 'released').length,
      favorStates: Object.values(vv.favorLedger || {}).map(f => f && f.state).filter(Boolean).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {}),
    };
  } catch (e) {}

  Game.say = _say;
  // ---- telemetry snapshot (same keys as r25, for telemetry-check vs succession.json) ----
  try {
    rec.tele = {
      'deaths.bearer': 1,
      'census.alive': ((Game.state.village || {}).roster || []).length,
      'census.fallen': ((Game.state.village || {}).fallen || []).length,
      'census.integrationStage': (() => { try { return Game.integrationStage(); } catch (e) { return 0; } })(),
      'week2.deadBearerMentions': reaskCount,
    };
    E(`TELE: ${JSON.stringify(rec.tele)}`);
    fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r26-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  } catch (e) { rec.anomalies.push('tele snapshot threw: ' + e.message); }
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
