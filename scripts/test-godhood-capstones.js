// Proof test: GODHOOD CAPSTONES (Steve 2026-10-11).
// RED: run against pristine repo (no godhood.js) — S.Godhood undefined → fail.
// GREEN: with staged godhood.js + godhood.json loaded — all pass.
// Run: node scripts/test-godhood-capstones.js [--green]
'use strict';
const fs = require('fs');
const path = require('path');

const GREEN = process.argv.includes('--green');
const REPO = '/home/hatch/workspace/the-scattering';
const STAGE = '/home/hatch/workspace/godhood-staging';

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}

// ---- RED: godhood module must not exist on pristine repo ----
if (!GREEN) {
  const repoGodhoodJs = fs.existsSync(path.join(REPO, 'src/js/godhood.js'));
  const repoGodhoodJson = fs.existsSync(path.join(REPO, 'src/data/godhood.json'));
  ok(!repoGodhoodJs && !repoGodhoodJson, 'RED: no godhood.js/godhood.json in repo yet');
  console.log(`RED check: ${pass} pass, ${fail} fail — godhood not yet built (expected).`);
  process.exit(fail ? 1 : 0);
}

// ---- GREEN: load staged module + data ----
const S = {};
global.Scattering = S;
const godhoodJson = JSON.parse(fs.readFileSync(path.join(STAGE, 'godhood.json'), 'utf8'));
S.GODHOODS = godhoodJson;
const src = fs.readFileSync(path.join(STAGE, 'godhood.js'), 'utf8');
// stub browser globals the module doesn't need, then eval
eval(src);
const G = S.Godhood;

const abilities = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/abilities.json'), 'utf8'));
const abList = abilities.abilities || abilities;
const abIds = new Set(abList.map(a => a.id));
const synergies = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/synergies.json'), 'utf8'));
const synIds = new Set(synergies.map(s => s.id));
let items = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/items.json'), 'utf8'));
items = items.items || items;
const itemIds = new Set(items.map(i => i.id || i.itemId));

// (a) all 10 godhoods defined, requirements reference REAL ids
ok(godhoodJson.godhoods.length === 10, '10 godhoods defined');
for (const gh of godhoodJson.godhoods) {
  for (const a of gh.requires.abilities) ok(abIds.has(a), `${gh.id}: ability ${a} exists`);
  ok(gh.requires.synergies.some(s => synIds.has(s)), `${gh.id}: at least one synergy exists`);
  ok(gh.requires.items.some(i => itemIds.has(i)), `${gh.id}: at least one item exists`);
  ok(gh.capstone.verb && gh.capstone.mechanic && gh.capstone.cost && gh.capstone.weakness,
    `${gh.id}: capstone has verb+mechanic+cost+weakness`);
  ok(gh.recognition.systemLine && gh.recognition.systemLine.length > 40, `${gh.id}: recognition line`);
  ok(gh.hint && gh.hint.length > 20, `${gh.id}: hint line`);
  ok(gh.mythic.title && gh.mythic.desc, `${gh.id}: mythic identity`);
}

// (a2) completion detected from real state
function fullScholar(gh) {
  return {
    abilities: gh.requires.abilities.map(id => ({ id })),
    activeSynergies: [gh.requires.synergies[0]],
    inventory: [{ itemId: gh.requires.items[0] }],
    kcal: 5000, health: 100,
  };
}
for (const gh of godhoodJson.godhoods) {
  const sch = fullScholar(gh);
  // only the first synergy listed is guaranteed real; use a real one
  const realSyn = gh.requires.synergies.find(s => synIds.has(s));
  sch.activeSynergies = [realSyn];
  const c = G.godhoodCloseness(sch, gh);
  ok(c.complete, `${gh.id}: completion detected from real state`);
  ok(G.checkGodhood(sch).includes(gh.id), `${gh.id}: checkGodhood flags it`);
}

