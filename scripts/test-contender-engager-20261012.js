#!/usr/bin/env node
// test-contender-engager-20261012.js — proof for longsim trust r4.
// The blank: leadership challenges fired 148-195/run in long sims but NO
// policy ever answered them — every challenge auto-resolved into a contender
// domain-takeover after 8 parts (the cascade). The contender-engager policy
// answers: coalition (askSupport), yield-to-competence, stand-ground-on-
// weakness, pre-emptive rally, and it respects yielded domains (taskLeads).
//   1. Challenge vs a natural (comp>=1.2) -> yield: taskLead set, heat reset,
//      trust +10 (bumpTrust), challenge cleared.
//   2. Challenge vs someone who'd mismanage it (comp<1.0) -> stand ground:
//      trust -5, heat reset, challenge cleared, NO taskLead.
//   3. assignTask over a taskLead domain -> refused (leadsRespected++), no
//      assignment; a free task still assigns.
//   4. Heat at 2+ with no active challenge -> rally fires, heat cooled.
//   5. REGRESSION: no challenge ignored — engageContenders answers any active
//      challenge (challengesAnswered increments), the decision matches the
//      merit rule against the real villagerCompetence.
// Also covers the two r4 rendering fixes:
//   6. Gossip fragment "X telling Y about Y" -> reflexive ("about herself").
//   7. "What I miss most? the noise." -> capitalized ("The noise").
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

for (const f of ['src/js/game.js', 'src/js/convoTopics.js', 'scripts/policies/contender-engager.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(__dirname, '..', f)], { stdio: 'pipe' }); }
  catch (e) { console.log('FAIL syntax ' + f); process.exit(1); }
}
console.log('PASS syntax (3 files)');

const { loadGame, setupGame } = require('./sim-harness');
const { engageContenders, respectLeads } = require('./policies/contender-engager');

const TASKS = ['garden', 'fish', 'water', 'cook', 'wood', 'hunt', 'patrol', 'forage'];

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof', fullTelemetry: false });
  await setupGame(Game);
  Game.say = function () {};
  return Game;
}

