#!/usr/bin/env node
// Proof: MOOT-CLOSE — a ledger overwrite closes a live joint run's books
// (journey-deepening r269, r268 follow-up: Mechanism B).
//
// r268 panel, seed 101973: Gladys, forage_help, bearer Samuel dead, run
// unreturned, 1 stranded dawn then GONE — the sit's opener found a new
// live need (food_share), built a fresh favor, and convoStoreFavor
// overwrote the ledger. The stranded forage favor was destroyed before
// the menu was built: the joint ledger no longer lists it, the stranded
// detector never saw it again, and the run's books were never closed.
// The spoken line ("Never mind the pantry run — we got it handled") was
// true in words and false on the books.
// GREEN (post-fix): convoStoreFavor closes the evicted favor's live run
// (forage_help AND water_haul) when a different favor id overwrites it:
// returned=true, returnedDay=today, delivered 0, mooted:true, tele
// favor_forage_return / favor_water_return with mooted:true. The player
// keeps what they carry; the pantry/cistern receives 0; the partner's
// virtual share is never conjured (r81 / BEARER-END r265 honesty rule).
// Same-id re-stores (the same favor saved again) are untouched.
// Staging mirrors test-bearer-end-r265.js + test-strandedclose-menu-r268.js.
// Uses the shared harness (scripts/sim-harness). Exits nonzero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let pass = 0;
function check(name, cond, extra) {
  assert(cond, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return null; }
}
function cisternLiters(Game) {
  try { const w = (Game.state.village || {}).water || {}; return (w.clean || 0) + (w.dirty || 0); }
  catch (e) { return null; }
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 269, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const day0 = (Game.state.scholar || {}).day || 0;
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  const v = Game.state.village || {};
  const home = (Number.isFinite(v.px) && Number.isFinite(v.py)) ? { x: v.px, y: v.py } : { x: 4, y: 4 };
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) { Game.map.px = v.px; Game.map.py = v.py; }
  Game.dayPart = 0;
  const teleSeen = [];
  const _tele = Game.tele ? Game.tele.bind(Game) : null;
  if (_tele) {
    Game.tele = function (name, data) {
      try { teleSeen.push({ name, data }); } catch (e) {}
      try { return _tele(name, data); } catch (e) { return null; }
    };
  }
  function promisedFavor(vid, kind) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day0 - 7, deadline: (day0 - 7) + 2, line: '"test"', short: 'test' };
    Game.convoStoreFavor(f);
    const r = Game.convoFavorCommit(vid, f);
    return { f, r };
  }
  function placeAdjacent(vid) {
    const vv = Game.state.village || {}, s = Game.state.scholar || {};
    vv.nodePos = vv.nodePos || {}; vv.nodePos[vid] = { nx: home.x, ny: home.y };
    vv.positions = vv.positions || {};
    vv.positions[vid] = { mx: (s.mx ?? 4), my: (s.my ?? 4) };
    vv.npcInside = vv.npcInside || {}; vv.npcInside[vid] = false;
    s.insideHaven = false;
    if (vv.away) delete vv.away[vid];
  }
  function liveRun(vid, f) {
    f.forageRun = { bearer: Game.villagerId, startedDay: day0,
      playerHaul: [{ itemId: 'test-venison-r269', name: 'Test venison', kcalEach: 100, units: 2, edible: true }],
      partnerHaul: [{ itemId: 'test-venison-r269', name: 'Test venison', kcalEach: 75, units: 2, edible: true }],
      forageCount: 1, talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  function liveWaterRun(vid, f) {
    f.waterRun = { bearer: Game.villagerId, startedDay: day0,
      target: { x: home.x + 1, y: home.y },
      partnerWater: [{ liters: 2, quality: 'clean' }], returned: false };
    placeAdjacent(vid);
    return f.waterRun;
  }
  function strandRun(vid, f, predecessorId) {
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'released'; p.inherited = true; }
    f.state = 'asked';
    const run = f.forageRun || f.waterRun;
    if (run) run.bearer = predecessorId;
    return run;
  }
  function killPerson(id) {
    const p = Game.getPerson(id);
    if (p) p.dead = true;
    return p;
  }
  // The overwrite trigger: a fresh favor for the same villager (the
  // opener's new build), stored through the ledger's single overwrite
  // point — exactly what the r268 panel's Gladys sitting did.
  function overwriteFavor(vid, kind) {
    const nf = { id: 'test-' + kind + '-' + String(vid) + '-moot', vid, kind, goal: kind,
      task: 'test ' + kind, state: 'asked', askedDay: day0, deadline: day0 + 2,
      line: '"test new"', short: 'test new' };
    Game.convoStoreFavor(nf);
    return nf;
  }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  return { Game, day0, living, home, teleSeen, promisedFavor, liveRun, liveWaterRun,
    strandRun, killPerson, overwriteFavor, endSit };
}

