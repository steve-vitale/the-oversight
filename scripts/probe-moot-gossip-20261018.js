#!/usr/bin/env node
// probe-moot-gossip-20261018.js -- reachability probe for the two L3 zeros
// the pilot policy never exercises: (1) moots — the driver never convenes
// one; (2) gossip — the driver never picks ask:gossip. Question: are these
// systems reachable and playable, or dead content?
// TOOLING ONLY. Usage: node scripts/probe-moot-gossip-20261018.js
'use strict';
process.env.TRIBFLOOR = '1';
const { mulberry32, loadGame, setupGame } = require('./sim-harness');

function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

async function main() {
  const seed = parseInt(process.env.SEED || '4242', 10);
  const { Game } = await loadGame({ seed, mode: 'moot-gossip-probe', fullTelemetry: true });
  await setupGame(Game);
  const sid = safe(() => Game.villagerId, null);
  const roster = () => safe(() => (Game.state.village.roster || []).filter(id => id !== sid), []);
  const living = () => roster().filter(id => { try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; } });

  // ---- PART 1: create a betrayal case, then convene a moot ----
  console.log('--- MOOT REACHABILITY ---');
  const liv = living();
  console.log('living:', liv.length);
  // Force a theft-and-caught to seed a grievance/case path the honest way:
  // use the corruption psycho path? Simpler: call the case machinery directly
  // the way the game does after an ambush plot.
  let caseId = null;
  try {
    const accused = liv[0], target = liv[1];
    const plot = safe(() => Game.armPlot ? Game.armPlot(accused, [], target, { reasons: ['probe'], score: 50 }) : null, null);
    console.log('plot:', plot ? plot.id : 'armPlot missing');
    const c = safe(() => Game.openCase(plot || { id: 'probe', leader: accused, accomplices: [], target, witnesses: [] }, 'ambush'), null);
    caseId = c && c.id;
    console.log('case:', caseId, 'status:', c && c.status);
  } catch (e) { console.log('case setup failed:', e.message); }

  // Convene a moot the player way.
  let mootOut = null;
  try {
    mootOut = Game.callMoot ? Game.callMoot(caseId) : null;
    console.log('convene result:', mootOut === null ? 'null' : typeof mootOut);
  } catch (e) { console.log('convene threw:', e.message.slice(0, 200)); }
  const cases = safe(() => ((Game.state.village || {}).betrayal || {}).cases || [], []);
  const cc = cases.find(x => x.id === caseId);
  console.log('case after convene:', cc ? JSON.stringify({ status: cc.status, trial: !!cc.trial, awaitingPlayerVote: !!(cc.trial && cc.trial.awaitingPlayerVote) }) : 'missing');
  // Complete the moot: cast the player's vote.
  if (cc && cc.trial && cc.trial.awaitingPlayerVote) {
    try { Game.castPlayerVote(caseId, true); } catch (e) { console.log('castPlayerVote threw:', e.message.slice(0, 200)); }
    console.log('after player vote: status=', cc.status, 'convicted=', cc.trial && cc.trial.convicted);
  }

  // ---- PART 2: gossip ask in a live conversation ----
  console.log('--- GOSSIP REACHABILITY ---');
  const vid = living()[2] || living()[0];
  console.log('talking to:', vname(Game, vid));
  // gossip is trust/time-gated (effTrust>=20 || relAge>=5) — earn it first.
  try { if (Game.bumpTrust) Game.bumpTrust(vid, 30); } catch (e) {}
  try { Game.startConvo(vid); } catch (e) { console.log('startConvo failed:', e.message); }
  let choices = safe(() => Game.convoChoices(vid) || [], []);
  // The opener may hang a direct question (reactive menu: answers only).
  // Answer it first to reach the full menu.
  for (let round = 0; round < 3; round++) {
    const g0 = choices.find(x => x && String(x.id || '') === 'ask:gossip');
    if (g0) break;
    const ans = choices.find(x => x && /^ans:/.test(String(x.id || '')));
    const sil = choices.find(x => x && String(x.id || '') === 'silence');
    const pick = ans || sil;
    if (!pick) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    choices = safe(() => Game.convoChoices(vid) || [], []);
  }
  const g = choices.find(x => x && (String(x.id || '') === 'ask:gossip'));
  console.log('ask:gossip in menu:', !!g, g ? `label=${String(g.label).slice(0, 60)}` : '');
  if (!g) {
    // check gating: trust / relAge
    const t = safe(() => (Game.t2trust ? Game.t2trust(vid) : (Game.state.village.trust || {})[vid]), '?');
    console.log('trust:', t, 'menu ids:', choices.map(x => x && x.id).join(',').slice(0, 200));
  } else {
    const before = safe(() => (Game.convoGet(vid).transcript || []).length, 0);
    try { Game.convoTurn(vid, g.id); } catch (e) { console.log('convoTurn failed:', e.message); }
    const tr = safe(() => Game.convoGet(vid).transcript || [], []);
    const thread = safe(() => Game.convoGet(vid).thread, '?');
    console.log('thread after ask:', thread);
    for (const e of tr.slice(before)) {
      if (e.who !== 'you') console.log(`  NPC: ${String(e.text || '').slice(0, 200)}`);
    }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  console.log('DONE');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