// (b) recognition fires once, played (5 beats, say/sysSay, broadcast)
for (const gh of godhoodJson.godhoods.slice(0, 3)) { // sample 3 for beat structure
  const sch = fullScholar(gh);
  sch.activeSynergies = [gh.requires.synergies.find(s => synIds.has(s))];
  const said = [], sysSaid = [];
  let broadcastKind = null;
  const game = {
    state: { scholar: sch, day: 90 },
    say: t => said.push(t),
    sysSay: t => sysSaid.push(t),
    broadcastStart: (k, m) => { broadcastKind = k; return true; },
  };
  const beats = G.recognitionCeremony(game, gh.id,
    [{ name: 'Mara', line: 'What... what are you now?' }], 'dusk');
  ok(beats && beats.length === 5, `${gh.id}: 5 ceremony beats`);
  ok(beats.map(b => b.beat).join(',') === 'stillness,witnesses,system,change,price',
    `${gh.id}: beat order stillness→witnesses→system→change→price`);
  ok(sysSaid.length === 1 && sysSaid[0].length > 40, `${gh.id}: System speaks once (Claptrap register)`);
  ok(said.length === 4, `${gh.id}: 4 played say beats (not a popup)`);
  ok(broadcastKind === 'ascension', `${gh.id}: broadcast cuts in`);
  ok(beats[3].mythic === gh.id, `${gh.id}: change beat carries mythic form`);
  ok(sch.godhood.active.includes(gh.id), `${gh.id}: marked active`);
  // fires once
  const again = G.recognitionCeremony(game, gh.id, [], 'dusk');
  ok(again === null, `${gh.id}: recognition fires once`);
}

// (c) capstone verbs work + are the biggest needle move
{
  // Shepherd: raise echo
  let sch = { godhood: { active: ['shepherd_of_the_dead'], capstoneUsed: {} } };
  const echo = G.raiseEcho(sch, { id: 'v1', name: 'Mara', hp: 40, dmg: 10 });
  ok(echo && echo.rounds === 3 && echo.final, 'shepherd: echo fights 3 rounds, death final');
  ok(G.raiseEcho(sch, { id: 'v2' }) === null, 'shepherd: once per fight');
  G.resetFightVerbs(sch);
  ok(G.raiseEcho(sch, { id: 'v2', name: 'Jeb' }).rounds === 3, 'shepherd: refreshes next fight');

  // Apex: choose terms
  sch = { godhood: { active: ['apex_predator'], capstoneUsed: {} } };
  const terms = G.chooseTerms(sch, 'ambush');
  ok(terms && terms.ambush.firstStrike, 'apex: ambush grants first strike');
  ok(G.chooseTerms(sch, 'range') === null, 'apex: cannot re-choose mid-fight');

  // Garden: feed multitude (titan logistics)
  sch = { godhood: { active: ['living_garden'], capstoneUsed: {} }, kcal: 1000 };
  const feast = G.feedMultitude(sch);
  ok(feast && feast.ok && feast.feeds >= 50, 'garden: feeds 50+ (army scale)');
  ok(sch.kcal === 800, 'garden: costs 200 kcal');
  ok(G.feedMultitude(sch) === null, 'garden: once per day');
  G.resetDayVerbs(sch);
  sch.kcal = 1000;
  ok(G.feedMultitude(sch).ok, 'garden: refreshes at dawn');

  // Army: turn pain (no cap — the needle)
  sch = { godhood: { active: ['one_person_army'], capstoneUsed: {} } };
  const ret = G.turnPain(sch, 450);
  ok(ret && ret.damage === 450, 'army: retaliates full 450 damage, no cap');
  ok(G.turnPain(sch, 100) === null, 'army: once per fight');

  // Seer: no lies
  sch = { godhood: { active: ['all_seeing'] } };
  ok(G.noLiesCheck(sch) === true, 'seer: lies fail');
  ok(G.noLiesCheck({ godhood: { active: [] } }) === false, 'seer: non-god can be lied to');

  // Market: summon market, audit taxes
  sch = { godhood: { active: ['market_god'], capstoneUsed: {} } };
  const m1 = G.summonMarket(sch, false);
  ok(m1 && m1.ok && !m1.taxed, 'market: trader comes, untaxed');
  sch.godhood.capstoneUsed = {};
  const m2 = G.summonMarket(sch, true);
  ok(m2 && m2.taxed, 'market: audit takes its cut (existing counter)');

  // Farstrider: walk horizon
  sch = { godhood: { active: ['farstrider'], capstoneUsed: {} }, kcal: 1000 };
  const w = G.walkHorizon(sch, 3);
  ok(w && w.ok && w.nodes === 3, 'farstrider: 3 nodes, one step');
  ok(sch.kcal === 850, 'farstrider: 150 kcal toll');

  // Between: phase out
  sch = { godhood: { active: ['the_between'], capstoneUsed: {} } };
  ok(G.phaseOut(sch).negated, 'between: one hit negated');
  ok(G.phaseOut(sch) === null, 'between: once per fight');

  // Ward: take wound
  sch = { godhood: { active: ['undying_ward'], capstoneUsed: {} }, health: 60 };
  const t1 = G.takeWound(sch, { name: 'Mara' }, 100);
  ok(t1.ok && t1.hpAfter === 1, 'ward: redirected 100 dmg, kept at 1 HP (keep standing)');
  ok(t1.strains === 1, 'ward: strain tracked');
  G.takeWound(sch, { name: 'Jeb' }, 10);
  const t3 = G.takeWound(sch, { name: 'Kim' }, 10);
  ok(t3.collapsed, 'ward: 3 strains = collapse (not death)');

  // Unkillable: phoenix is the existing mechanic — recognition names it
  const unkill = godhoodJson.godhoods.find(g => g.id === 'unkillable');
  ok(unkill.capstone.mechanic.includes('burn'), 'unkillable: phoenix cost kept (burns a villager)');
}