async function main() {
  const predecessor = (t) => t.living[1] || t.living[0];
  const src = fs.readFileSync(path.join(ROOT, 'src/js/convo-wants.js'), 'utf8');

  // A: forage run, dead bearer, mooted by a kind change (the Gladys
  // shape). The overwrite must close the run's books, honestly.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    const pantryBefore = pantryKcal(Game);
    const invBefore = ((Game.state.scholar || {}).inventory || []).length;
    const nf = t.overwriteFavor(vid, 'food_share');
    check('A1 ledger now holds the new favor', Game.convoGetFavor(vid) === nf, JSON.stringify(Game.convoGetFavor(vid) && Game.convoGetFavor(vid).id));
    check('A2 old run is returned after the overwrite', !!(c.f.forageRun && c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('A3 old run delivered 0 kcal', (c.f.forageRun.deliveredKcal || 0) === 0, 'deliveredKcal=' + JSON.stringify(c.f.forageRun.deliveredKcal));
    check('A4 old run delivered 0 player kcal', (c.f.forageRun.deliveredPlayerKcal || 0) === 0, 'deliveredPlayerKcal=' + JSON.stringify(c.f.forageRun.deliveredPlayerKcal));
    check('A5 old run delivered 0 partner kcal', (c.f.forageRun.deliveredPartnerKcal || 0) === 0, 'deliveredPartnerKcal=' + JSON.stringify(c.f.forageRun.deliveredPartnerKcal));
    check('A6 old run is marked mooted', c.f.forageRun.mooted === true, 'mooted=' + JSON.stringify(c.f.forageRun.mooted));
    check('A7 old favor state is moot', c.f.state === 'moot', 'state=' + c.f.state);
    check('A8 mooted return tele fired', t.teleSeen.some(e => e.name === 'favor_forage_return' && e.data && e.data.mooted === true && e.data.favorId === c.f.id && e.data.deliveredKcal === 0), JSON.stringify(t.teleSeen.filter(e => e.name === 'favor_forage_return')));
    check('A9 pantry unchanged by the moot-close', pantryKcal(Game) === pantryBefore, 'before=' + pantryBefore + ' after=' + pantryKcal(Game));
    check('A10 player inventory untouched', ((Game.state.scholar || {}).inventory || []).length === invBefore, 'before=' + invBefore);
    t.endSit(vid);
  }

  // B: water run, dead bearer — same honest close, cistern unchanged.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'water_haul');
    check('B0 water commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveWaterRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    const cisternBefore = cisternLiters(Game);
    const nf = t.overwriteFavor(vid, 'food_share');
    check('B1 ledger now holds the new favor', Game.convoGetFavor(vid) === nf);
    check('B2 old water run is returned', !!(c.f.waterRun && c.f.waterRun.returned), JSON.stringify(c.f.waterRun && c.f.waterRun.returned));
    check('B3 old water run delivered 0 liters', (c.f.waterRun.deliveredLiters || 0) === 0, 'deliveredLiters=' + JSON.stringify(c.f.waterRun.deliveredLiters));
    check('B4 partner water is dropped, never conjured', Array.isArray(c.f.waterRun.partnerWater) && c.f.waterRun.partnerWater.length === 0, JSON.stringify(c.f.waterRun.partnerWater));
    check('B5 old water run is marked mooted', c.f.waterRun.mooted === true, 'mooted=' + JSON.stringify(c.f.waterRun.mooted));
    check('B6 mooted water return tele fired', t.teleSeen.some(e => e.name === 'favor_water_return' && e.data && e.data.mooted === true && e.data.favorId === c.f.id && e.data.cleanLiters === 0 && e.data.riskyLiters === 0), JSON.stringify(t.teleSeen.filter(e => e.name === 'favor_water_return')));
    check('B7 cistern unchanged by the moot-close', cisternLiters(Game) === cisternBefore, 'before=' + cisternBefore + ' after=' + cisternLiters(Game));
    t.endSit(vid);
  }

  // C: living previous bearer — the overwrite still closes the run. The
  // spoken "we got it handled" claims the need is gone; the books must
  // agree even when the bearer <redacted> alive. (The run is detached either
  // way — leaving it live would strand it invisibly.)
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    // predecessor stays alive.
    t.overwriteFavor(vid, 'food_share');
    check('C1 living-bearer <redacted> closes on overwrite too', !!(c.f.forageRun && c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('C2 living-bearer <redacted> delivers 0', (c.f.forageRun.deliveredKcal || 0) === 0);
    check('C3 living-bearer <redacted> tele fired', t.teleSeen.some(e => e.name === 'favor_forage_return' && e.data && e.data.mooted === true && e.data.favorId === c.f.id));
    t.endSit(vid);
  }

  // D: no live run — the overwrite is a no-op for the closer (no tele,
  // no crash) and the ledger still swaps.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    c.f.state = 'moot';
    const teleBefore = t.teleSeen.length;
    const nf = t.overwriteFavor(vid, 'food_share');
    check('D1 ledger swaps with no run', Game.convoGetFavor(vid) === nf);
    check('D2 no mooted tele without a run', !t.teleSeen.slice(teleBefore).some(e => e.data && e.data.mooted === true), JSON.stringify(t.teleSeen.slice(teleBefore)));
    check('D3 direct close returns false with no run', Game.convoCloseMootedRun(c.f) === false);
    t.endSit(vid);
  }

  // E: same-id re-store — saving the same favor again must NOT close
  // its live run (the run is still being worked).
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    Game.convoStoreFavor(c.f);
    check('E1 same-id re-store leaves the run live', !!(c.f.forageRun && !c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('E2 same-id re-store fires no mooted tele', !t.teleSeen.some(e => e.data && e.data.mooted === true));
    t.endSit(vid);
  }

  // F: already-returned run — the overwrite must not re-close it (the
  // original returnedDay and delivered totals stand) and fires no
  // second tele.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    c.f.forageRun.returned = true;
    c.f.forageRun.returnedDay = t.day0 - 1;
    c.f.forageRun.deliveredKcal = 350;
    const teleBefore = t.teleSeen.length;
    t.overwriteFavor(vid, 'food_share');
    check('F1 returnedDay stands', c.f.forageRun.returnedDay === t.day0 - 1, 'returnedDay=' + JSON.stringify(c.f.forageRun.returnedDay));
    check('F2 delivered total stands', c.f.forageRun.deliveredKcal === 350, 'deliveredKcal=' + JSON.stringify(c.f.forageRun.deliveredKcal));
    check('F3 no second tele for an already-returned run', !t.teleSeen.slice(teleBefore).some(e => e.data && e.data.mooted === true));
    t.endSit(vid);
  }

  // G: code pins — the close lives in the ledger's single overwrite
  // point, covering the HONEST MOOT branch and the silent overwrite
  // alike (convoStoreFavor has exactly one caller).
  check('G1 store closes the evicted run', /convoCloseMootedRun\(prev\)/.test(src));
  check('G2 close is guarded to a different favor id', /prev\.id !== favor\.id/.test(src));
  check('G3 forage close marks returned + 0 kcal + mooted', /favor\.kind === 'forage_help'[\s\S]*?r\.returned = true[\s\S]*?r\.deliveredKcal = 0[\s\S]*?r\.mooted = true/.test(src));
  check('G4 water close marks returned + 0 liters + mooted', /favor\.kind === 'water_haul'[\s\S]*?r\.returned = true[\s\S]*?r\.deliveredLiters = 0[\s\S]*?r\.mooted = true/.test(src));
  check('G5 forage moot tele carries mooted:true', /tele\('favor_forage_return'[\s\S]*?mooted: true/.test(src));
  check('G6 water moot tele carries mooted:true', /tele\('favor_water_return'[\s\S]*?mooted: true/.test(src));

  console.log('PASS test-mootclose-r269: ' + pass + ' checks');
}

main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
