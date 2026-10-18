#!/usr/bin/env node
// journey-succession-r25-20261018.js — SUCCESSION LEG r25: "THE LEDGER ACROSS THE GRAVE"
// Journey leg 7: death of the player character, the mantle passing — the
// favor ledger. When the bearer <redacted> with an open PROMISED favor, playerDeath
// (ledger.js) releases the promise (kept='released', inherited=true) and
// reverts the favor instance to 'asked' (r13 CHAIN5 proved the release;
// its F-REASK finding — does the NPC actually re-ask the successor, naming
// the predecessor? — was documented-not-gated, no note survives).
//
// LEG QUESTION: does the soul ledger survive the grave HONESTLY? The NPC
// re-ask path (convo-wants.js opener -> convoFavorFollowup, the 2026-10-11
// INHERITED ASK line "I asked {pred} about {short} — {pred}'s gone. Still
// need hands. Are you in?") exists in code. Does it ever fire in real play?
// And when the successor commits, is the new obligation THEIRS
// (maker=newId), not a zombie of the dead bearer's word?
//
// INTERESTING-FINDING CRITERIA:
//   (a) M2 fails anywhere -> the release machinery REGRESSED (r13 CHAIN5) —
//       REAL BUG, fix justified.
//   (b) re-ask fires with the inherited line -> sense-read: honest or robotic?
//   (c) re-ask never fires -> WHY: need died (moot path), kind changed
//       (moot), want never selected (ask_favor starved), NPC dead/gone.
//       Each cause has a different fix.
//   (d) successor commits -> new promise maker === newId, deadline refreshed
//       from the re-ask day. maker === oldId -> ZOMBIE OBLIGATION bug.
//   (e) successor ignores the re-ask (asked, never promised) -> no decay
//       blame on the successor for the predecessor's ask (document either way).
//
// SEEDS: 7101, 7102, 7103, 7104 (fresh; r23 used 5101-5104, r24 6101-6104).
// POLICY: competent. HORIZON: promise forced d12, kill d12, successor plays
// to d24 (12 days for the re-ask to surface; the need must stay live).
// Death-aware: village dead/scattered -> stop.
// PRIMARY METRICS (binding, MEASUREMENT.md §14):
//   M1: >=3/4 mantles pass cleanly (new bearer, lineage entry, game continues).
//   M2 (mechanism): on all seeds — post-mantle: the promise is
//       kept==='released' + inherited===true, its favor back to 'asked',
//       favor.inhFrom stamped with the old bearer's name. <3/4 -> REGRESSION.
//   M3 (people): >=2/4 seeds — the NPC re-asks the successor within d24 AND
//       names the predecessor in the line. Misses are documented with cause,
//       not re-scored.
//   M4 (sense): >=2/4 seeds — a full re-ask transcript meets the quality bar
//       (NPC wants something real, options engage/deflect, ending resolves).
// KILL RULE: mantle fails to pass on >=2/4 seeds -> SUBSTRATE-MISSING.
//
// Usage: SEED=7101 node scripts/journey-succession-r25-20261018.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '7101', 10);
const KILL_DAY = 12, END_DAY = 24;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function npcAlive(Game, vid) {
  try { return ((Game.state.village || {}).roster || []).includes(vid); } catch (e) { return false; }
}

