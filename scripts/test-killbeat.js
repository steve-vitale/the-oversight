#!/usr/bin/env node
// test-killbeat.js — RED->GREEN proof for the killbeat misattribution fix
// (sim-killbeat 2026-10-20, axis scale-onramp, named next #5 from
// evidence/2026-10-20/sim-villagergear.md, corrected by the 1615Z judgment).
//
// The broadcast "brought down" beat (partyVictoryBeat, party-formal.js)
// named every party member for any fight they fought in — so the scholar's
// killing blow on d61 s64006 aired as "Tariq, Aurora brought down The
// Understudy. Together." while the transcript shows the scholar striking the
// final blow ("You STRIKE the understudy for 31... dropped the Understudy!").
// The fix keys the beat on the final-blow attribution (the _tbKilledBy stamp
// on each dying monster fighter — the same stamp recordWaveKill writes to
// waveKillLog): a scholar-finished fight names the scholar, never the
// companions.
//
// RED:  instrumented scholar-finished TB kill names the companions (the bug).
// GREEN: instrumented scholar-finished TB kill reads "You brought down The
//        Understudy." and names no companion.
// GUARDRAIL (binding): companion-finished fights are byte-identical to the
//        old format; the wave-3+ companion veteran-kill beat is unchanged.
//        Run over 4 seeds; texts must be deterministic across seeds.
//
// Sim-harness rules: seeded BEFORE eval (sim-harness does it), no Game.save
// stub, no copied eval boilerplate (godpath/lib.js kit), no absolute paths.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-killbeat');

const SEEDS = [1, 2, 3, 4];

// Instrumented TB kill through the FULL tbEnd path: the monster dies, the
// killing-blow source is stamped exactly like the damage path stamps it (see
// the TB KILL ATTRIBUTION site in game.js), then tbEnd resolves the record
// path (recordWaveKill -> waveKillLog, and the party-victory wrapper).
function instrumentedKill(Game, mid, killerKey) {
  const mf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'monster' && (f.mdef || {}).id === mid);
  if (!mf) return false;
  mf.hp = 0; mf.alive = false;
  mf._tbKilledBy = killerKey; // 'p' = scholar; a villager fighter key = companion
  Game.tbEnd('won');
  return true;
}

function setupParty(Game) {
  const scholarVid = Game.villagerId;
  const compVid = (Game.state.village.roster || []).find(id => id && id !== scholarVid);
  if (!compVid) return null;
  // Park the companion next to the scholar so the TB fight picks them up,
  // and put them in the FORMAL party so partyVictoryBeat fires (it keys on
  // partyMembers(), which excludes the scholar).
  const vpos = Game.state.village.positions || (Game.state.village.positions = {});
  vpos[compVid] = { mx: 2, my: 4 };
  const ps = Game.partyState();
  if (!ps.party.includes(compVid)) ps.party.push(compVid);
  return compVid;
}

function broadcastTexts(Game) {
  const out = [];
  const orig = Game.broadcastLine.bind(Game);
  Game.broadcastLine = (t) => { out.push(String(t)); return orig(t); };
  return { out, restore: () => { Game.broadcastLine = orig; } };
}

async function scholarCase(seed) {
  const Game = await K.load({ seed, narration: true });
  K.newRun(Game);
  const compVid = setupParty(Game);
  if (!compVid) return { ok: false, why: 'no companion on roster' };
  const bc = broadcastTexts(Game);
  K.fight(Game, 'understudy', { party: true, px: 2, py: 4 });
  const mf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'monster' && (f.mdef || {}).id === 'understudy');
  const joined = (Game.tbfight.fighters || []).some(f => f && f.kind === 'villager' && f.villagerId === compVid);
  const killed = instrumentedKill(Game, 'understudy', 'p'); // THE SCHOLAR finished it
  bc.restore();
  return { ok: joined && killed, texts: bc.out, compNames: [Game.displayName(compVid)], mname: (mf && mf.name) || 'The Understudy' };
}

async function companionCase(seed) {
  const Game = await K.load({ seed, narration: true });
  K.newRun(Game);
  const compVid = setupParty(Game);
  if (!compVid) return { ok: false, why: 'no companion on roster' };
  const bc = broadcastTexts(Game);
  K.fight(Game, 'understudy', { party: true, px: 2, py: 4 });
  const mf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'monster' && (f.mdef || {}).id === 'understudy');
  const cf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'villager' && f.villagerId === compVid);
  const killed = instrumentedKill(Game, 'understudy', cf ? cf.key : 'p'); // THE COMPANION finished it
  bc.restore();
  const members = Game.partyMembers().map(id => Game.displayName(id));
  return { ok: !!cf && killed, texts: bc.out, members, mname: (mf && mf.name) || 'The Understudy' };
}

