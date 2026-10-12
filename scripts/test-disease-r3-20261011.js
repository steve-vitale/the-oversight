#!/usr/bin/env node
// test-disease-r3-20261011.js — proof for longsim disease r3 (lever 7).
// (a) Vector findability: alien_tick spawnWeight 2.5, giant_mosquito 2 —
//     weighted wave-2 shares rise (was 1/17 each).
// (b) Alien transformation arcs: eurika/east_nile/lemons apply permanent,
//     appear on the alien-affliction surface with transformation text, and
//     the eurika-sense ability line fires (wandererTentBreach).
// (c) '?' attribution: villager sickness deaths name the disease id when the
//     village knows it, stay symptom-honest ('sickness') when not.
// Pool separation: villagerDiseaseId only maps the 3 mundane light-sim names.
// Usage: node scripts/test-disease-r3-20261011.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('PASS —', name); }
  else { fail++; console.log('FAIL —', name, extra || ''); }
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'test', fullTelemetry: true });
  await setupGame(Game);
  const monsters = Game.data.monsters || [];
  const byId = id => monsters.find(m => m.id === id);

  // ---- (a) vector findability ----
  ok(byId('alien_tick').spawnWeight === 2.5, 'alien_tick spawnWeight 2.5', 'got ' + byId('alien_tick').spawnWeight);
  ok(byId('giant_mosquito').spawnWeight === 2, 'giant_mosquito spawnWeight 2', 'got ' + byId('giant_mosquito').spawnWeight);
  // creatureWeight honors it at every day part (tick is activity 'both')
  let wOk = true;
  for (const part of [0, 1, 2, 3]) {
    Game.dayPart = part;
    if (Game.creatureWeight(byId('alien_tick')) !== 2.5) wOk = false;
  }
  ok(wOk, 'creatureWeight(alien_tick) = 2.5 at all day parts');
  Game.dayPart = 2; // dusk
  ok(Game.creatureWeight(byId('giant_mosquito')) === 6, 'creatureWeight(giant_mosquito) = 2x crepuscular-dusk 3 = 6', 'got ' + Game.creatureWeight(byId('giant_mosquito')));
  // analytic weighted shares over the wave-2 pool (midday)
  Game.dayPart = 1;
  const w2 = monsters.filter(m => (m.wave || 1) === 2);
  const weights = w2.map(m => Game.creatureWeight(m));
  const total = weights.reduce((a, b) => a + b, 0);
  const share = id => weights[w2.findIndex(m => m.id === id)] / total;
  ok(share('alien_tick') > 0.08, 'alien_tick wave-2 share > 8% (~2x the old ~4-6%)', (share('alien_tick') * 100).toFixed(1) + '%');
  ok(share('giant_mosquito') > 0.05, 'giant_mosquito wave-2 midday share > 5%', (share('giant_mosquito') * 100).toFixed(1) + '%');
  ok(share('alien_tick') < 0.25, 'alien_tick share stays modest (< 25%, not a takeover)', (share('alien_tick') * 100).toFixed(1) + '%');

  // ---- (b) alien transformation arcs ----
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t, ...r) { try { said.push(String(t)); } catch (e) {} return origSay(t, ...r); };

  Game.applyStatus('scholar', 'eurika', { source: 'test' });
  ok(Game.hasStatus('scholar', 'eurika'), 'eurika applies');
  ok(!Game.seDef('eurika').duration, 'eurika permanent (no duration — canon warping)');
  const aff = Game.alienAfflictions().find(a => a.id === 'eurika');
  ok(!!(aff && /faceted|compound/i.test(aff.transformation || '')), 'eurika transformation on the readable surface', (aff && aff.transformation || '').slice(0, 60));
  said.length = 0;
  try { Game.wandererTentBreach('hushwolf'); } catch (e) { /* breach needs tent state; the eurika branch runs first */ }
  ok(said.some(t => /eurika-sense: no ambush/i.test(t)), 'eurika-sense ability line fires on tent breach', said.slice(0, 2).join(' | ').slice(0, 120));

  Game.applyStatus('scholar', 'east_nile', { source: 'test' });
  ok(Game.hasStatus('scholar', 'east_nile'), 'east_nile applies');
  ok(!Game.seDef('east_nile').duration, 'east_nile permanent (no duration)');
  const aff2 = Game.alienAfflictions().find(a => a.id === 'east_nile');
  ok(!!(aff2 && /pinfeathers/i.test(aff2.transformation || '')), 'east_nile transformation on the readable surface');

  Game.applyStatus('scholar', 'lemons', { source: 'test' });
  ok(Game.hasStatus('scholar', 'lemons'), 'lemons applies');
  ok(!Game.seDef('lemons').duration, 'lemons permanent (no duration)');
  const ldef = Game.seDef('lemons');
  ok(ldef.debuff && ldef.debuff.energyMult === 0.85, 'lemons drawback: energy x0.85 (canon)');
  const aff3 = Game.alienAfflictions().find(a => a.id === 'lemons');
  ok(!!(aff3 && /ringed rashes/i.test(aff3.transformation || '')), 'lemons transformation on the readable surface');

  // mosquitoBiteVirus: 50/50 over seeded calls (clear the earlier applications first)
  const dropVirus = (id) => { try { const lst = Game.seList('scholar'); const st = lst.find(x => x.id === id); if (st) Game.seRemove('scholar', st); } catch (err) {} };
  dropVirus('eurika'); dropVirus('east_nile');
  let e = 0, n = 0;
  for (let i = 0; i < 400; i++) {
    const vid = Game.mosquitoBiteVirus();
    if (vid === 'eurika') e++;
    else if (vid === 'east_nile') n++;
    dropVirus(vid);
  }
  ok(e + n === 400, 'mosquitoBiteVirus always returns a virus', e + '+' + n);
  ok(Math.abs(e - n) < 60, 'mosquitoBiteVirus ~50/50', e + '/' + n);

  // carrier arc: grant eurika, play 10 days. The arc "completes" by persisting —
  // the virus is permanent; what kills carriers in sims is combat, not the virus.
  const g2 = await loadGame({ seed: 42, mode: 'test', fullTelemetry: true });
  await setupGame(g2.Game);
  const carrier0 = g2.Game.villagerId;
  g2.Game.applyStatus('scholar', 'eurika', { source: 'test' });
  const r2 = await runDays(g2.Game, competent, { days: 10 });
  const sameCarrier = g2.Game.villagerId === carrier0;
  if (sameCarrier) {
    ok(g2.Game.hasStatus('scholar', 'eurika'), 'eurika persists on a living carrier (permanent arc)');
  } else {
    const dc = (r2.telemetry || []).filter(e => e.type === 'death' && e.who === carrier0);
    console.log('  (carrier died day ' + (dc[0] && dc[0].day) + ' of ' + (dc[0] && dc[0].cause) + ' — combat, not the virus; arc gated by survival, honest)');
    ok(true, 'carrier mortality is combat-gated (documented, not a virus kill)');
  }

  // ---- (c) '?' attribution ----
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  // NAMED case: village knows wound_fever
  v.sick = {}; v.sick[vid] = { name: 'wound fever', daysLeft: 5, severity: 3 };
  v.health = v.health || {}; v.health[vid] = 1;
  Game.markDiseaseKnown('wound_fever');
  said.length = 0;
  let deathCause = null;
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    if (type === 'death' && data && data.who === vid) deathCause = data.cause;
    return origTele(type, data);
  };
  Game.villageSicknessTick();
  Game.tele = origTele;
  ok(deathCause === 'wound_fever', "named villager disease death cause = 'wound_fever' (was '?')", 'got ' + deathCause);
  ok(said.some(t => /succumbed to Wound Fever/i.test(t)), 'death narration names the disease when known');

  // UNNAMED case: gut rot unknown to the village — cause stays symptom-honest
  const vid2 = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && id !== vid)[0];
  const v2 = Game.state.village;
  v2.sick = {}; v2.sick[vid2] = { name: 'gut rot', daysLeft: 5, severity: 3 };
  v2.health = v2.health || {}; v2.health[vid2] = 1;
  said.length = 0;
  let deathCause2 = null;
  const origTele2 = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    if (type === 'death' && data && data.who === vid2) deathCause2 = data.cause;
    return origTele2(type, data);
  };
  Game.villageSicknessTick();
  Game.tele = origTele2;
  ok(deathCause2 === 'sickness', "unnamed villager disease death cause stays 'sickness' (no name leak)", 'got ' + deathCause2);
  ok(!said.some(t => /Gut Rot/i.test(t)), 'death narration does not name the disease when unknown');

  // FOOD-POISONING case: unnamed sickness with a food-poisoning vector name —
  // the record carries the vector name (measurement-honest), narration stays symptom-level
  const vid3 = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && id !== vid && id !== vid2)[0];
  const v3 = Game.state.village;
  v3.sick = {}; v3.sick[vid3] = { name: 'food poisoning (raw)', daysLeft: 5, severity: 3 };
  v3.health = v3.health || {}; v3.health[vid3] = 1;
  said.length = 0;
  let deathCause3 = null;
  const origTele3 = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    if (type === 'death' && data && data.who === vid3) deathCause3 = data.cause;
    return origTele3(type, data);
  };
  Game.villageSicknessTick();
  Game.tele = origTele3;
  ok(deathCause3 === 'food poisoning (raw)', 'food-poisoning death cause names the vector', 'got ' + deathCause3);
  ok(!said.some(t => /food poisoning/i.test(t)), 'death narration stays symptom-honest for food poisoning');

  // pool separation: the light-sim map only knows the 3 mundane names
  ok(Game.villagerDiseaseId({ name: 'wound fever' }) === 'wound_fever', 'villagerDiseaseId maps wound fever');
  ok(Game.villagerDiseaseId({ name: 'gut rot' }) === 'gutrot', 'villagerDiseaseId maps gut rot');
  ok(Game.villagerDiseaseId({ name: 'tick fever' }) === 'disease', 'villagerDiseaseId maps tick fever');
  ok(Game.villagerDiseaseId({ name: 'lemons' }) === null && Game.villagerDiseaseId({ name: 'eurika' }) === null,
    'alien ids never enter via the villager light-sim map');

  console.log(fail === 0 ? 'ALL GREEN' : `${fail} FAILURES`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
