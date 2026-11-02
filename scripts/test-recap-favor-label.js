// test-recap-favor-label.js — proof test for the r108 recap-label fix
// (src/js/conversation.js: ask_favor recap names the ASKED favor when it is
// still live, falling back to the live scan otherwise).
// Three behavioral cases, each in its own process (one harness per process):
//   (a) follow-up + live favor: wound ask, hunger since -> recap must name
//       wound care, NOT food share (the r104 Tom bug, probe-verified).
//   (b) fresh ask, scan agrees: hurt villager, favor ask in-convo, recap in
//       the SAME convo -> recap must name wound care (no agree-case regress).
//   (c) scan fallback intact: a sitting ask_favor want with NO open favor,
//       and then with a MOOT ledger favor, must both label via the live scan
//       (food share here) — the fix must not name a dead favor.
// Usage: node scripts/test-recap-favor-label.js  (parent spawns CASE=a|b|c)
// No repo writes; verdicts print as "CASE x PASS/FAIL".
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  try { return (Game.state.village.roster || []).filter(id => ((Game.state.village.health || {})[id] ?? 100) > 0); } catch (e) { return []; }
}
function transcript(Game, vid) {
  try { return ((Game.convoGet(vid) || {}).transcript || []).map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 300)}`); } catch (e) { return []; }
}
function favorOf(Game, vid) {
  try { return (((Game.state.village || {}).favorLedger || {})[vid]) || null; } catch (e) { return null; }
}
function driveUntil(Game, vid, stopFn, maxTurns) {
  const r = Game.startConvo(vid);
  if (r && (r.refused || r.ended)) return { refused: true, stopped: false };
  const c0 = Game.convoGet(vid);
  if (!c0 || !c0.active) return { refused: true, stopped: false };
  let stopped = false;
  for (let t = 0; t < (maxTurns || 10); t++) {
    if (stopFn(Game, vid)) { stopped = true; break; }
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) break;
    const pick = choices.find(x => /^want:/.test(x.id)) || choices.find(x => /^(dlg:details|dlg:subject)$/.test(x.id)) || choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
    if (!pick) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) break;
  }
  if (!stopped && stopFn(Game, vid)) stopped = true;
  return { refused: false, stopped };
}
function takeRecap(Game, vid) {
  for (let t = 0; t < 12; t++) {
    const choices = Game.convoChoices(vid) || [];
    // Never recap on the first turn: the opener alone may not have logged a
    // thread yet, and an empty threadLog recaps as "just talking" (case c
    // failed exactly this way). One content pick first logs the thread.
    const recap = t === 0 ? null : choices.find(x => x.id === 'recap');
    let pick = recap;
    if (!pick) pick = choices.find(x => /^want:/.test(x.id)) || choices.find(x => /^(dlg:details|dlg:subject)$/.test(x.id)) || choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
    if (!pick) return null;
    const beforeN = transcript(Game, vid).length;
    try { Game.convoTurn(vid, pick.id); } catch (e) { return null; }
    if (pick.id === 'recap') return transcript(Game, vid).slice(beforeN).join(' | ').slice(0, 400);
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) return null;
  }
  return null;
}
async function askHealFavor(Game) {
  // Hurt villagers in roster order until one asks a heal_help favor that
  // persists after the conversation ends. Returns vid or null.
  const v = Game.state.village;
  v.health = v.health || {};
  for (const vid of livingRoster(Game).slice(0, 6)) {
    v.health[vid] = 50;
    const d = driveUntil(Game, vid, (G, x) => {
      const f = favorOf(G, x);
      return !!(f && (f.state === 'asked' || f.state === 'promised'));
    }, 10);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    const after = favorOf(Game, vid);
    if (d.stopped && after && after.kind === 'heal_help') return vid;
    v.health[vid] = 100;
  }
  return null;
}
async function runCase(which) {
  const seed = which === 'b' ? 39999 : 39998;
  const { Game } = await loadGame({ seed, mode: 'recap-proof-r108', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, competent, { days: 2 });
  const v = Game.state.village;
  v.health = v.health || {};
  if (which === 'b') {
    // Fresh ask + same-convo recap (scan agrees).
    let V = null;
    for (const vid of livingRoster(Game).slice(0, 6)) {
      v.health[vid] = 50;
      const r = Game.startConvo(vid);
      if (r && (r.refused || r.ended)) { v.health[vid] = 100; continue; }
      const c0 = Game.convoGet(vid);
      if (!c0 || !c0.active) { v.health[vid] = 100; continue; }
      let asked = false;
      for (let t = 0; t < 10 && !asked; t++) {
        const f = favorOf(Game, vid);
        if (f && f.kind === 'heal_help') { asked = true; break; }
        const choices = Game.convoChoices(vid) || [];
        const pick = choices.find(x => /^want:/.test(x.id)) || choices.find(x => /^(dlg:details|dlg:subject)$/.test(x.id)) || choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
        if (!pick) break;
        try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
        const cc = Game.convoGet(vid);
        if (!cc || !cc.active) break;
      }
      if (!asked) { try { Game.endConvo(vid, 'left'); } catch (e) {} v.health[vid] = 100; continue; }
      V = vid;
      const recap = takeRecap(Game, vid);
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      if (recap && /wound care/i.test(recap)) { console.log('CASE b PASS recap=' + JSON.stringify(recap)); return true; }
      console.log('CASE b FAIL recap=' + JSON.stringify(recap));
      return false;
    }
    console.log('CASE b FAIL no heal_help ask fired');
    return false;
  }
  const V = await askHealFavor(Game);
  if (!V) { console.log('CASE ' + which + ' FAIL no heal_help ask fired'); return false; }
  if (which === 'a') {
    v.health[V] = 50;
    try { Game.npcNeeds(V).hunger = 90; } catch (e) {}
    const r = Game.startConvo(V);
    if (r && (r.refused || r.ended)) { console.log('CASE a FAIL convo refused'); return false; }
    const recap = takeRecap(Game, V);
    try { Game.endConvo(V, 'left'); } catch (e) {}
    if (recap && /wound care/i.test(recap) && !/food share/i.test(recap)) { console.log('CASE a PASS recap=' + JSON.stringify(recap)); return true; }
    console.log('CASE a FAIL recap=' + JSON.stringify(recap));
    return false;
  }
  // (c) moot the favor, then a fresh food ask must label via the scan.
  const f = favorOf(Game, V);
  if (f) f.state = 'moot'; // proof state write: the favor is dead, need is not
  try { Game.npcNeeds(V).hunger = 90; } catch (e) {}
  v.health[V] = 100; // healed: no heal need competes with the food ask
  // (c) rewritten: a mooted favor cannot produce a follow-up ask at all (the
  // seed is consumed as unestablished and the convo falls back to small
  // talk, so no ask_favor thread exists to recap). The scan fallback is
  // therefore guarded at the label-function level: a sitting ask_favor want
  // with NO open favor, and then with a MOOT ledger favor, must both label
  // via the live scan (food share here). Behavioral fresh-ask agreement is
  // already covered by case (b).
  const W = livingRoster(Game).find(id => id !== V && !favorOf(Game, id));
  if (!W) { console.log('CASE c FAIL no favor-free villager'); return false; }
  try { Game.npcNeeds(W).hunger = 90; } catch (e) {}
  const r = Game.startConvo(W);
  if (r && (r.refused || r.ended)) { console.log('CASE c FAIL convo refused'); return false; }
  const cc = Game.convoGet(W);
  if (!cc || !cc.active) { console.log('CASE c FAIL convo never opened'); return false; }
  cc.want = { id: 'ask_favor' }; // proof state write: bare ask want, no favor
  let label1 = null, label2 = null;
  try { label1 = Game.convoTopicLabel(W, 'want'); } catch (e) { label1 = 'error:' + e.message; }
  try {
    Game.state.village.favorLedger = Game.state.village.favorLedger || {};
    Game.state.village.favorLedger[W] = { kind: 'heal_help', state: 'moot', vid: W }; // proof state write: dead favor
    label2 = Game.convoTopicLabel(W, 'want');
  } catch (e) { label2 = 'error:' + e.message; }
  try { Game.endConvo(W, 'left'); } catch (e) {}
  if (label1 === 'that food share' && label2 === 'that food share') { console.log('CASE c PASS labelNoFavor=' + JSON.stringify(label1) + ' labelMootFavor=' + JSON.stringify(label2)); return true; }
  console.log('CASE c FAIL labelNoFavor=' + JSON.stringify(label1) + ' labelMootFavor=' + JSON.stringify(label2));
  return false;
}

async function parent() {
  let ok = true;
  for (const c of ['a', 'b', 'c']) {
    try {
      const out = execFileSync('node', [path.join(__dirname, 'test-recap-favor-label.js'), 'case-' + c], { encoding: 'utf8', timeout: 120000 });
      process.stdout.write(out);
      if (!out.includes('CASE ' + c + ' PASS')) ok = false;
    } catch (e) {
      process.stdout.write((e.stdout || '') + (e.stderr || ''));
      console.log('CASE ' + c + ' FAIL (child error)');
      ok = false;
    }
  }
  console.log(ok ? 'RECAP-LABEL PROOF: ALL PASS' : 'RECAP-LABEL PROOF: FAILURES PRESENT');
  process.exit(ok ? 0 : 1);
}

if (process.argv[2] && process.argv[2].startsWith('case-')) {
  runCase(process.argv[2].slice(5)).then(ok => process.exit(ok ? 0 : 1)).catch(e => { console.error('CASE ERROR: ' + (e && e.stack || e)); process.exit(1); });
} else {
  parent().catch(e => { console.error('PROOF FAILED: ' + (e && e.stack || e)); process.exit(1); });
}
