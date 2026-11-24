// journey-deepening-r278-mootclose-stage.js -- Q6 STAGED MOOT-CLOSE DRIVER
// (journey-deepening r278 prereg Q6).
//
// The moot-close invariant (mootedCloses >= liveRunOverwrites) is UNTESTED
// in the wild for four straight bands (r269/r272/r275/r278: 0 overwrites /
// 0 closes each). The r269 unit proof (test-mootclose-r269.js, 36/36) proves
// the closer at the convoStoreFavor level. This driver proves the WILD path
// the panel cannot produce: a sitting whose opener finds a new live need,
// builds a fresh favor, and overwrites the ledger — the r268 Gladys shape
// (seed 101973: stranded forage_help, dead bearer, opener built food_share).
//
// Staging (per part): a fresh game; a promised forage_help / water_haul
// favor with a LIVE joint run whose bearer <redacted> dead predecessor (the
// r269 staging: promisedFavor + liveRun/liveWaterRun + strandRun +
// killPerson); then hunger set > 70 so convoFindFavorNeed returns
// food_share (gate 70, outranks forage_help); then a REAL sitting via
// Game.startConvo(vid) — the picker's weighted pick, the ask_favor opener,
// convoBuildFavor, convoStoreFavor — nothing called directly except the
// staging itself. Part A stamps the succession `inh` field the way
// playerDeath stamps it, so the opener takes the honest-moot branch
// ("Never mind {short} — we got it handled."); Part B omits the stamp
// (the store-close still fires; the line is the fresh ask). Part C is the
// control: no live need staged, so no overwrite happens and the run stays
// live — the overwrite is need-driven, not automatic.
//
// Bar (prereg Q6): the staged overwrite closes the run mooted on every
// staged seed. A miss is a defect in the r269 fix's wiring, not a metric
// question. Staged seeds 109401-109404: fresh by the r278 prereg check
// (0 prereg hits; the one grep hit is a kcal float 3184.570109401329 in a
// Nov-20 census JSON, not a seed reservation).
//
// Run: node scripts/journey-deepening-r278-mootclose-stage.js
// Writes nothing to the repo; exits non-zero on any failure.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

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

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
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
      try { teleSeen.push({ name, data }); } catch (e) { console.warn('mootclose-stage: teleSeen push failed', e && e.message); }
      try { return _tele(name, data); } catch (e) { console.warn('mootclose-stage: tele error', name, e && e.message); return null; }
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
      playerHaul: [{ itemId: 'test-venison-r278', name: 'Test venison', kcalEach: 100, units: 2, edible: true }],
      partnerHaul: [{ itemId: 'test-venison-r278', name: 'Test venison', kcalEach: 75, units: 2, edible: true }],
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
  function setHunger(vid, h) {
    try { Game.npcNeeds(vid).hunger = h; } catch (e) { /* staging must fail loudly below */ throw e; }
  }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) { console.warn('mootclose-stage: endConvo failed', e && e.message); } }
  // Open sittings until one opens on ask_favor (maxAttempts). The picker is
  // a weighted race with jitter — the first sitting of a fresh game can open
  // on curious even with an urgency-4 need live (seed 109402: curious won
  // attempt 0, ask_favor won attempt 1). Each attempt is a real sitting
  // through the real path; a non-favor sitting touches neither the ledger
  // nor the run. Returns the ask_favor sitting, or null if it never won.
  function openAskFavor(vid, hunger, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
      const r = Game.startConvo(vid);
      const conv = Game.convoGet(vid);
      const line = (r && r.line) || '';
      if (conv && conv.want && conv.want.id === 'ask_favor') return { r, conv, line, attempts: i + 1 };
      endSit(vid);
      try { Game.npcNeeds(vid).hunger = hunger; } catch (e) { console.warn('mootclose-stage: hunger restore failed', e && e.message); }
    }
    return null;
  }
  return { Game, day0, living, home, teleSeen, promisedFavor, liveRun, liveWaterRun,
    strandRun, killPerson, setHunger, endSit, openAskFavor };
}

