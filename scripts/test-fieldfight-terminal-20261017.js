#!/usr/bin/env node
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), z = require('zlib');
const { execFileSync } = require('child_process');
const { loadGame } = require('./sim-harness');
const seed = Number(process.env.SEED || 20261008);
let checks = 0;
function check(label, condition) { assert(condition, label); checks++; console.log('  ok ' + label); }
async function scenario(kind) {
  const captured = JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,
    '../evidence/2026-10-17/scale-discovery-fieldfight-followup-case.json.gz'))));
  const { Game: G, loadFails } = await loadGame({ seed, mode: 'fieldfight-terminal-proof' });
  check('full shared runtime loads', loadFails.length === 0);
  const b = structuredClone(captured.before), vid = captured.vid;
  Object.assign(G, { state: b.state, map: b.map, villagerId: b.villagerId,
    dayPart: b.dayPart, location: b.location, homeRegion: b.homeRegion });
  G.data.villagers = G.data.villagers.filter(v => v.id !== vid);
  G.data.villagers.push(b.person);
  let def = b.def, entity = b.entity, draws = 0;
  const opts = { ...b.opts };
  if (kind === 'replay' || kind === 'wild-caller') {
    opts.rng = () => {
      assert(draws < captured.draws.length, 'captured RNG must not exhaust');
      return captured.draws[draws++];
    };
  } else {
    // Explicit naked/nonmagical combat sandbox, then opt in the actual
    // death-prevention abilities. No stat or combat function is stubbed.
    b.person.items = []; b.person.equipped = {};
    const v = G.state.village;
    v.health[vid] = 100;
    v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vid] = [];
    v.npcSkills = v.npcSkills || {}; v.npcSkills[vid] = [];
    v.npcSecondWind = {};
    G.npcNeeds(vid).hunger = kind === 'ember-poor' ? 95 : 0;
    const damage = kind === 'living' ? 99 : 100;
    const attack = { name: 'Prepared hit', damage: [damage, damage] };
    def = { id: 'prepared_terminal_enemy', name: 'Prepared enemy', hp: [1000, 1000],
      speed: 100, pack: kind === 'living' ? 1 : 3, attack, attacks: [attack] };
    entity = { id: def.id, hp: 1000, maxHp: 1000, tx: 2, ty: 2 };
    opts.rng = () => { draws++; return 0.5; };
    if (kind === 'second-wind' || kind.startsWith('ember')) {
      const ability = kind === 'second-wind' ? 'second_wind' : 'ember_heart';
      G.npcGrantAbility(vid, ability);
      check('real death-prevention ability is held', G.npcHasAbility(vid, ability));
    }
  }
  const hungerBefore = G.npcNeeds(vid).hunger || 0;
  let rec;
  if (kind === 'wild-caller') {
    check('captured villager is not the player bearer', vid !== G.villagerId);
    G.data.monsters = G.data.monsters.map(m => m.id === def.id ? def : m);
    G.worldMonsters().push(entity);
    G.state.scholar.awayNews = [];
    const killsBefore = (G.state.waveKillLog || []).length, actual = G.fieldFight;
    let calls = 0;
    G.fieldFight = function (id, monster, world, callerOpts) {
      calls++; rec = actual.call(this, id, monster, world, { ...callerOpts, rng: opts.rng }); return rec;
    };
    try { G.resolveWildMonsterEncounter(vid, entity); } finally { G.fieldFight = actual; }
    check('real wild encounter calls the field engine once', calls === 1);
    check('wild caller applies the real villager death', G.state.village.health[vid] === 0 && G.vpOf(vid).dead);
    check('wild caller retains a living wounded monster without a kill award',
      G.worldMonsters().includes(entity) && entity.hp === 10 && (G.state.waveKillLog || []).length === killsBefore);
    check('wild caller announces the actual death', G.state.scholar.awayNews.some(t => /💀/.test(t)));
  } else rec = G.fieldFight(vid, def, entity, opts);
  if (kind === 'replay' || kind === 'wild-caller') {
    check('captured fatal exchange remains a villager death', rec.outcome === 'vDie' && rec.vHpLeft === 0 && rec.rounds === 3);
    check('captured lead survives the missing postmortem strike', rec.mHpLeft === 10 && entity.hp === 10);
    check('fatal replay ends with a monster hit, not a dead villager strike', /hits/.test(rec.log.at(-1)) && !/strikes/.test(rec.log.at(-1)));
    check('replay uses only its recorded random prefix', draws > 0 && draws < captured.draws.length);
  } else if (kind === 'living') {
    check('living one-HP fighter keeps its legal action', rec.vHpLeft === 1 && rec.mDealt > 0 && rec.log.some(t => /strikes/.test(t)));
    check('living wound persists on the monster', entity.hp === rec.mHpLeft && entity.hp > 0 && entity.hp < 1000);
  } else {
    check('pack stops hitting the zero-HP fighter', rec.vTaken === 100);
    check('zero-HP fighter performs no strike', rec.mDealt === 0 && !rec.log.some(t => /strikes/.test(t)));
    check('unwounded world monster remains alive', rec.mHpLeft === 1000 && entity.hp === 1000);
    if (kind === 'second-wind') {
      check('existing second wind still restores one HP', rec.vHpLeft === 1 && rec.outcome !== 'vDie' && rec.log.some(t => /Second Wind/.test(t)));
    } else if (kind === 'ember') {
      check('existing Ember Heart still restores life', rec.vHpLeft === 20 && rec.outcome !== 'vDie' && rec.log.some(t => /Ember Heart/.test(t)));
      check('Ember Heart still pays its real food cost', G.npcNeeds(vid).hunger - hungerBefore === 24);
    } else {
      check('fatal fight stays fatal without paid prevention', rec.vHpLeft === 0 && rec.outcome === 'vDie');
      if (kind === 'ember-poor') check('unfed Ember Heart grants no free revival', G.npcNeeds(vid).hunger === hungerBefore && !rec.log.some(t => /Ember Heart/.test(t)));
    }
  }
  console.log('FIELD_TERMINAL_RESULT ' + JSON.stringify({ kind, seed, checks, draws, rec, entity, hungerBefore, hungerAfter: G.npcNeeds(vid).hunger || 0 }));
}
async function main() {
  if (process.env.FIELD_TERMINAL_CHILD) return scenario(process.env.FIELD_TERMINAL_CHILD);
  for (const kind of ['replay', 'fatal', 'living', 'second-wind', 'ember', 'ember-poor', 'wild-caller']) {
    const out = execFileSync(process.execPath, [__filename], { env: { ...process.env, FIELD_TERMINAL_CHILD: kind }, encoding: 'utf8', maxBuffer: 2e6 });
    process.stdout.write(out);
    checks += JSON.parse(out.split('\n').find(t => t.startsWith('FIELD_TERMINAL_RESULT ')).slice(22)).checks;
  }
  console.log('field terminal proof green: ' + checks + ' checks');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
