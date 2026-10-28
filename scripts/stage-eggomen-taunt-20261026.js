#!/usr/bin/env node
// stage-eggomen-taunt-20261026.js — staged muster assembly instrument
// (sim-eggomen-a, adversarial A1: the taunt case).
//
// One staged village per process. Stages N allied villages (links +
// rosters with free adults) at a given trust/opinion band, marks the
// watched titan's omen stage 2 (NOTICED), sounds the REAL call
// (Game.soundTitanCall) and reports the REAL readiness
// (Game.titanMusterReady) plus blade counts vs the titan's minAllies
// gate. Only the world is staged (links + rosters); quota arithmetic,
// refusal lines, and the gate are the game's own code.
//
// Link shape mirrors soundTitanCall's reads: status active, trust,
// theirSpeaker, arrears 0, Haven as primary. Roster adults are alive,
// age 30, health 100, uncommitted — the "free fighters" the call draws.
//
// Env: TAUNT_SEED (default 88301), TAUNT_TID (finale), TAUNT_LINKS (3),
//   TAUNT_TRUST (71), TAUNT_OPINION (10), TAUNT_ADULTS (10),
//   TAUNT_HAVEN (0: Haven blades committed via titanCommitOwn is NOT
//   staged here — the call alone is measured; Haven's 0-3 is a separate
//   player verb, reported as headroom in the evidence).
// Output: one JSON line on stdout. Writes nothing into the repo.
'use strict';
const H = require('./sim-harness');
const SEED = parseInt(process.env.TAUNT_SEED || '88301', 10);
const TID = process.env.TAUNT_TID || 'finale';
const NLINKS = parseInt(process.env.TAUNT_LINKS || '3', 10);
const TRUST = parseInt(process.env.TAUNT_TRUST || '71', 10);
const OPINION = parseInt(process.env.TAUNT_OPINION || '10', 10);
const ADULTS = parseInt(process.env.TAUNT_ADULTS || '10', 10);
// Per-link overrides (comma-separated, index-matched): TAUNT_TRUSTS,
// TAUNT_OPINIONS. When present, they replace the single-band values.
const TRUSTS = process.env.TAUNT_TRUSTS ? process.env.TAUNT_TRUSTS.split(',').map(s => parseInt(s.trim(), 10)) : null;
const OPINIONS = process.env.TAUNT_OPINIONS ? process.env.TAUNT_OPINIONS.split(',').map(s => parseInt(s.trim(), 10)) : null;

(async () => {
  const { Game: G } = await H.loadGame({ seed: SEED });
  await H.setupGame(G);
  try { G.depart(); } catch (e) {}
  G.state.scholar.day = 100;
  G.state.titans = { omens: {}, musters: {}, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' } };
  // Stage the coalition: N active links + N allied villages with rosters.
  const links = G.hierarchyState();
  G.state.otherVillages = G.state.otherVillages || [];
  for (let i = 0; i < NLINKS; i++) {
    // Distinctive ids: setupGame/depart worldgen already populates
    // otherVillages (e.g. village_0), and _otherVillage() returns the
    // FIRST match — a colliding id silently stages nothing (0 allies).
    const vid = 'taunt_village_' + i;
    const tr = TRUSTS ? TRUSTS[i] : TRUST;
    const op = OPINIONS ? OPINIONS[i] : OPINION;
    links.push({ primary: 'haven', subordinate: vid, status: 'active', trust: tr, arrears: 0, theirSpeaker: { id: 'spk_' + i, name: 'Speaker ' + i } });
    const roster = [];
    for (let j = 0; j < ADULTS; j++) roster.push({ id: 'v' + i + '_p' + j, name: 'Fighter ' + i + '-' + j, alive: true, age: 30, health: 100 });
    G.state.otherVillages.push({ id: vid, name: 'Village ' + i, opinion: op, generated: true, roster });
    // Fail loudly if the staged village is not the one the call will see.
    const ov = G._otherVillage ? G._otherVillage(vid) : null;
    if (!ov || !ov.roster || ov.roster.length !== ADULTS) throw new Error('taunt staging failed for ' + vid);
  }
  // NOTICED: omen stage 2 (the taunt case starts from a located titan).
  G.state.titans.omens[TID] = { stage: 2, day: 100, warned: {} };
  const def = G.titanDef ? G.titanDef(TID) : null;
  const gate = def ? def.minAllies : null;
  G.soundTitanCall(TID);
  const muster = G.titanMusterState ? G.titanMusterState(TID) : null;
  const allies = muster ? (muster.allies || []).length : 0;
  const ready = G.titanMusterReady ? !!G.titanMusterReady(TID) : null;
  console.log(JSON.stringify({ seed: SEED, tid: TID, links: NLINKS, trust: TRUST, opinion: OPINION, trusts: TRUSTS, opinions: OPINIONS, adultsPerVillage: ADULTS, gate, allies, ready, taunt: (gate != null && !ready) }));
  process.exit(0);
})().catch((e) => { console.error('TAUNT STAGE ERROR', e && e.stack || e); process.exit(1); });