async function main() {
  // --- Part A: forage run, dead bearer, succession stamp (the Gladys shape).
  // The opener must take the honest-moot branch AND the store must close
  // the run mooted, through a real sitting.
  {
    const t = await freshGame(109401);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = t.living[1] || t.living[0];
    const predName = (() => { try { return String(Game.displayName(pred)).split(' ')[0]; } catch (e) { return 'Pred'; } })();
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    c.f.inh = predName; // succession stamp, as playerDeath writes it
    t.setHunger(vid, 85);
    check('A0b food_share need is live', (() => { try { const n = Game.convoFindFavorNeed(vid); return n && n.kind === 'food_share'; } catch (e) { return false; } })(),
      JSON.stringify((() => { try { return Game.convoFindFavorNeed(vid); } catch (e) { return null; } })()));
    const pantryBefore = pantryKcal(Game);
    const opened = t.openAskFavor(vid, 85, 5);
    check('A0c a sitting opens on ask_favor', !!opened, 'attempts=' + (opened && opened.attempts));
    const r = opened.r;
    const conv = opened.conv;
    const line = opened.line;
    check('A1 want is ask_favor', conv && conv.want && conv.want.id === 'ask_favor', 'want=' + (conv && conv.want && conv.want.id));
    check('A2 opener speaks the honest moot prefix', /Never mind/i.test(line) && /we got it handled/i.test(line), 'line=' + JSON.stringify(line));
    const nf = Game.convoGetFavor(vid);
    check('A3 ledger now holds the fresh favor', !!(nf && nf.id !== c.f.id && nf.kind === 'food_share'), JSON.stringify(nf && { id: nf.id, kind: nf.kind }));
    check('A4 old run is returned after the sitting opener', !!(c.f.forageRun && c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('A5 old run delivered 0 kcal', (c.f.forageRun.deliveredKcal || 0) === 0, 'deliveredKcal=' + JSON.stringify(c.f.forageRun.deliveredKcal));
    check('A6 old run is marked mooted', c.f.forageRun.mooted === true, 'mooted=' + JSON.stringify(c.f.forageRun.mooted));
    check('A7 old favor state is moot', c.f.state === 'moot', 'state=' + c.f.state);
    check('A8 mooted return tele fired', t.teleSeen.some(e => e.name === 'favor_forage_return' && e.data && e.data.mooted === true && e.data.favorId === c.f.id && e.data.deliveredKcal === 0),
      JSON.stringify(t.teleSeen.filter(e => e.name === 'favor_forage_return')));
    check('A9 pantry unchanged by the moot-close', pantryKcal(Game) === pantryBefore, 'before=' + pantryBefore + ' after=' + pantryKcal(Game));
    t.endSit(vid);
  }

  // --- Part B: water run, dead bearer, NO succession stamp. The store-close
  // must still fire through the real opener; the line is the fresh ask.
  {
    const t = await freshGame(109402);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = t.living[1] || t.living[0];
    const c = t.promisedFavor(vid, 'water_haul');
    check('B0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveWaterRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    t.setHunger(vid, 85);
    const cisternBefore = cisternLiters(Game);
    const opened = t.openAskFavor(vid, 85, 5);
    check('B0c a sitting opens on ask_favor', !!opened, 'attempts=' + (opened && opened.attempts));
    const r = opened.r;
    const conv = opened.conv;
    const line = opened.line;
    check('B1 want is ask_favor', conv && conv.want && conv.want.id === 'ask_favor', 'want=' + (conv && conv.want && conv.want.id));
    check('B2 opener asks the fresh favor (no inherited prefix without a stamp)', !!line && !/Never mind/i.test(line), 'line=' + JSON.stringify(line));
    const nf = Game.convoGetFavor(vid);
    check('B3 ledger now holds the fresh favor', !!(nf && nf.id !== c.f.id && nf.kind === 'food_share'), JSON.stringify(nf && { id: nf.id, kind: nf.kind }));
    check('B4 old water run is returned', !!(c.f.waterRun && c.f.waterRun.returned), JSON.stringify(c.f.waterRun && c.f.waterRun.returned));
    check('B5 old water run delivered 0 liters', (c.f.waterRun.deliveredLiters || 0) === 0, 'deliveredLiters=' + JSON.stringify(c.f.waterRun.deliveredLiters));
    check('B6 old water run is marked mooted', c.f.waterRun.mooted === true, 'mooted=' + JSON.stringify(c.f.waterRun.mooted));
    check('B7 mooted water return tele fired', t.teleSeen.some(e => e.name === 'favor_water_return' && e.data && e.data.mooted === true && e.data.favorId === c.f.id),
      JSON.stringify(t.teleSeen.filter(e => e.name === 'favor_water_return')));
    check('B8 cistern unchanged by the moot-close', cisternLiters(Game) === cisternBefore, 'before=' + cisternBefore + ' after=' + cisternLiters(Game));
    t.endSit(vid);
  }

  // --- Part C: forage run, dead bearer, NO stamp, NO live need (hunger low,
  // pantry plentiful). The opener must NOT build a fresh favor and the run
  // must stay live — the overwrite is need-driven, not automatic.
  {
    const t = await freshGame(109403);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = t.living[1] || t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('C0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    t.setHunger(vid, 10);
    const need = (() => { try { return Game.convoFindFavorNeed(vid); } catch (e) { return 'ERR'; } })();
    check('C0b no live need staged', !need || need.kind === 'forage_help', 'need=' + JSON.stringify(need));
    const teleBefore = t.teleSeen.length;
    // Up to 5 sittings: with no live need the picker may still open on
    // ask_favor if the old forage_help need itself is live — but then the
    // opener takes the same-kind followup branch and stores nothing. Either
    // way the ledger must keep the stranded favor and the run must stay live.
    let askFavorOpened = 0;
    for (let i = 0; i < 5; i++) {
      const r = Game.startConvo(vid);
      const conv = Game.convoGet(vid);
      if (conv && conv.want && conv.want.id === 'ask_favor') {
        askFavorOpened++;
        check('C1 ask_favor opening without a fresh need keeps the stranded favor',
          Game.convoGetFavor(vid) === c.f, 'want=ask_favor ledger=' + JSON.stringify(Game.convoGetFavor(vid) && Game.convoGetFavor(vid).id) + ' line=' + JSON.stringify((r && r.line) || ''));
      }
      t.endSit(vid);
      try { Game.npcNeeds(vid).hunger = 10; } catch (e) { console.warn('mootclose-stage: hunger restore failed', e && e.message); }
    }
    check('C1b control ran its sittings', true, 'askFavorOpened=' + askFavorOpened);
    check('C2 ledger still holds the stranded favor', Game.convoGetFavor(vid) === c.f, JSON.stringify(Game.convoGetFavor(vid) && Game.convoGetFavor(vid).id));
    check('C3 run stays live (not returned)', !!(c.f.forageRun && !c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('C4 no mooted tele without an overwrite', !t.teleSeen.slice(teleBefore).some(e => e.data && e.data.mooted === true),
      JSON.stringify(t.teleSeen.slice(teleBefore).filter(e => e.data && e.data.mooted === true)));
    t.endSit(vid);
  }

  console.log(`\nmootclose-stage r278: ${pass} passed`);
}

main().then(() => process.exit(0)).catch(e => { console.error('FAIL mootclose-stage r278:', e && e.stack || e); process.exit(1); });
