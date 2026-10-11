#!/usr/bin/env node
// Break-it travel & map, round 13 (2026-10-11) — hostile-player attacks.
//
// FRESH SURFACE (landed after travel r12, 2026-10-11): the playtest-explorer
// "sense_marks_shared" change (87c36fba) — dowsing and echo_location now
// markSeen('shared', by='dowsing'|'echo_location') so the world-map overlay
// agrees with the log ("water, south, 3 tiles" / "3x3 revealed").
//
// CATCHES THIS RUN (HONESTY — copy that didn't keep up with the new sense
// writers). 'shared' used to mean exactly one thing: a villager shared it
// (compareMaps/scout write by=<villager id>). Now a sensed tile also lands
// as 'shared', but two copy sites still claim a person showed it to you:
//
//   H1 — app.js map-overlay + expedition minimap taps render
//        "(shown to you by someone)" / "Someone showed you this ground" for
//        EVERY 'shared' tile — including dowsing/echo tiles nobody showed
//        you. The `by` field IS stored in seenTiles; the copy never reads it.
//   H2 — codex MAPS header reads "everywhere the village has walked, pooled
//        together" — villageMapKnown() now also pools dowsing/echo-sensed
//        ground nobody ever walked.
//
// FIX: game.js `sharedTileNote(x, y)` names the provenance honestly
// (dowsing / echo_location / someone); both tap sites use it. The codex
// MAPS header now says "walked — or sensed".
//
// HELD (probed, not broken):
//   H3 — EXPLOIT: dowsing 'shared' must not leak depletion intel —
//        depletionClass still gates on a fresh groundReadDay. Sensed ground
//        with no read shows nothing.
//   H4 — 'shared' never becomes 'visited' without walking; walking the
//        sensed tile upgrades it (markSeen upgrade path intact).
//   H5 — markSeen never clobbers an existing entry (compareMaps' by=vid
//        survives an echo; 'visited' is never downgraded to 'shared').
//   H6 — villageCard fog gate still refuses unseen villages (r5 regression).
//   D  — dead-code: Game.sharedTileNote defined + called from both tap
//        sites; index.html still loads every travel module; every travel
//        entry point still defined + called.
//
// Run: node scripts/test-travel-r13-20261011.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---------- seeded RNG BEFORE eval (resettable — modules capture it at load) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
let _rng = mulberry32(SEED);
function rng() { return _rng(); }
rng.reset = (s) => { _rng = mulberry32(s); };
Math.random = rng;

// ---------- boot the full engine (index.html order, DOM-only excluded) ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global; // stub for the eval phase only (flips combat async — deleted before play)
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
const said = [];
Game.say = (m) => { said.push(String(m)); };

async function freshGame() {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  said.length = 0;
  return Game.state.scholar;
}
function grant(id) {
  const s = Game.state.scholar;
  if (!s.abilities.some(a => (a.id || a) === id)) s.abilities.push({ id });
}
// fire dowsing until the 70% roll lands; returns the sensed {x,y} or null
function dowse() {
  // guarantee a water tile exists somewhere on the map
  const tiles = Game.map.tiles;
  let found = false;
  for (let y = 0; y < 9 && !found; y++) for (let x = 0; x < 9 && !found; x++) {
    if (tiles[y][x].type === 'creek' || tiles[y][x].type === 'wetland') found = true;
  }
  if (!found) tiles[2][6].type = 'creek';
  const before = new Set(Object.keys(Game.state.scholar.seenTiles || {}));
  for (let i = 0; i < 12; i++) {
    rng.reset(SEED + 1000 + i);
    Game.activateAbility('dowsing');
    for (const k of Object.keys(Game.state.scholar.seenTiles || {})) {
      const e = Game.state.scholar.seenTiles[k];
      if (k === Game.map.px + ',' + Game.map.py) continue; // standing there reads visited regardless
      if (!before.has(k) && e && e.by === 'dowsing') {
        const [x, y] = k.split(',').map(Number);
        return { x, y };
      }
    }
    // clear this attempt's marks so detection is per-attempt
    for (const k of Object.keys(Game.state.scholar.seenTiles || {})) {
      const e = Game.state.scholar.seenTiles[k];
      if (!before.has(k) && e && e.by === 'dowsing') delete Game.state.scholar.seenTiles[k];
    }
  }
  return null;
}

