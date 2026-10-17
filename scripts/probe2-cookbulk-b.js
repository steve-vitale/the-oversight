#!/usr/bin/env node
// probe2-cookbulk-b.js — does Game.cookAll() actually cook the regions pantry beans?
// Checks item fields, havenStoresAccess, cookAll conversion + water cost on the real substrate.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1') { console.error('PROBE STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  const { Game } = await loadGame({ seed: 7902, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  // put scholar at Haven
  try {
    const v = Game.state.village || {};
    if (Game.map) { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); }
    Game.location = 'haven';
  } catch (e) {}
  const pantry = (Game.state.village || {}).pantry || [];
  const beans = pantry.filter(i => i && /bean|rice/i.test(i.name || '') && (i.needsCooking || i.rawKcal));
  console.log('pantry size:', pantry.length, 'bean/rice cookable items:', beans.length);
  for (const b of beans.slice(0, 3)) {
    console.log('  item:', JSON.stringify({ name: b.name, units: b.units, kcalEach: b.kcalEach, rawKcal: b.rawKcal, cookedKcal: b.cookedKcal, needsCooking: b.needsCooking, safe: b.safe, foodKind: b.foodKind, plantId: b.plantId, diseaseRisk: !!b.diseaseRisk, spoilDay: b.spoilDay }));
  }
  try { console.log('havenStoresAccess:', Game.havenStoresAccess ? Game.havenStoresAccess() : 'n/a'); } catch (e) { console.log('havenStoresAccess err', e.message); }
  try { console.log('nearFire at haven:', Game.nearFire()); } catch (e) { console.log('nearFire err', e.message); }
  try { console.log('knowsTechnique(cook):', Game.knowsTechnique('cook')); } catch (e) { console.log('knows err', e.message); }
  try { console.log('cleanWaterForCooking:', Game.cleanWaterForCooking()); } catch (e) { console.log('water err', e.message); }
  try { console.log('village.water:', JSON.stringify(Game.state.village.water)); } catch (e) {}
  // fire the engine verb on the pantry directly
  const beforeKcal = beans.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const said = [];
  const oSay = Game.say; Game.say = (m) => { said.push(String(m)); };
  const beforeDayTicks = Game.state.scholar.dayTicks;
  await quietLog(async () => { try { Game.cookAll((Game.state.village || {}).pantry); } catch (e) { console.log('cookAll threw:', e.message); } });
  Game.say = oSay;
  const afterKcal = beans.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const cooked = beans.filter(i => i && i.foodState === 'cooked' || (i.prep || '').indexOf('Cooked') === 0);
  console.log('cookAll said:', said.slice(0, 6).join(' | '));
  console.log('beforeKcal:', beforeKcal, 'afterKcal:', afterKcal, 'cookedCount:', cooked.length);
  console.log('dayTicks delta:', Game.state.scholar.dayTicks - beforeDayTicks);
  if (cooked[0]) console.log('cooked sample:', JSON.stringify({ name: cooked[0].name, kcalEach: cooked[0].kcalEach, units: cooked[0].units, safe: cooked[0].safe, needsCooking: cooked[0].needsCooking, foodState: cooked[0].foodState, prep: (cooked[0].prep||'').slice(0,60), spoilDay: cooked[0].spoilDay }));
  process.exit(0);
})().catch(e => { console.error('PROBE FAILED', e); process.exit(1); });