async function veteranCase(seed) {
  // The d61 Strike veteran-kill beat — must be byte-identical before/after.
  const Game = await K.load({ seed, narration: true });
  K.newRun(Game);
  Game.state.systemArrived = true;
  const compVid = setupParty(Game);
  if (!compVid) return { ok: false, why: 'no companion on roster' };
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { said.push(String(t)); return origSay(t); };
  K.fight(Game, 'redactor', { party: true, px: 2, py: 4 });
  const cf = (Game.tbfight.fighters || []).find(f => f && f.kind === 'villager' && f.villagerId === compVid);
  const killed = instrumentedKill(Game, 'redactor', cf ? cf.key : 'p');
  Game.say = origSay;
  const line = said.find(t => /put down/.test(t) && /veteran kill/.test(t)) || '';
  const cname = Game.disp(compVid);
  const mname = (Game.data.monsters || []).find(m => m.id === 'redactor') || {};
  const mphrase = typeof Game.articlePhrase === 'function'
    ? Game.articlePhrase(Game.monsterNoun ? Game.monsterNoun('redactor') : (mname.name || 'redactor'), false)
    : (mname.name || 'redactor');
  const expected = `Oh — OH. Everybody saw that, right? ${cname} just put down ${mphrase}... on CAMERA. That's a veteran kill, folks. REMEMBER the name.`;
  return { ok: !!cf && killed, line, expected };
}

async function main() {
  const scholarTexts = [], compTexts = [], vetLines = [];
  for (const seed of SEEDS) {
    const s = await scholarCase(seed);
    T.ok(`seed ${seed}: scholar-finished fight runs`, s.ok, s.why || '');
    scholarTexts.push({ texts: s.texts, compNames: s.compNames, mname: s.mname });
    const c = await companionCase(seed);
    T.ok(`seed ${seed}: companion-finished fight runs`, c.ok, c.why || '');
    compTexts.push({ texts: c.texts, members: c.members, mname: c.mname });
    const v = await veteranCase(seed);
    T.ok(`seed ${seed}: wave-3 companion veteran beat fires`, v.ok && !!v.line);
    T.ok(`seed ${seed}: veteran beat byte-identical to its template`, v.line.includes(v.expected), v.line.slice(0, 120));
    vetLines.push(v.line);
  }

  T.section('PRIMARY — scholar-finished fight never names companions');
  for (let i = 0; i < SEEDS.length; i++) {
    const t = (scholarTexts[i].texts[0] || '');
    const expected = `You brought down ${scholarTexts[i].mname}.`;
    const compNamed = scholarTexts[i].compNames.some(nm => t.includes(nm));
    T.ok(`seed ${SEEDS[i]}: no companion named for the scholar's kill`,
      !compNamed && t === expected, t.slice(0, 140));
  }

  T.section('GUARDRAIL — companion-finished class byte-identical');
  for (let i = 0; i < SEEDS.length; i++) {
    const expected = `${compTexts[i].members.join(', ')} brought down ${compTexts[i].mname}. Together.`;
    T.ok(`seed ${SEEDS[i]}: companion-finished text unchanged`,
      compTexts[i].texts.some(t => t === expected), (compTexts[i].texts[0] || '').slice(0, 140));
  }
  // Cross-seed byte-equality is NOT expected: companion descriptors are
  // seed-random ("A person, maybe 30s" vs "maybe 60s..."). The guardrail is
  // per-seed exact-equality with the old-format template (above) plus the
  // veteran template check — the format is unchanged, only the names vary.

  T.section('sense read — the fixed beat as the player sees it');
  console.log('  SCHOLAR-FINISHED: ' + (scholarTexts[0].texts[0] || '(none)'));
  console.log('  COMPANION-FINISHED: ' + (compTexts[0].texts[0] || '(none)'));
  console.log('  VETERAN: ' + vetLines[0].slice(0, 160));

  T.done();
}

main().catch(e => { console.error('FATAL', e); process.exitCode = 1; });