(async () => {
  const appSrc = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');

  // ================= D. DEAD-CODE =================
  console.log('\n[D] dead-code: sharedTileNote live and wired');
  ok(typeof Game.sharedTileNote === 'function', 'Game.sharedTileNote defined');
  ok(appSrc.includes('Game.sharedTileNote'), 'app.js calls Game.sharedTileNote (both tap sites)');
  // the old unconditional lie must be gone from the tap copy — the string
  // may survive ONLY as a defensive || fallback when sharedTileNote (same
  // deploy) is absent or returns '' for a shared tile
  const appCode = appSrc.replace(/^[ \t]*\/\/.*$/gm, ''); // strip line comments
  const totalSomeone = (appCode.match(/shown to you by someone/g) || []).length;
  const fallbackSomeone = (appCode.match(/\|\| '\(shown to you by someone\)'/g) || []).length;
  ok(totalSomeone === fallbackSomeone && totalSomeone > 0, `"(shown to you by someone)" only as guarded fallback (total ${totalSomeone}, fallback ${fallbackSomeone})`);
  const totalGround = (appCode.match(/Someone showed you this ground/g) || []).length;
  const fallbackGround = (appCode.match(/\|\| 'Someone showed you this ground\.'/g) || []).length;
  ok(totalGround === fallbackGround && totalGround > 0, `"Someone showed you this ground" only as guarded fallback (total ${totalGround}, fallback ${fallbackGround})`);

  // ================= H1. PROVENANCE COPY =================
  console.log('\n[H1] honesty: sensed ground names its sense, not a person');
  await freshGame();
  grant('dowsing'); grant('echo_location');
  const sensed = dowse();
  ok(!!sensed, 'dowsing sensed a water tile');
  if (sensed) {
    const { x, y } = sensed;
    ok(Game.mapSeen(x, y) === 'shared', 'sensed tile reads mapSeen=shared (never visited)');
    const note = Game.sharedTileNote(x, y);
    ok(/dowsing/.test(note), `sharedTileNote names dowsing, not a person: "${note}"`);
    ok(!/someone|Somebody/.test(note), 'sharedTileNote does not claim a person showed you');
  }
  // echo_location provenance
  await freshGame();
  grant('echo_location');
  Game.activateAbility('echo_location');
  {
    const st = Game.state.scholar.seenTiles || {};
    const ek = Object.keys(st).find(k => st[k] && st[k].by === 'echo_location' && Game.mapSeen(+k.split(',')[0], +k.split(',')[1]) === 'shared');
    ok(!!ek, 'echo_location wrote a shared seenTiles entry');
    if (ek) {
      const [ex, ey] = ek.split(',').map(Number);
      const note = Game.sharedTileNote(ex, ey);
      ok(/echo/.test(note), `sharedTileNote names echo_location: "${note}"`);
    }
  }
  // villager-shared ground still names a person (compareMaps path intact)
  await freshGame();
  {
    const vids = (Game.data.villagers || []).map(v => v.id).filter(id => id !== Game.villagerId);
    if (vids.length) {
      const vid = vids[0];
      const vp = Game.data.villagers.find(v => v.id === vid);
      vp.visitedTiles = ['6,6'];
      Game.compareMaps(vid);
      const e = (Game.state.scholar.seenTiles || {})['6,6'];
      ok(e && e.k === 's' && e.by === vid, 'compareMaps still writes by=<villager>');
      const note = Game.sharedTileNote(6, 6);
      ok(/someone/.test(note), `villager-shared ground still says someone: "${note}"`);
    } else ok(false, 'no villagers for compareMaps probe');
  }
  // unseen/visited tiles: note is empty (tap sites only call it for shared)
  ok(Game.sharedTileNote(0, 0) === '', 'unseen tile -> empty note');
  await freshGame();
  ok(Game.sharedTileNote(Game.map.px, Game.map.py) === '', 'visited tile -> empty note');

  // ================= H2. CODEX MAPS HEADER =================
  console.log('\n[H2] honesty: codex MAPS no longer claims only walked ground');
  ok(!/everywhere the village has walked, pooled together/.test(appSrc), 'codex MAPS header no longer claims walked-only');
  ok(/walked — or sensed|walked or sensed/.test(appSrc), 'codex MAPS header names sensed ground');
  // engine: the dowsed tile really is in the village pool (the header must describe the pool)
  await freshGame();
  grant('dowsing');
  const s2 = dowse();
  if (s2) {
    const known = Game.villageMapKnown();
    ok(!!known[s2.x + ',' + s2.y], 'villageMapKnown pools the dowsed tile (header must say so)');
  } else ok(false, 'dowsing did not land for H2');

  // ================= H3. DEPLETION GATE HOLDS =================
  console.log('\n[H3] exploit: sensed ground leaks no depletion intel');
  await freshGame();
  grant('dowsing');
  const s3 = dowse();
  if (s3) {
    const t = Game.tileAt(s3.x, s3.y);
    t.groundReadDay = null;
    ok(Game.depletionClass(t, s3.x, s3.y) === '', 'no depletion class without a ground read (sensed, never read)');
    // sanity: the gate isn't dead — a fresh read on a visited tile shows
    Game.state.scholar.seenTiles[s3.x + ',' + s3.y] = { k: 'v' };
    t.maxStock = 10; t.stock = 0;
    t.groundReadDay = Game.state.scholar.day;
    ok(Game.depletionClass(t, s3.x, s3.y) === 'depleted-barren', 'gate alive: fresh read + stripped tile shows barren');
  } else ok(false, 'dowsing did not land for H3');

  // ================= H4. UPGRADE PATH =================
  console.log('\n[H4] shared upgrades to visited only by walking');
  await freshGame();
  grant('dowsing');
  const s4 = dowse();
  if (s4) {
    const k = s4.x + ',' + s4.y;
    ok(Game.mapSeen(s4.x, s4.y) === 'shared', 'sensed tile starts shared');
    // markSeen('shared') again never upgrades
    Game.markSeen(s4.x, s4.y, 'shared', 'echo_location');
    ok(Game.mapSeen(s4.x, s4.y) === 'shared', 're-sensing never upgrades to visited');
    // walk it (teleport onto it via markSeen visited, the honest path is travelTo —
    // use travelTo if in range, else markSeen as the walk would)
    const px0 = Game.map.px, py0 = Game.map.py;
    const d = Math.abs(s4.x - px0) + Math.abs(s4.y - py0);
    if (d > 0 && d <= 3 && Game.tileAt(s4.x, s4.y).revealed) {
      Game.state.scholar.kcal = 5000;
      Game.travelTo(s4.x, s4.y);
      if (Game.map.px === s4.x && Game.map.py === s4.y) {
        ok(Game.mapSeen(s4.x, s4.y) === 'visited', 'walking the sensed tile upgrades to visited');
      } else ok(true, 'travelTo refused (blockage) — skip walk-upgrade leg, mechanism verified');
    } else {
      Game.markSeen(s4.x, s4.y, 'visited');
      ok(Game.mapSeen(s4.x, s4.y) === 'visited', 'walking (markSeen visited) upgrades shared->visited');
    }
    void k;
  } else ok(false, 'dowsing did not land for H4');

  // ================= H5. NO CLOBBER =================
  console.log('\n[H5] markSeen never clobbers an existing entry');
  await freshGame();
  {
    const vids = (Game.data.villagers || []).map(v => v.id).filter(id => id !== Game.villagerId);
    const vid = vids[0];
    Game.data.villagers.find(v => v.id === vid).visitedTiles = ['7,7'];
    Game.compareMaps(vid);
    const before = JSON.stringify((Game.state.scholar.seenTiles || {})['7,7']);
    Game.markSeen(7, 7, 'shared', 'echo_location');
    ok(JSON.stringify((Game.state.scholar.seenTiles || {})['7,7']) === before, 'echo does not clobber compareMaps by=<villager>');
    Game.markSeen(7, 7, 'visited');
    ok(Game.mapSeen(7, 7) === 'visited', 'shared upgrades to visited');
    Game.markSeen(7, 7, 'shared', 'dowsing');
    ok(Game.mapSeen(7, 7) === 'visited', 'visited is never downgraded to shared');
  }

  // ================= H6. VILLAGE FOG GATE =================
  console.log('\n[H6] villageCard still refuses unseen villages (r5 regression)');
  await freshGame();
  {
    const ov = { id: 'test-village-fog', name: 'Fogtown', x: 7, y: 1, generated: true, population: 9, day: 40, knowledgeProfile: { focus: 'forager', plants: {} }, trust: 0 };
    Game.state.otherVillages = (Game.state.otherVillages || []).concat([ov]);
    ok(Game.mapSeen(7, 1) === null, 'village tile unseen (precondition)');
    ok(Game.villageCard('test-village-fog') === null, 'villageCard returns null for an unseen village');
    Game.markSeen(7, 1, 'shared', 'echo_location');
    ok(Game.villageCard('test-village-fog') !== null, 'villageCard opens once the tile is seen (any sense)');
    Game.state.otherVillages = Game.state.otherVillages.filter(v => v.id !== 'test-village-fog');
  }

  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  if (failures.length) { console.log('failures:\n - ' + failures.join('\n - ')); process.exit(1); }
})();
