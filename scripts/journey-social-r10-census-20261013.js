#!/usr/bin/env node
// journey-social-r10-census-20261013.js — leg 5 r10 VILLAGE ASSESSMENT.
// Socialite run (seed 505, 60d death-aware), then a census: who is alive,
// who died and how, needs (hunger/fear/social/energy), knacks, bonds,
// conflicts, morale, pantry. Printed to stdout for the run note.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

async function main() {
  const seed = parseInt(process.env.SEEDS || '505', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-r10-census', fullTelemetry: true });
  await setupGame(Game);
  const pol = Object.assign({}, socialite, { id: 'journey-social-r10-census' });
  const result = await runDays(Game, pol, { days: 60, manifest });
  const v = Game.state.village || {};
  const day = (Game.state.scholar || {}).day;
  const name = id => { try { return Game.displayName(id) || id; } catch (e) { return id; } };
  const roster = v.roster || [];
  const rc = v.rosterChars || {};
  console.log(`seed ${seed} — day ${day}, outcome=${(result && result.outcome) || '?'}: alive ${roster.length}`);
  console.log(`morale=${v.morale} pantryKcal=${Math.round(v.pantryKcal || 0)} waterL=${Math.round(v.waterL || 0)}`);
  for (const id of roster) {
    const nd = (v.needs || {})[id] || {};
    const knack = (v.npcKnacks || {})[id] || '-';
    let bonds = 0;
    try { for (const k of Object.keys(v.bonds || {})) if (k.split('|').includes(id)) bonds++; } catch (e) {}
    const ch = rc[id] || {};
    const goal = ch.goal ? String(ch.goal).slice(0, 50) : '';
    console.log(`  ${id === Game.villagerId ? '(YOU) ' : ''}${name(id)} [${ch.formerOccupation || '?'}] hunger:${nd.hunger ?? '?'} fear:${nd.fear ?? '?'} social:${nd.social ?? '?'} energy:${nd.energy ?? '?'} knack:${knack} bonds:${bonds} goal:${goal}`);
  }
  const fallen = v.fallen || [];
  if (fallen.length) {
    console.log('fallen:');
    for (const d of fallen) console.log('  d' + (d.day ?? '?') + ' ' + name(d.villagerId || d.id || d) + ' — ' + (d.cause || '?'));
  }
  const conf = v.conflicts || [];
  if (conf.length) {
    console.log('active conflicts:');
    for (const c of conf.slice(0, 6)) console.log(`  ${name(c.a)} x ${name(c.b)} [${c.kind}] tension:${c.tension ?? '?'}`);
  }
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