// Conversation driver: chase the favor want, commit when offered, else engage.
function driveConvo(Game, vid, tag, oldFirst, maxTurns) {
  maxTurns = maxTurns || 16;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)}`];
  const seen = [];
  let refused = false, committed = false, inheritedLine = null;
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', committed: false, inheritedLine: null, flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    out.push(`(convo refused or never opened)`);
    return { text: out.join('\n'), refused, committed: false, inheritedLine: null, flags: { want: (c0 && c0.want && c0.want.id) || 'none' } };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    // snapshot any NPC line for the inherited re-ask detection
    let pick = choices.find(c => c.id === 'dlg:commit');
    if (!pick) pick = choices.find(c => /^want:/.test(c.id) && /favor/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^want:/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 110)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    if (pick.id === 'dlg:commit') committed = true;
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  const full = [];
  for (const e of ((c && c.transcript) || [])) {
    const line = `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`;
    full.push(line); seen.push(line);
  }
  const txt = full.join('\n');
  // inherited re-ask detection: "I asked {pred} about {short} — {pred}'s gone."
  const m = txt.match(/I asked (\S+) about .*? — \1's gone/i);
  if (m) inheritedLine = m[0].slice(0, 160);
  const flags = {
    want: (c && c.want && c.want.id) || 'none',
    inheritedReask: !!m,
    namedPredecessor: oldFirst ? new RegExp('\\b' + oldFirst + '\\b', 'i').test(txt) : false,
  };
  out.push('\n### FULL TRANSCRIPT');
  out.push(full.join('\n'));
  out.push(`\nCARRY-FLAGS: want=${flags.want} inheritedReask=${flags.inheritedReask} namedPredecessor=${flags.namedPredecessor} committed=${committed}`);
  return { text: out.join('\n'), refused: false, committed, inheritedLine, flags, fullText: txt };
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  mantle: {}, promisePre: null, postMantle: null, reasks: [], sense: [],
  m1: null, m2: null, m3: null, m4: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r25', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  const _say = Game.say;
  const handoffSay = [];
  let capturing = false;
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) handoffSay.push({ day: dayOf(Game), text: s.slice(0, 400) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: establish ----
  await runDays(Game, competent, { days: KILL_DAY });
  if (Game.over) { rec.notes.push('village over before the kill — seed skipped'); console.log(JSON.stringify(rec)); return; }
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));
  const v = Game.state.village || {};
  E(`--- PRE-KILL d${dayOf(Game)}: bearer <redacted>, roster ${(v.roster || []).length} living`);

  // ---- force the promised favor: highest-trust NPC with a live need ----
  const trust = v.trust || {};
  const npcIds = (v.roster || []).filter(id => id !== oldId);
  npcIds.sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
  // ASKER SELECTION: skip the top-2 trust NPCs — the successor is the
  // highest-trust living NPC, and if the asker IS the successor the ask
  // becomes self-referential (the NPC who would re-ask no longer exists as
  // an NPC; a player can never convo themselves — startConvo(self) "opens"
  // in the engine but is unreachable in the UI). The re-ask is structurally
  // undefined there, so those seeds would test nothing.
  const askerPool = npcIds.slice(2);
  let favorVid = null, favor = null, need = null;
  for (const vid of (askerPool.length ? askerPool : npcIds)) {
    try {
      const nd = Game.convoFindFavorNeed ? Game.convoFindFavorNeed(vid) : null;
      if (!nd) continue;
      const f = Game.convoBuildFavor(vid, nd);
      if (!f || !f.task) continue;
      favorVid = vid; favor = f; need = nd; break;
    } catch (e) { /* try next */ }
  }
  if (!favorVid) {
    rec.notes.push('no NPC with a live favor need at d12 — seed skipped (no ask to test)');
    console.log(JSON.stringify(rec)); return;
  }
  try { Game.convoStoreFavor(favor); } catch (e) { rec.anomalies.push('storeFavor threw: ' + e.message); }
  let commitRes = null;
  try { commitRes = Game.convoFavorCommit(favorVid, favor); } catch (e) { rec.anomalies.push('favorCommit threw: ' + e.message); }
  const favorVidFirst = firstName(rawName(Game, favorVid));
  rec.promisePre = {
    vid: favorVid, vidFirst: favorVidFirst, kind: need.kind, task: (favor.task || '').slice(0, 80),
    committed: !!(commitRes && commitRes.ok), favorState: favor.state,
    promise: (() => { try { const p = (v.promises || {})[favorVid]; return p ? { kept: p.kept, maker: firstName(rawName(Game, p.maker)), favorId: p.favorId === favor.id } : null; } catch (e) { return { err: 1 }; } })(),
  };
  E(`FAVOR FORCED: ${favorVidFirst} kind=${need.kind} task="${(favor.task || '').slice(0, 70)}" commit=${rec.promisePre.committed} promise=${JSON.stringify(rec.promisePre.promise)}`);
  if (!rec.promisePre.committed) { rec.notes.push('favor commit failed — seed skipped'); console.log(JSON.stringify(rec)); return; }

  // ---- the kill ----
  handoffSay.length = 0; capturing = true;
  Game.playerDeath('the expedition');
  capturing = false;
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  rec.mantle = {
    passed: newId !== oldId && !Game.over,
    oldFirst, newFirst,
    lineageEntry: !!(lastLin.cause && lastLin.villagerId === oldId),
  };
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed}`);
  rec.m1 = rec.mantle.passed && rec.mantle.lineageEntry;
  E('HANDOFF SAY (' + handoffSay.length + ' captured):');
  for (const l of handoffSay) E(`  d${l.day}: ${l.text.slice(0, 200)}`);
  rec.handoffSay = handoffSay.map(l => l.text);

  // ---- M2: the post-mantle ledger ----
  let m2 = { released: false, inherited: false, favorAsked: false, stamped: false };
  try {
    const vv = Game.state.village || {};
    const p = (vv.promises || {})[favorVid];
    const f = (vv.favorLedger || {})[favorVid];
    m2.released = !!(p && p.kept === 'released');
    m2.inherited = !!(p && p.inherited === true);
    m2.favorAsked = !!(f && f.state === 'asked');
    m2.stamped = !!(f && f.inhFrom && String(f.inhFrom).split(' ')[0] === oldFirst);
    rec.postMantle = {
      promise: p ? { kept: p.kept, inherited: !!p.inherited, maker: firstName(rawName(Game, p.maker)) } : null,
      favor: f ? { state: f.state, inhFrom: f.inhFrom || null, kind: f.kind } : null,
    };
  } catch (e) { rec.anomalies.push('M2 read threw: ' + e.message); }
  rec.m2 = m2.released && m2.inherited && m2.favorAsked && m2.stamped;
  E(`M2: promise=${JSON.stringify(rec.postMantle && rec.postMantle.promise)} favor=${JSON.stringify(rec.postMantle && rec.postMantle.favor)} -> ${rec.m2 ? 'GO' : 'MISS'}`);

  // ---- phase 2: the successor's days — drive a convo with the asker each day ----
  let reaskFired = false, reaskDay = null, reaskTranscript = null, commitAfterReask = null;
  let askerAliveDays = 0;
  if (favorVid === newId) {
    rec.notes.push('asker became the successor — the ask is self-referential and the re-ask is structurally undefined (no NPC left to ask); seed tests M1/M2 only');
  } else for (let d = KILL_DAY + 1; d <= END_DAY; d++) {
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} — stopping`); break; }
    await runDays(Game, competent, { days: 1 });
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} — stopping`); break; }
    if (!npcAlive(Game, favorVid)) { rec.notes.push(`${favorVidFirst} not alive on d${dayOf(Game)} — convo skipped`); continue; }
    askerAliveDays++;
    const r = driveConvo(Game, favorVid, `reask-watch d${dayOf(Game)}`, oldFirst);
    rec.reasks.push({ day: dayOf(Game), inheritedReask: r.flags.inheritedReask, namedPredecessor: r.flags.namedPredecessor, want: r.flags.want, committed: r.committed, refused: r.refused });
    if (askerAliveDays <= 2) { E(`\n===== TRANSCRIPT d${dayOf(Game)} (asker ${favorVidFirst}) =====`); E(r.text); }
    if (r.flags.inheritedReask && !reaskFired) {
      reaskFired = true; reaskDay = dayOf(Game); reaskTranscript = r.text;
      E(`RE-ASK FIRED d${reaskDay}: ${r.inheritedLine}`);
      // sense-check the successor's new obligation (was dlg:commit picked?)
      try {
        const vv2 = Game.state.village || {};
        const p2 = (vv2.promises || {})[favorVid];
        commitAfterReask = p2 ? { kept: p2.kept, maker: firstName(rawName(Game, p2.maker)), makerIsSuccessor: p2.maker === newId, deadline: p2.favorDeadline } : null;
        E(`POST-REASK promise: ${JSON.stringify(commitAfterReask)}`);
      } catch (e) { rec.anomalies.push('post-reask promise read threw: ' + e.message); }
    }
  }
  rec.m3 = (favorVid === newId) ? 'n/a-asker-is-successor' : reaskFired;
  rec.sense = { reaskDay, inheritedLineFired: reaskFired, askerAliveDays, commitAfterReask, askerIsSuccessor: favorVid === newId };
  E(`M3: re-ask ${reaskFired ? 'FIRED d' + reaskDay : 'never fired'} over ${askerAliveDays} asker-alive days`);

  // ---- diagnose the miss: why didn't the re-ask fire? ----
  if (!reaskFired && favorVid !== newId) {
    try {
      const vv = Game.state.village || {};
      const f = (vv.favorLedger || {})[favorVid];
      const nd = Game.convoFindFavorNeed ? Game.convoFindFavorNeed(favorVid) : 'n/a';
      const live = f ? (Game.convoFavorNeedLive ? Game.convoFavorNeedLive(f) : 'n/a') : 'no-favor';
      rec.missWhy = {
        favorState: f ? f.state : 'no-favor',
        needLive: live,
        currentNeedKind: nd && nd.kind ? nd.kind : (nd === null ? 'none' : nd),
        favorKind: f ? f.kind : null,
        askerAlive: npcAlive(Game, favorVid),
        wantsSeen: [...new Set(rec.reasks.map(r => r.want))],
      };
      E(`MISS-WHY: ${JSON.stringify(rec.missWhy)}`);
    } catch (e) { rec.anomalies.push('missWhy threw: ' + e.message); }
  }

  // ---- census (plain words material) ----
  try {
    const vv = Game.state.village || {};
    rec.census = {
      day: dayOf(Game), living: (vv.roster || []).length,
      fallen: (vv.fallen || []).length,
      promisesOpen: Object.values(vv.promises || {}).filter(p => p && !p.kept).length,
      promisesReleased: Object.values(vv.promises || {}).filter(p => p && p.kept === 'released').length,
      favorStates: Object.values(vv.favorLedger || {}).map(f => f && f.state).filter(Boolean).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {}),
    };
  } catch (e) {}

  Game.say = _say;
  // ---- telemetry snapshot (r24 key set, for telemetry-check vs the succession baseline) ----
  try {
    rec.tele = {
      'deaths.bearer': 1,
      'census.alive': ((Game.state.village || {}).roster || []).length,
      'census.fallen': ((Game.state.village || {}).fallen || []).length,
      'census.integrationStage': (() => { try { return Game.integrationStage(); } catch (e) { return 0; } })(),
      'week2.deadBearerMentions': (rec.reasks || []).filter(x => x && x.namedPredecessor).length,
    };
    E(`TELE: ${JSON.stringify(rec.tele)}`);
    require('fs').writeFileSync(`evidence/2026-10-18/journey-succession-r25-tele-${SEED}.json`,
      JSON.stringify(rec.tele, null, 1));
  } catch (e) { rec.anomalies.push('tele snapshot threw: ' + e.message); }
  if (reaskTranscript) { E('\n===== RE-ASK TRANSCRIPT ====='); E(reaskTranscript); }
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