// findCase(pred): scan seeds for a contender+task matching pred(cid, task, comp)
async function findCase(pred, baseSeed) {
  for (let s = baseSeed; s < baseSeed + 40; s++) {
    const Game = await freshGame(s);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const contenders = roster.filter(id => { try { return Game.npcGoal(id) === 'lead'; } catch (e) { return false; } });
    for (const cid of contenders) for (const task of TASKS) {
      let comp = 1;
      try { comp = Game.villagerCompetence(cid, task); } catch (e) {}
      if (pred(cid, task, comp)) return { Game, cid, task, comp, seed: s };
    }
  }
  return null;
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('PASS ' + name); }
    else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };
  const baseSeed = parseInt(process.env.SEED || '20261012', 10);

  // 1. yield to a natural (comp>=1.2)
  const yc = await findCase((cid, task, comp) => comp >= 1.2, baseSeed);
  ok('found a natural (comp>=1.2) contender', !!yc, yc ? 'seed=' + yc.seed + ' ' + yc.task + '@' + yc.comp : '');
  if (yc) {
    const { Game, cid, task } = yc;
    const v = Game.state.village;
    const ctx = {};
    const t0 = (v.trust || {})[cid];
    v.challenge = { cid, task, age: 3 };
    try { engageContenders(Game, ctx); } catch (e) { ok('yield engage no-throw', false, e.message); }
    const L = ctx.leadEngage || {};
    ok('yield: challenge answered', (L.challengesAnswered || 0) === 1);
    ok('yield: counted as yielded', (L.challengesYielded || 0) === 1);
    ok('yield: domain handed over', (v.taskLeads || {})[task] === cid);
    ok('yield: challenge cleared', !v.challenge);
    ok('yield: heat reset', ((v.heat || {})[cid] || 0) === 0);
    const t1 = (v.trust || {})[cid];
    ok('yield: trust rose (+10 via bumpTrust)', t1 > t0, 'before=' + t0 + ' after=' + t1);
  }

  // 2. stand ground vs incompetence (comp<1.0)
  // Prepared cautious leader: test the stand-ground response against real
  // competence, instead of hoping forty fresh rosters contain this trait/job.
  const sc = await (async () => {
    const Game = await freshGame(baseSeed + 100), roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
    for (const cid of roster.filter(id => Game.npcGoal(id) === 'lead')) {
      const person = Game.getPerson(cid), old = person.personality;
      person.personality = { ...old, temperament: 'cautious' };
      for (const task of TASKS) { const comp = Game.villagerCompetence(cid, task); if (comp < 1.0) return { Game, cid, task, comp, seed: baseSeed + 100 }; }
      person.personality = old;
    }
    return null;
  })();
  ok('found a weak contender pairing (comp<1.0)', !!sc, sc ? 'seed=' + sc.seed + ' ' + sc.task + '@' + sc.comp : '');
  if (sc) {
    const { Game, cid, task } = sc;
    const v = Game.state.village;
    const ctx = {};
    try { delete v.taskLeads[task]; } catch (e) {}
    const t0 = (v.trust || {})[cid];
    v.challenge = { cid, task, age: 5 };
    try { engageContenders(Game, ctx); } catch (e) { ok('stand engage no-throw', false, e.message); }
    const L = ctx.leadEngage || {};
    ok('stand: challenge answered', (L.challengesAnswered || 0) === 1);
    ok('stand: counted as stood-ground', (L.challengesStoodGround || 0) === 1);
    ok('stand: NO domain handed over', ((v.taskLeads || {})[task] || null) !== cid);
    ok('stand: challenge cleared', !v.challenge);
    const t1 = (v.trust || {})[cid];
    ok('stand: trust fell (-5)', t1 < t0, 'before=' + t0 + ' after=' + t1);
  }

  // 3. respect yielded domains
  {
    const Game = await freshGame(baseSeed + 200);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const ctx = {};
    respectLeads(Game, ctx);
    const leadCid = roster[0];
    v.taskLeads = v.taskLeads || {};
    v.taskLeads.garden = leadCid;
    const freeVid = roster[1];
    const before = (ctx.leadEngage || {}).leadsRespected || 0;
    let r = null;
    try { r = Game.assignTask(freeVid, 'garden', { via: 'in-person' }); } catch (e) { r = { threw: e.message }; }
    const after = (ctx.leadEngage || {}).leadsRespected || 0;
    ok('respect: garden blocked over contender domain', r && r.respected === true);
    ok('respect: counter incremented', after === before + 1, before + '->' + after);
    ok('respect: no assignment written', ((v.assignments || {})[freeVid] || {}).task !== 'garden');
    // a free task still assigns (obedience may refuse honestly — either way it's not the respect block)
    let r2 = null;
    try { r2 = Game.assignTask(freeVid, 'fish', { via: 'in-person' }); } catch (e) { r2 = { threw: e.message }; }
    ok('respect: free task not blocked', !(r2 && r2.respected));
  }

  // 4. rally cools heat
  {
    const Game = await freshGame(baseSeed + 300);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const cid = roster[0];
    v.challenge = null;
    v.heat = v.heat || {};
    v.heat[cid] = 3;
    const ctx = {};
    try { engageContenders(Game, ctx); } catch (e) { ok('rally engage no-throw', false, e.message); }
    ok('rally fired', ((ctx.leadEngage || {}).rallies || 0) === 1);
    ok('rally cooled heat by 2', (v.heat[cid] || 0) === 1, 'heat=' + v.heat[cid]);
  }

  // 5. merit-rule honesty on an arbitrary challenge
  {
    const Game = await freshGame(baseSeed + 400);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    const cid = roster[0];
    const task = 'fish';
    let comp = 1;
    try { comp = Game.villagerCompetence(cid, task); } catch (e) {}
    const cidTrust = (v.trust || {})[cid] === undefined ? 10 : v.trust[cid];
    const expectYield = comp >= 1.2 || (comp >= 1.0 && cidTrust >= 30);
    try { delete v.taskLeads[task]; } catch (e) {}
    v.challenge = { cid, task, age: 1 };
    const ctx = {};
    try { engageContenders(Game, ctx); } catch (e) { ok('rule engage no-throw', false, e.message); }
    const gotYield = (v.taskLeads || {})[task] === cid;
    ok('decision matches merit rule (real villagerCompetence)', gotYield === expectYield,
      'comp=' + comp + ' trust=' + cidTrust + ' expectYield=' + expectYield + ' got=' + gotYield);
  }

  // 6. "X telling Y about Y" -> reflexive pronoun
  {
    const Game = await freshGame(baseSeed + 500);
    const lines = [];
    Game.say = function (t) { lines.push(String(t)); };
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    // Force the tell-to-the-subject scenario: the subject is the ONLY
    // candidate listener (everyone else already heard), so the teller tells
    // the listener about THEMSELVES — the "Luz telling Lena about Lena" case.
    const subject = roster[1], teller = roster[0];
    const today = (Game.state.scholar || {}).day || 0;
    v.gossip = [{
      action: 'order', dims: { who: subject },
      heard: [teller], // re-armed each iteration below
      distortion: 1, partKey: 'fragtest-' + Date.now(), day: today,
    }];
    // re-arm the tell each iteration (one tell per call otherwise): keep the
    // roster to player+teller+subject so the subject is the only listener.
    const keepRoster = v.roster;
    v.roster = [Game.villagerId, teller, subject];
    // This is a rendering proof, not a probability estimate. Force the
    // real spread/distortion/overhear gates and retain all output assertions.
    const random = Math.random;
    Math.random = () => 0;
    try {
    for (let i = 0; i < 100; i++) {
      v.gossip[0].heard = [teller];
      v.gossip[0].distortion = 1;
      try { Game.spreadGossip(); } catch (e) { throw new Error('Prepared gossip failed: ' + e.message, { cause: e }); }
      if (lines.some(l => l.includes('fragments by the fire') && l.includes('telling'))) break;
    }
    } finally { Math.random = random; }
    v.roster = keepRoster;
    const frags = lines.filter(l => l.includes('fragments by the fire') && l.includes('telling'));
    ok('fragment fired', frags.length > 0);
    const lv = (Game.getPerson(subject) || {});
    const pro = lv.pro || 'they';
    const reflexive = pro === 'she' ? 'herself' : pro === 'he' ? 'himself' : 'themself';
    ok('listener-subject rendered reflexive', frags.some(l => l.includes('about ' + reflexive + '.')),
      'pro=' + pro + ' frags=' + frags.length + (frags[0] ? ' e.g. ' + frags[0].slice(0, 140) : ''));
    ok('no "telling Y about Y" doubling', !frags.some(l => {
      const m = l.match(/telling (.+?) about (.+?)\./);
      return m && m[1] === m[2];
    }));
  }

  // 7. "What I miss most?" capitalization
  {
    const Game = await freshGame(baseSeed + 600);
    const v = Game.state.village;
    const roster = v.roster.filter(id => id !== Game.villagerId);
    let got = null;
    for (let i = 0; i < 30 && !got; i++) {
      let arr = null;
      try { arr = Game.t2fol_oldworld(roster[2]); } catch (e) { break; }
      const flat = (arr || []).reduce((a, x) => a.concat(x), []);
      got = flat.find(l => typeof l === 'string' && l.includes('What I miss most?'));
    }
    ok('line reachable', !!got);
    if (got) ok('capitalized after "? "', /What I miss most\? [A-Z]/.test(got), got.slice(0, 60));
  }

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})();
