#!/usr/bin/env node
// Proof: pantry-spoilage + freeload-warning beats must name REAL roster
// villagers (F2 family). RED: "Old Mara mutters" / "Mara corners you" —
// neither Mara exists in the generated 12-person roster.
// GREEN: both beats cast via _beatCast (real living non-player villagers).
//
// Usage: node scripts/test-phantom-beats-r2-20261011.js   (3 seeds)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261011, 777, 424242]);

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const skip = new Set(['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js']);
const files = [...html.matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1].replace(/\?v=.*$/, ''))
  .filter(s => ![...skip].some(x => s === 'src/js/' + x || s.endsWith('/' + x)));
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

// phantom-name detector: a bare "Mara"/"Old Mara" as the SPEAKER of a beat.
// (Roster villagers are legitimately named via displayName; the bug is the
// hardcoded fixed-cast name.)
function speakerOf(line, verb) {
  const segs = String(line).split(/\. (?=[A-Z"])/);
  const seg = segs.find(s => new RegExp('\\s' + verb).test(s)) || String(line);
  const m = seg.match(new RegExp('^(.*?)\\s+' + verb));
  return m ? m[1] : null;
}

async function runSeed(seed) {
  _s = seed >>> 0;
  console.log(`\n### seed ${seed}`);
  const said = [];
  const _say = Game.say;
  Game.say = function (line) { said.push(String(line)); try { return _say.apply(this, arguments); } catch (e) { return line; } };
  try {
    await Game.init();
    Game.genDetail = function () { return {}; };
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();

    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const rosterNames = new Set();
    for (const id of roster) {
      try {
        const dn = Game.displayName(id) || '';
        rosterNames.add(dn);
        rosterNames.add(dn.split(' ')[0]);
        rosterNames.add(dn.split(',')[0]);
      } catch (e) {}
    }
    rosterNames.add('Someone');

    // ---- Part A: pantry spoilage teaching beat (food.js) ----
    said.length = 0;
    const knowsPreserve = Game.knowsTechnique('preserve');
    console.log(`  knowsTechnique('preserve') at start: ${knowsPreserve}`);
    if (!knowsPreserve) {
      Game.state.scholar.day = 2;
      Game.state.village.pantry = Game.state.village.pantry || [];
      Game.state.village.pantry.push({ name: 'Test greens', spoilDay: 0, kcalEach: 10, units: 5 });
      Game.sweepSpoiled();
      const pantryLines = said.filter(l => /threw out spoiled stores/.test(l));
      check('A1: spoilage beat fired', pantryLines.length > 0, `said=${JSON.stringify(said.slice(-3))}`);
      if (pantryLines.length) {
        const line = pantryLines[0];
        const sp = speakerOf(line, 'mutters:');
        check('A2: no phantom "Mara" as speaker', !/\bMara\b/.test(sp || ''), `speaker=${JSON.stringify(sp)} line=${line.slice(0, 120)}`);
        check('A3: speaker is a real roster villager (or Someone)',
          sp && [...rosterNames].some(n => n && sp.indexOf(n) !== -1),
          `speaker=${JSON.stringify(sp)}`);
        console.log(`  beat: ${line.slice(0, 150)}`);
      }
    } else {
      console.log('  (player already knows preserve — spoilage beat takes the other branch; skipping A)');
    }

    // ---- Part B: freeload warning player branch (game.js) ----
    said.length = 0;
    Game.freeloadWarning(Game.villagerId);
    const warnLines = said.filter(l => /corners you by the fire|pull weight/.test(l));
    check('B1: freeload warning fired', warnLines.length > 0, `said=${JSON.stringify(said.slice(-2))}`);
    if (warnLines.length) {
      const line = warnLines.find(l => /corners you/.test(l)) || warnLines[0];
      const sp = speakerOf(line, 'corners you');
      check('B2: no phantom "Mara" as confronter', !/\bMara\b/.test(sp || ''), `speaker=${JSON.stringify(sp)} line=${line.slice(0, 120)}`);
      check('B3: confronter is a real roster villager (or Someone)',
        sp && [...rosterNames].some(n => n && sp.indexOf(n) !== -1),
        `speaker=${JSON.stringify(sp)}`);
      console.log(`  beat: ${line.slice(0, 150)}`);
    }
  } finally {
    Game.say = _say;
  }
}

(async () => {
  for (const seed of SEEDS) { try { await runSeed(seed); } catch (e) { fail++; console.log(`  FATAL seed ${seed}: ${e && e.stack || e}`); } }
  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})();
