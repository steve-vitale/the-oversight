#!/usr/bin/env node
// Integration: full Long Way Home flow across nomad.js + nomad-wild.js + nomad-scenes.js (2026-10-15).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => { if (cond) { pass++; console.log('  PASS: ' + label); } else { fail++; console.log('  FAIL: ' + label); } };

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');
  const st = Game.state;
  st.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
  ok(kin.length > 0, 'has scattered kin');
  Game.hearOfRegion(kin[0].region, 'test');
  ok(Game.nomad.canLeave().ok, 'canLeave at global rank with known kin region');
  const s = Game.nomad.start();
  ok(!!s && s.active, 'start() ok (road active)');
  ok(Game.nomad.party().length >= 1, 'party mustered (' + Game.nomad.party().length + ')');
  Game.nomad.addLeg(kin[0].region, kin[0].name);
  ok(Game.nomad.enterLeg(0) === true, 'enterLeg ok, region=' + st.region);
  // wild module: forage + daily tick through nomad.daily
  for (let d = 0; d < 5; d++) Game.nomad.daily();
  ok(st.road.daysOnRoad === 5, '5 days on road');
  ok(Game.nomad.party().length >= 1, 'party alive after 5 days');
  // scenes module: trail sharpening + reunion + ending
  const sh = Game.nomadScenes.sharpenTrail(kin[0].name, 'survivor');
  ok(sh.ok && sh.level >= 0, 'sharpenTrail works (level ' + (sh.ok ? sh.level : sh.reason) + ')');
  const re = Game.nomadScenes.reunionScene(kin[0].name, 'alive');
  ok(re && re.fate === 'alive', 'reunion scene: ' + (re && re.title));
  Game.nomad.markKinFound(kin[0].name, kin[0].relation, 'alive');
  const data = Game.nomad.endingData();
  ok(data && data.foundKin.length === 1, 'endingData has found kin');
  const end = Game.nomadScenes.playEnding(data);
  ok(end && end.title, 'ending plays: ' + (end && end.title));
  console.log(`\nintegration: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