// (d) costs/weaknesses present for all (already checked in (a); spot-check table pricing)
{
  const sch = { godhood: { active: ['shepherd_of_the_dead', 'apex_predator'] } };
  ok(G.godhoodBargaining(sch) === 6, 'table: each godhood +3 bargaining (a god costs more)');
  ok(G.godhoodBargaining({ godhood: { active: [] } }) === 0, 'table: no godhood, no bonus');
  ok(G.playerMythicId(sch) === 'shepherd_of_the_dead', 'mythic form = first ascension');
}

// (e) knowledge-gated: hint when close, silent when far
{
  const gh = godhoodJson.godhoods[0];
  const far = { abilities: [{ id: 'diplomat' }], activeSynergies: [], inventory: [] };
  ok(G.godhoodCloseness(far, gh).close === false, 'gated: 1/6 kit = no hint');
  const close = {
    abilities: ['diplomat', 'mediator', 'pact', 'grave_robber'].map(id => ({ id })),
    activeSynergies: [], inventory: [], godhood: { recognized: {}, active: [] },
  };
  ok(G.godhoodCloseness(close, gh).close === true, 'gated: 4/6 kit = close');
  ok(G.godhoodCloseness(close, gh).complete === false, 'gated: close ≠ complete');
  const said = [];
  const game = { state: { scholar: close }, sysSay: t => said.push(t) };
  const hint = G.hintBeat(game, gh.id);
  ok(!!hint && said.length === 1, 'gated: hint fires once via System, capstone unnamed');
  ok(!hint.includes('Raise Echo'), 'gated: hint does not name the capstone verb');
  ok(G.hintBeat(game, gh.id) === null, 'gated: hint fires once');
}

// (f) mythic sprites: all 10, valid SVG, no background
for (const gh of godhoodJson.godhoods) {
  const svg = G.mythicSprite(gh.id);
  ok(!!svg && svg.includes('<svg') && svg.includes('viewBox="0 0 32 32"'), `${gh.id}: mythic SVG 32x32`);
  ok(!svg.includes('<rect') || !/fill="#?[0-9a-f]{6}"[^>]*width="32"/i.test(svg), `${gh.id}: no background rect`);
}
ok(G.mythicSprite('nope') === null, 'unknown godhood: no sprite');

// ontology: module carries @ontology header
ok(src.includes('@ontology') && src.includes('system: godhood'), 'ontology header present');

console.log(`\nGREEN: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
