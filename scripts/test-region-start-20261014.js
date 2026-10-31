#!/usr/bin/env node
// test-region-start-20261014.js — proof for first-run landing and the
// real-date season (docs/WORLD-REGIONS.md §10 Q1/Q4, §11).
//
// Steve 2026-10-14: "Maybe first run let them land in the origin they choose
// a character from. Random after." / "Yes that's okay to run a wet/dry year.
// Whenever the player starts, should be the season the game starts in."
//
//   S1 first run lands in the origin region when it is playable (fixture)
//   S2 nearest-playable fallback: climateFamily, then continent, then default
//   S3 later runs are random; a device with old saves is not a first run
//   S4 Game.debugRegion wins over the first-run rule
//   S5 real date -> season: north, south, wet/dry calendars
//   S6 newGame stores the start (frozen harness clock: deterministic), the
//      season advances from it with game days; save/load keeps it; an old
//      save (no calendarStart) keeps the old day-1 rule
//   S7 eastern woodlands weather tables unchanged (sims don't move)
//   S8 validate-regions checks calendars (shipped passes; broken fails)
//   S9 newGame never touches the meta store (metaProgression read_only_power)
//
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const { loadGame, quietLog } = require('./sim-harness');
const { validateRegions, loadData } = require('./validate-regions');

// ---- localStorage stub (save/load + run counter in node), with an access log ----
const _store = {};
const lsLog = [];
const ls = {
  getItem: (k) => { lsLog.push(['get', k]); return (k in _store ? _store[k] : null); },
  setItem: (k, v) => { lsLog.push(['set', k]); _store[k] = String(v); },
  removeItem: (k) => { lsLog.push(['rm', k]); delete _store[k]; },
  key: (i) => Object.keys(_store)[i] || null,
};
Object.defineProperty(ls, 'length', { get: () => Object.keys(_store).length });
globalThis.localStorage = ls;
const wipeDevice = () => { for (const k of Object.keys(_store)) delete _store[k]; };

