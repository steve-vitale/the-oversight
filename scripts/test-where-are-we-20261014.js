#!/usr/bin/env node
// test-where-are-we-20261014.js — proof for place knowledge (whereAreWe.js).
//
// Steve 2026-10-14 (docs/godpath/STEVE-ANSWERS.md round 4): "Okay add season
// line but that's a small knowledge unlock as you speak to people. Where we
// are in the world becomes part of conversation."
//
//   W1 a new game starts at the player's own familiarity (local = known);
//      a stranger knows nothing: placeKnown 0/0, the header line is absent,
//      the 'where' topic is offered in conversation
//   W2 a local villager (same region) -> known 2/2; their line names the
//      region and the true season; header "Autumn · Eastern Woodlands"
//   W3 a visitor (same climate family) -> rough 1/1; header "Season:
//      probably ...?"; their line never names the region
//   W4 a stranger -> nothing learned, a flavour line, header still absent
//   W5 knowledge only rises; a visitor's guess near a season boundary runs
//      one season off, a local then corrects it to the truth
//   W6 the topic retires: once per villager, and gone at 2/2
//   W7 save/load keeps it; an old save (no placeKnown) reads as known
//   W8 data: every calendar season has a label and villager lines; wet/dry
//      calendars read right in the header
//   W9 wiring: app.js day header calls whereLine; index.html loads the module
//
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, quietLog, ROOT } = require('./sim-harness');