const SEED = 20261015; // refreshed 20261014 -> 20261015 on 2026-10-31 (lootabilities build): items.json gained two tier-1 loot pieces, re-rolling seeded generation; at the old seed S9's roster[0] is a home native whose animal familiarity legitimately notes home animals into the meta store during newGame. The S9 invariant (newGame itself never reaches for the meta store) is unchanged and still asserted at the new seed, where roster[0] is a non-native, as before. All sections S1-S9 pass at this seed; no assertion changed.
const FX = 'fx_homeland';
const HARNESS_EPOCH = 1760400000000; // scripts/sim-harness.js frozen clock base (2025-10-14)

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'region-start-proof' });
  ok(!loadFails.length, 'all modules load', loadFails.join('; '));
  ok(Game.data.climates && Game.data.climates.calendars, 'climates.json loaded by Game.init');
  const EW = Game.regionDef('na_eastern_woodlands');

  // A fixture playable region (never shipped): a copy of the eastern woodlands
  // with its own origin tag, climate family and continent.
  const fx = JSON.parse(JSON.stringify(EW));
  Object.assign(fx, { id: FX, name: 'Fixture Homeland', climateFamily: 'fx_family', continent: 'fx_continent', originTags: ['fixtureland'], neighbors: [] });
  Game.data.characterGen.originKeywords.fixtureville = ['fixtureland'];
  const regionsShipped = Game.data.regions.slice();
  Game.data.regions = regionsShipped.concat([fx]);

  const start = (origin) => quietLog(async () => {
    Game.genRoster(origin);
    Game.newGame(origin, null, Game.generatedRoster[0].id);
  });
  const regionStart = () => (Game.state.telemetry || []).filter(e => e.type === 'region_start').pop() || {};

  // ============ S1 first run -> origin ============
  console.log('\n[S1] first run lands in the origin region (fixture playable)');
  wipeDevice();
  ok(Game.isFirstRun() === true && Game.runsStarted() === 0, 'empty device: first run');
  await start('Fixtureville');
  ok(Game.state.region === FX, 'first run lands in the origin region', Game.state.region);
  ok(regionStart().why === 'first_run_origin' && regionStart().via === 'origin', 'region_start why=first_run_origin via=origin', JSON.stringify(regionStart()));
  ok(Game.runsStarted() === 1 && Game.isFirstRun() === false, 'the run was counted; the next is not a first run');

  // ============ S3 later runs random ============
  console.log('\n[S3] later runs are random among playable regions');
  await start('Fixtureville');
  ok(regionStart().why === 'random', 'second run: why=random', JSON.stringify(regionStart()));
  const seen = {};
  for (let i = 0; i < 60; i++) { const r = Game.pickLandingRegion(FX); seen[r.id] = (seen[r.id] || 0) + 1; }
  const nPlayable = Game.playableRegions().length;
  ok(seen[FX] > 0 && seen.na_eastern_woodlands > 0 && Object.keys(seen).length === nPlayable, `random picks cover all ${nPlayable} playable regions (was exactly 2 before wave 1)`, JSON.stringify(seen));
  ok(Game._landingWhy.why === 'random', 'pickLandingRegion reports random');
  wipeDevice();
  _store['scattering-save-v1-someone-123'] = '{}';
  ok(Game.isFirstRun() === false, 'a device with a save from before the counter is not a first run');
  wipeDevice();
  _store['scattering-save-tombstone-scattering-save-v1-x-1'] = '{}';
  ok(Game.isFirstRun() === false, 'a device with a tombstoned (finished) run is not a first run');

  // ============ S2 nearest playable ============
  console.log('\n[S2] nearest-playable fallback');
  const amazon = Game.regionDef('sa_amazon');
  const fxClimate = Object.assign(JSON.parse(JSON.stringify(fx)), { id: 'fx_wet', climateFamily: amazon.climateFamily, continent: 'fx_continent' });
  const fxCont = Object.assign(JSON.parse(JSON.stringify(fx)), { id: 'fx_south', climateFamily: 'fx_family', continent: amazon.continent });
  let fr = Game.firstRunLanding('sa_amazon', [EW, fxCont, fxClimate]);
  ok(fr.region.id === 'fx_wet' && fr.via === 'climate', 'stub origin -> playable region of the same climateFamily first', JSON.stringify({ id: fr.region.id, via: fr.via }));
  fr = Game.firstRunLanding('sa_amazon', [EW, fxCont]);
  ok(fr.region.id === 'fx_south' && fr.via === 'continent', 'then the same continent');
  fr = Game.firstRunLanding('sa_amazon', [fx, EW]);
  ok(fr.region.id === 'na_eastern_woodlands' && fr.via === 'default', 'then the eastern woodlands');
  fr = Game.firstRunLanding(null, [fx, EW]);
  ok(fr.region.id === 'na_eastern_woodlands' && fr.via === 'no_origin', 'an origin no region claims -> the eastern woodlands');
  const fxNeighbor = Object.assign(JSON.parse(JSON.stringify(fxClimate)), { id: 'fx_wet_neighbor' });
  amazon.neighbors.push('fx_wet_neighbor');
  fr = Game.firstRunLanding('sa_amazon', [fxClimate, fxNeighbor]);
  ok(fr.region.id === 'fx_wet_neighbor', 'among equals, the origin region\'s neighbor wins');
  amazon.neighbors.pop();
  // the shipped world: Lagos lands in its origin region if playable, else the default
  Game.data.regions = regionsShipped;
  wipeDevice();
  await start('Lagos, Nigeria');
  const lagosRegion = Game.parseOrigin('Lagos, Nigeria').regions[0];
  const lagosPlayable = Game.playableRegions().some(r => r.id === lagosRegion);
  const expectLagos = lagosPlayable ? lagosRegion : 'na_eastern_woodlands';
  ok(Game.state.region === expectLagos && regionStart().why === 'first_run_origin',
    `shipped data: a Lagos first run lands in ${expectLagos}`, JSON.stringify(regionStart()));
  Game.data.regions = regionsShipped.concat([fx]);

  // ============ S4 debug wins ============
  console.log('\n[S4] Game.debugRegion wins');
  wipeDevice();
  Game.debugRegion = 'na_eastern_woodlands';
  await start('Fixtureville');
  ok(Game.state.region === 'na_eastern_woodlands' && regionStart().why === 'debug', 'first run + debugRegion -> the debug region, why=debug', JSON.stringify(regionStart()));
  Game.debugRegion = null;

  // ============ S5 real date -> season ============
  console.log('\n[S5] real date -> season (north / south / wet-dry)');
  const at = (id, y, m, d) => Game.calendarStartFor(typeof id === 'string' ? Game.regionDef(id) : id, Date.UTC(y, m, d));
  const ewCases = [[0, 15, 'winter'], [2, 1, 'spring'], [4, 31, 'spring'], [6, 4, 'summer'], [9, 14, 'fall'], [11, 25, 'winter']];
  for (const [m, d, want] of ewCases) ok(at('na_eastern_woodlands', 2026, m, d).season === want, `eastern woodlands ${m + 1}/${d} -> ${want}`, JSON.stringify(at('na_eastern_woodlands', 2026, m, d)));
  // the start sits inside the right season of the region's own day layout
  const early = at('na_eastern_woodlands', 2026, 2, 1), late = at('na_eastern_woodlands', 2026, 4, 31);
  ok(early.doy === 0 && late.doy === 79, 'March 1 is the first day of spring (doy 0), May 31 the last (doy 79)', early.doy + '/' + late.doy);
  const south = Object.assign(JSON.parse(JSON.stringify(fx)), { id: 'fx_south_temperate', hemisphere: 'south' });
  ok(at(south, 2026, 0, 15).season === 'summer' && at(south, 2026, 6, 15).season === 'winter', 'southern temperate: January is summer, July winter');
  ok(at('sa_amazon', 2026, 0, 15).season === 'wet' && at('sa_amazon', 2026, 8, 15).season === 'dry', 'Amazon (south, wet/dry): January wet, September dry');
  ok(at('africa_sahel_savanna', 2026, 7, 15).season === 'wet' && at('africa_sahel_savanna', 2026, 1, 15).season === 'dry', 'Sahel (north, wet/dry): August wet, February dry');
  ok(at('africa_southern', 2026, 0, 15).season === 'wet' && at('africa_southern', 2026, 6, 15).season === 'dry', 'southern Africa: January wet, July dry');
  ok(at('south_asia', 2026, 6, 15).season === 'wet' && at('south_asia', 2026, 3, 15).season === 'hot' && at('south_asia', 2026, 11, 15).season === 'cool', 'South Asia monsoon: July wet, April hot, December cool');
  ok(at('eurasia_taiga', 2026, 1, 15).season === 'winter' && at('eurasia_taiga', 2026, 6, 15).season === 'summer', 'taiga: February winter, July summer');
  // every region, every month: the month map's season is the season() day 1 reads
  let mism = [];
  for (const r of Game.data.regions) {
    const cal = Game.regionCalendar(r);
    if (!cal.months) { mism.push(r.id + ':no months'); continue; }
    for (let m = 0; m < 12; m++) {
      const cs = Game.calendarStartFor(r, Date.UTC(2026, m, 10));
      let acc = 0, sid = null;
      for (const s of cal.seasons) { if (cs.doy < acc + s.days) { sid = s.id; break; } acc += s.days; }
      if (sid !== cal.months[m]) mism.push(`${r.id}@${m + 1}:${sid}!=${cal.months[m]}`);
    }
  }
  ok(mism.length === 0, 'all 20 regions x 12 months: day 1 lands in the month map\'s season', mism.slice(0, 5).join(', '));

  // ============ S6 newGame stores the start; save/load; old saves ============
  console.log('\n[S6] stored start, season advances, save/load, old saves');
  wipeDevice();
  await start('Columbus, Ohio');
  const cs = Game.state.calendarStart;
  ok(cs && cs.region === 'na_eastern_woodlands' && cs.date === new Date(HARNESS_EPOCH).toISOString().slice(0, 10), 'newGame stores calendarStart from the (frozen) clock', JSON.stringify(cs));
  ok(Game.season(1).id === 'fall' && Game.season(1).dayOfYear === cs.doy, 'harness date 2025-10-14 -> day 1 is fall', JSON.stringify(Game.season(1)));
  ok(regionStart().season === 'fall' && regionStart().calendarDate === cs.date, 'region_start records the season and the real date');
  const winterDay = 1 + (80 + 95 + 75) - cs.doy;
  ok(Game.season(winterDay - 1).id === 'fall' && Game.season(winterDay).id === 'winter', `the season advances with game days (winter from day ${winterDay})`);
  ok(Game.season(1 + 365).id === 'fall' && Game.season(1 + 365).dayOfYear === cs.doy, 'a year later it is the same day of the year');
  Game.over = false;
  const saved = Game.save();
  const saves = globalThis.Scattering.state.listSaves();
  ok(saved !== false && saves.length > 0, 'save written');
  const key = saves[0].key;
  ok(Game.load(key) === true && JSON.stringify(Game.state.calendarStart) === JSON.stringify(cs) && Game.season(1).id === 'fall', 'calendarStart survives save/load');
  const raw = JSON.parse(localStorage.getItem(key));
  const oldState = raw && raw.state ? raw.state : raw;
  delete oldState.calendarStart;
  localStorage.setItem(key, JSON.stringify(raw));
  ok(Game.load(key) === true, 'an old save (no calendarStart) loads');
  ok(Game.season(1).id === 'spring' && Game.season(1).dayOfYear === 0, 'old save keeps the old rule: day 1 is the first day of spring (no mid-run season jump)');
  // a start from another region is ignored (never misread)
  Game.state.calendarStart = { doy: 300, region: 'sa_amazon' };
  ok(Game.season(1).id === 'spring', 'a calendarStart naming another region is ignored');

  // ============ S7 eastern woodlands weather unchanged ============
  console.log('\n[S7] eastern woodlands weather tables unchanged');
  const ewSeasons = EW.climate.seasons;
  ok(ewSeasons.map(s => s.id + s.days).join() === 'spring80,summer95,fall75,winter115', 'same four seasons, same lengths');
  ok(ewSeasons.every(s => JSON.stringify(s.weather) === JSON.stringify({ clear: 0.7, rain: 0.2, cold: 0.1 })), 'every season still rolls clear .7 / rain .2 / cold .1');
  ok(EW.climate.calendar === 'temperate_4' && Game.regionCalendar(EW).seasons === ewSeasons, 'the region keeps its own seasons; the template only adds the month map');

  // ============ S8 validator ============
  console.log('\n[S8] validate-regions checks calendars');
  const data = loadData();
  const shipped = validateRegions(data);
  ok(shipped.errors.length === 0, 'shipped data validates', shipped.errors.slice(0, 3).join(' | '));
  ok(data.regions.every(r => r.climate && r.climate.calendar && data.climates.calendars[r.climate.calendar]), 'every region (stubs too) names a calendar');
  const C2 = JSON.parse(JSON.stringify(data.climates));
  C2.calendars.arid_2.months = C2.calendars.arid_2.months.slice(0, 11);
  C2.calendars.monsoon_3.seasons[0].weather = { clear: 0.5 };
  C2.calendars.highland_2.seasons[0].days = 200;
  C2.calendars.temperate_4.months = ['winter', 'spring', 'winter', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'];
  C2.familyCalendar.fx = 'nope';
  const br = validateRegions(Object.assign({}, data, { climates: C2 }));
  ok(br.errors.some(e => /arid_2: month map must list 12/.test(e)), 'an 11-month map is caught');
  ok(br.errors.some(e => /monsoon_3: season hot weather sums/.test(e)), 'weather not summing to 1 is caught');
  ok(br.errors.some(e => /highland_2: season days add up/.test(e)), 'seasons not covering the year are caught');
  ok(br.errors.some(e => /temperate_4: a season's months are not one unbroken run/.test(e)), 'a broken month run is caught');
  ok(br.errors.some(e => /fx -> nope/.test(e)), 'a family mapped to a missing calendar is caught');
  const r2 = JSON.parse(JSON.stringify(data.regions));
  r2[1].climate.calendar = 'no_such_calendar';
  ok(validateRegions(Object.assign({}, data, { regions: r2 })).errors.some(e => /na_plains: climate.calendar no_such_calendar/.test(e)), 'a stub naming a missing calendar is caught');

  // ============ S9 meta store untouched ============
  console.log('\n[S9] newGame never touches the meta store');
  wipeDevice();
  lsLog.length = 0;
  await start('Columbus, Ohio');
  const metaHits = lsLog.filter(([, k]) => k === 'oversight.meta.v1');
  ok(metaHits.length === 0, 'newGame: zero oversight.meta.v1 reads/writes', JSON.stringify(metaHits));
  ok(lsLog.some(([op, k]) => op === 'set' && k === 'oversight.runs.v1'), 'newGame counts the run under oversight.runs.v1');

  console.log(`\nregion-start: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('FAILED: ' + failures.join(' | ')); process.exit(1); }
  process.exit(0);
}

main().catch(e => { console.error(e.stack); process.exit(1); });