// ---- localStorage stub (save/load in node) ----
const _store = {};
const ls = {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  key: (i) => Object.keys(_store)[i] || null,
};
Object.defineProperty(ls, 'length', { get: () => Object.keys(_store).length });
globalThis.localStorage = ls;

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 20261014, mode: 'where-are-we-proof' });
  // Wave 1 (2026-10-14): more than one region is playable, so newGame lands
  // randomly. Every assertion here is eastern-woodlands-specific (seasons,
  // "Eastern Woodlands", the Ohio/Kyiv/Hanoi tier fixture), so pin it.
  Game.debugRegion = 'na_eastern_woodlands';
  ok(!loadFails.length, 'all modules load', loadFails.join('; '));
  ok(typeof Game.whereLine === 'function' && typeof Game.placeLearnFrom === 'function', 'whereAreWe.js attached to Game');

  const others = () => Game.state.village.roster.filter(id => id !== Game.villagerId);
  const byTier = (t) => others().filter(id => Game.placeTellTier(id) === t);
  // Rosters are random per start. Guarantee two of each tier by re-homing
  // villagers (origin tags only; real origins: Ohio / Kyiv / Hanoi).
  const HOME = {
    2: Game.parseOrigin('Columbus, Ohio').tags,
    1: Game.parseOrigin('Kyiv, Ukraine').tags,
    0: Game.parseOrigin('Hanoi, Vietnam').tags,
  };
  // start(): a fresh run. The sections after W1 play a STRANGER player who
  // has to ask, so they reset what the (local, Columbus) player starts with.
  const start = async (keepStart) => {
    await start0();
    if (!keepStart) Game.state.scholar.placeKnown = { region: 0, season: 0 };
  };
  const start0 = async () => {
    await quietLog(async () => {
      Game.genRoster('Columbus, Ohio');
      Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    });
    const rc = Game.state.village.rosterChars;
    const ids = others().filter(id => rc[id]);
    for (const t of [2, 1, 0]) {
      while (byTier(t).length < 2) {
        const counts = { 2: byTier(2).length, 1: byTier(1).length, 0: byTier(0).length };
        const donor = ids.find(id => counts[Game.placeTellTier(id)] > 2);
        if (!donor) throw new Error('roster too small for the tier fixture');
        rc[donor].originTags = HOME[t].slice();
      }
    }
  };
  // Drive a real conversation: answer what they ask, take 'ask:where' when
  // the menu offers it. Returns {offered, line}.
  const askWhere = (vid) => {
    let r = Game.startConvo(vid);
    let offered = false, line = null;
    for (let i = 0; i < 8 && r && !r.ended; i++) {
      const ids = (r.choices || []).map(c => c.id);
      if (ids.indexOf('ask:where') !== -1) {
        offered = true;
        r = Game.convoTurn(vid, 'ask:where');
        line = r && r.line;
        break;
      }
      const pick = ids.find(x => x.indexOf('ans:') === 0) || ids.find(x => x === 'goon') || ids.find(x => x === 'silence') || ids[0];
      if (!pick) break;
      r = Game.convoTurn(vid, pick);
    }
    try { if (Game.convoGet(vid).active) Game.endConvo(vid, 'left'); } catch (e) { console.log('  (endConvo: ' + e.message + ')'); }
    return { offered, line };
  };
  const seasonLabel = () => Game.wawSeasonLabel(Game.season().id);

  // ============ W1 new game ============
  console.log('\n[W1] a new game knows nothing');
  await start(true);
  ok(Game.state.region === 'na_eastern_woodlands', 'landed in the eastern woodlands', Game.state.region);
  // Parity (2026-10-14): the player starts knowing what a villager from
  // their origin would. Columbus landing in the eastern woodlands is local.
  const pk0 = Game.state.scholar.placeKnown;
  const myTier = Game.placeTellTier(Game.villagerId);
  ok(pk0 && pk0.region === myTier && pk0.season === myTier, 'placeKnown starts at the player\'s own familiarity tier', JSON.stringify(pk0) + ' tier ' + myTier);
  ok(myTier === 2 && Game.whereLine() !== '', 'a local player recognises home: header line shows', JSON.stringify(Game.whereLine()));
  // The rest of the test plays a stranger who has to ask.
  Game.state.scholar.placeKnown = { region: 0, season: 0 };
  ok(Game.whereLine() === '', 'a stranger player: header season line is absent', JSON.stringify(Game.whereLine()));
  const locals = byTier(2), visitors = byTier(1), strangers = byTier(0);
  ok(locals.length && visitors.length && strangers.length, `roster has local/visitor/stranger (${locals.length}/${visitors.length}/${strangers.length})`);
  ok(Game.topic2Asks(locals[0]).some(a => a.id === 'ask:where'), "the 'where' topic is in the generated topic list");

  // ============ W2 local ============
  console.log('\n[W2] a local villager knows');
  const loc = askWhere(locals[0]);
  console.log('    local says: ' + loc.line);
  ok(loc.offered, "conversation menu offers 'where'");
  const pkL = Game.placeKnown();
  ok(pkL.region === 2 && pkL.season === 2, 'local -> known 2/2', JSON.stringify(pkL));
  ok(/eastern wood/i.test(loc.line || ''), 'local names the region in their own words', loc.line);
  const seasonWords = { fall: /fall|autumn/i, winter: /winter/i, spring: /spring/i, summer: /summer/i };
  ok((seasonWords[Game.season().id] || /./).test(loc.line || ''), `local names the true season (${Game.season().id})`, loc.line);
  ok(Game.whereLine() === seasonLabel() + ' · Eastern Woodlands', 'header shows season + region', Game.whereLine());
  ok(Game.whereLine() === 'Autumn · Eastern Woodlands', 'harness date (Oct) -> "Autumn · Eastern Woodlands"', Game.whereLine());
  ok(!Game.topic2Asks(visitors[0]).some(a => a.id === 'ask:where'), 'topic retires once everything is known (W6)');
  // Follow-up ("What does that mean for us?"): the season's calendar note.
  {
    const c = Game.convoGet(locals[0]);
    c.thread = 'where'; c.said = c.said || {}; c.said['t2:where'] = [loc.line];
    const more = Game.topic2HasMore(locals[0]);
    const beat = Game.topic2Beat(locals[0]);
    const note = (Game.wawSeasons().find(s => s.id === Game.season().id) || {}).note;
    console.log('    follow-up: ' + beat);
    ok(more && beat && note && beat.indexOf(note) !== -1, 'follow-up beat tells what the season means (calendar note)', beat);
    ok(!Game.topic2HasMore(locals[0]), 'then the thread is honestly done');
    c.thread = null;
  }

  // ============ W3 visitor ============
  console.log('\n[W3] a visitor guesses');
  await start();
  const v1 = byTier(1)[0];
  const vis = askWhere(v1);
  console.log('    visitor says: ' + vis.line);
  ok(vis.offered, "visitor conversation offers 'where'");
  const pkV = Game.placeKnown();
  ok(pkV.region === 1 && pkV.season === 1, 'visitor -> rough 1/1', JSON.stringify(pkV));
  ok(!/eastern wood/i.test(vis.line || ''), 'visitor does not name the region', vis.line);
  ok(/^Season: probably [a-z ]+\? · .+\?$/.test(Game.whereLine()), 'header: "Season: probably ...? · rough?"', Game.whereLine());
  console.log('    header: ' + Game.whereLine());
  ok(!Game.topic2Asks(v1).some(a => a.id === 'ask:where'), 'the same villager is not asked twice (W6)');
  ok(Game.topic2Asks(byTier(2)[0]).some(a => a.id === 'ask:where'), 'others can still be asked while knowledge is rough');

  // ============ W4 stranger ============
  console.log('\n[W4] a stranger does not know');
  await start();
  const s1 = byTier(0)[0];
  const str = askWhere(s1);
  console.log('    stranger says: ' + str.line);
  ok(str.offered, "stranger conversation offers 'where'");
  const pkS = Game.placeKnown();
  ok(pkS.region === 0 && pkS.season === 0, 'stranger -> nothing learned', JSON.stringify(pkS));
  ok((Game.wawTalk().stranger || []).some(l => (str.line || '').indexOf(l.slice(1, 20)) !== -1), 'stranger says a flavour line from the data', str.line);
  ok(Game.whereLine() === '', 'header still absent');

  // ============ W5 rises only; boundary guess ============
  console.log('\n[W5] knowledge only rises; a near-boundary guess, then the truth');
  await start();
  // Put day 1 on the 2nd day of winter (temperate_4: spring 80, summer 95, fall 75).
  Game.state.calendarStart = { doy: 80 + 95 + 75 + 1, region: 'na_eastern_woodlands' };
  Game.state.scholar.day = 1;
  ok(Game.season().id === 'winter' && Game.season().dayOfSeason === 2, 'fixture: 2nd day of winter', JSON.stringify(Game.season()));
  const g = Game.placeLearnFrom(byTier(1)[0]);
  console.log('    visitor says: ' + g.line);
  ok(Game.placeKnown().seasonDelta === -1 && /probably autumn\?/.test(Game.whereLine()), 'visitor guesses one season off (still autumn)', Game.whereLine());
  const t2 = Game.placeLearnFrom(byTier(2)[0]);
  console.log('    local says: ' + t2.line);
  ok(/winter/i.test(t2.line) && Game.whereLine() === 'Winter · Eastern Woodlands', 'a local corrects it to the truth', Game.whereLine());
  Game.placeLearnFrom(byTier(1)[1] || byTier(1)[0]);
  Game.placeLearnFrom(byTier(0)[0]);
  ok(Game.placeKnown().region === 2 && Game.placeKnown().season === 2 && Game.whereLine() === 'Winter · Eastern Woodlands', 'a later visitor/stranger never lowers it');
  // The season line follows the calendar once known.
  Game.state.scholar.day = 1 + 115;
  ok(Game.whereLine() === 'Spring · Eastern Woodlands', 'known season advances with the days', Game.whereLine());
  // Tier 2 never contradicts: late-season local line still names the truth.
  // (A late line also names the NEXT season as coming; it must name the
  // current one, and the header must be exactly the truth.)
  const bad = [];
  let sampled = 0;
  for (let d = 1; d <= 365; d += 7) {
    Game.state.scholar.day = d;
    Game.state.scholar.placeKnown = { region: 0, season: 0 };
    const r = Game.placeLearnFrom(byTier(2)[0]);
    const id = Game.season().id;
    sampled++;
    if (!seasonWords[id].test(r.line) || Game.whereLine() !== seasonLabel() + ' · Eastern Woodlands') bad.push(`day ${d} ${id}: ${r.line}`);
  }
  ok(!bad.length, `local lines and header name the true season all year (${sampled} days sampled)`, bad.slice(0, 3).join(' | '));

  // ============ W7 save/load + old saves ============
  console.log('\n[W7] save/load keeps it; old saves read as known');
  await start();
  Game.placeLearnFrom(byTier(1)[0]);
  const before = JSON.stringify(Game.state.scholar.placeKnown);
  Game.over = false;
  ok(Game.save() !== false, 'save written');
  const key = globalThis.Scattering.state.listSaves()[0].key;
  Game.state.scholar.placeKnown = { region: 0, season: 0 };
  ok(Game.load(key) === true && JSON.stringify(Game.state.scholar.placeKnown) === before, 'placeKnown survives save/load', JSON.stringify(Game.state.scholar.placeKnown));
  ok(Game.whereLine().indexOf('Season: probably') === 0, 'header after load is the same rough line', Game.whereLine());
  const raw = JSON.parse(localStorage.getItem(key));
  const st = raw && raw.state ? raw.state : raw;
  delete st.scholar.placeKnown;
  localStorage.setItem(key, JSON.stringify(raw));
  ok(Game.load(key) === true, 'an old save (no placeKnown) loads');
  const pkO = Game.placeKnown();
  ok(pkO.region === 2 && pkO.season === 2, 'old save reads as known 2/2', JSON.stringify(pkO));
  ok(/^[A-Z][a-z]+ · Eastern Woodlands$/.test(Game.whereLine()), 'old save shows the full line', Game.whereLine());
  ok(!Game.topic2Asks(others()[0]).some(a => a.id === 'ask:where'), 'old save: the topic is not offered');

  // ============ W8 data ============
  console.log('\n[W8] phrasing data covers every calendar');
  const T = Game.wawTalk();
  const missing = [];
  for (const [cid, cal] of Object.entries(Game.data.climates.calendars)) {
    for (const s of cal.seasons) {
      if (!(T.seasonLabels || {})[s.id]) missing.push(cid + '.' + s.id + ' label');
      for (const k of ['known', 'late', 'guess']) if (!Game.wawSeasonLines.call(Object.assign(Object.create(Game), { wawCalendarId: () => cid }), s.id, k).length) missing.push(cid + '.' + s.id + '.' + k);
    }
  }
  ok(!missing.length, 'every calendar season has a label and known/late/guess lines', missing.join(', '));
  const famMissing = Object.keys(Game.data.climates.familyCalendar).filter(f => !((T.families || {})[f] || {}).visitor);
  ok(!famMissing.length, 'every climate family has a rough description and visitor lines', famMissing.join(', '));
  ok(Game.data.regions.filter(r => r.status === 'playable').every(r => ((T.regions || {})[r.id] || {}).local), 'every playable region has its own local lines');
  // A wet/dry region reads right (stub region, header only).
  Game.state.region = 'africa_sahel_savanna';
  Game.state.calendarStart = null;
  Game.state.scholar.placeKnown = { region: 2, season: 2 };
  ok(/^The (dry|wet|cool dry) · The Sahel and the Savanna$/.test(Game.whereLine()) || /^The (dry|wet|cool dry) · Sahel and the Savanna$/.test(Game.whereLine()), 'wet/dry calendar: "The dry · Sahel and the Savanna"', Game.whereLine());
  Game.state.scholar.placeKnown = { region: 1, season: 1 };
  ok(/^Season: probably the (dry|wet|cool dry)\? · hot savanna\?$/.test(Game.whereLine()), 'wet/dry rough line', Game.whereLine());
  Game.state.region = 'na_eastern_woodlands';

  // ============ W9 wiring ============
  console.log('\n[W9] wiring');
  const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
  const head = (app.match(/function expHeadHTML[\s\S]*?\n  \}/) || [''])[0];
  ok(/Game\.whereLine\(\)/.test(head), 'app.js day header (expHeadHTML) renders Game.whereLine()');
  ok(/whereAreWe\.js/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')), 'index.html loads whereAreWe.js');

  console.log(`\ntest-where-are-we: ${pass} passed, ${fail} failed`);
  if (fail) console.log('failing: ' + failures.join(' | '));
  process.exitCode = fail ? 1 : 0;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
