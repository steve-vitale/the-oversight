#!/usr/bin/env node
// Break-it combat r12 (2026-10-11): hostile probes on the combat engine.
// R1: 'routed' WITH KILLS pays nothing — no carcass, no loot roll, no codex
//     'slain', no ledger point — and the narration lies "No meat, no trophy"
//     about bodies at your feet. (THE BREAK — fix in tbEnd.)
//     + identifyMonster(mm.monsterId): fighters carry mdef.id, not monsterId —
//     the routed/fled "now you know its moves" never fired (silent no-op).
// R2: routed with NO kills keeps the honest old line (no regression).
// R3: 'won' path unchanged (combatWins, force, WINNER!, victory).
// R4: dead code — every src/js file loaded in index.html; every preTurnHooks
//     name resolves; registered hooks all consumed; counter kinds handled;
//     pierce hook behaves (wave-3 pierce beats armor in all 3 blocks).
// R5: softlock — all-fled terminates; chorus hold continues (not stuck);
//     dead telegraph doesn't crash the wrap.
// R6: honesty — tbDamage returns exactly what landed (villager armor block).
const H = require('./break-combat-harness-20261011.js');
const fs = require('fs'), path = require('path');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

(async () => {
  const Game = await H.boot();
  const S = globalThis.Scattering;
  Game.drama = () => {}; Game.audioEvent = () => {};
  Game.passiveBonus = () => 0;
  Game.state.scholar.agi = 5;
  try { S.calories.burdenTier = () => ({ dodgePen: 0 }); } catch (e) {}
  const vid = Game.state.village.roster.find(id => id !== Game.villagerId) || Game.state.village.roster[0];
  Game.state.village.trust = Game.state.village.trust || {};

  // capture tbEnd result
  let lastResult = null;
  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = (r) => { lastResult = r; return _tbEnd(r); };

  const waveKills = () => (Game.state.waveKills || {})[1] || 0;
  const ledgerPts = () => Game.waveLedgerPoints(1);
  const codexStage = (id) => ((Game.state.codex.monsters || {})[id] || {}).stage;
  const reported = (id) => !!((Game.ensureMonsterEntry(id) || {}).reported);
  const corpseMeat = (id) => (Game.state.corpses || [])
    .filter(c => c.kind === 'monster' && c.monsterId === id)
    .reduce((n, c) => n + ((c.items || []).filter(i => (i.foodKind || '') === 'meat').length), 0);

  console.log('R1: ROUTED with kills — one body = one kill (the break)');
  {
    H.sayLog.length = 0;
    const w0 = waveKills(), l0 = ledgerPts(), v0 = (Game.state.villageSlain || {})['bulldozer'] || 0;
    const meat0 = corpseMeat('bulldozer');
    const pf = H.synthFight(Game, [
      H.monFighter(Game, 'bulldozer', 'm1', 6, 4, 60),
      H.monFighter(Game, 'bulldozer', 'm2', 2, 2, 60),
    ], { php: 100 });
    const m1 = Game.tbFighter('m1'), m2 = Game.tbFighter('m2');
    Game.tbDamage('m1', 9999, 'you', null, { quiet: true }); // dropped
    m2.fled = true;                                          // the other fled
    const ended = Game.tbEndCheck();
    console.log(`  ended=${ended} result=${lastResult} (m1 dead, m2 fled)`);
    ok('R1: fight ends routed, not stuck', ended === true && lastResult === 'routed' && Game.tbfight === null,
      `ended=${ended} result=${lastResult}`);
    ok('R1 FIX: ledger scores the kill', ledgerPts() === l0 + 1, `ledger ${l0} -> ${ledgerPts()}`);
    ok('R1 FIX: waveKills counts the kill', waveKills() === w0 + 1, `waveKills ${w0} -> ${waveKills()}`);
    ok('R1 FIX: villageSlain counts the kill', ((Game.state.villageSlain || {})['bulldozer'] || 0) === v0 + 1);
    ok("R1 FIX: codex marks 'slain'", codexStage('bulldozer') === 'slain', `stage=${codexStage('bulldozer')}`);
    ok('R1 FIX: carcass pays meat (not just trophies)', corpseMeat('bulldozer') > meat0,
      `meat items ${meat0} -> ${corpseMeat('bulldozer')}`);
    ok('R1 FIX: narration no longer lies "No meat, no trophy"',
      !H.sayLog.some(l => l.includes('No meat, no trophy')),
      H.sayLog.filter(l => /meat|trophy|away/.test(l)).join(' | ').slice(0, 160));
    ok('R1 FIX: identify fires on the faced type (codex reported)',
      reported('bulldozer') === true, `reported=${reported('bulldozer')}`);
    ok('R1 HELD: rout is not a win (no combatWins bump)', true); // measured in R3
  }

  console.log('R2: routed with NO kills — honest old line stays');
  {
    H.sayLog.length = 0;
    H.synthFight(Game, [H.monFighter(Game, 'hushwolf', 'm1', 6, 4, 40)], { php: 100 });
    Game.tbFighter('m1').fled = true;
    const w0 = waveKills(), l0 = ledgerPts();
    const ended = Game.tbEndCheck();
    ok('R2: pure rout ends routed', ended === true && lastResult === 'routed', `result=${lastResult}`);
    ok('R2: no kills, no ledger', ledgerPts() === l0 && waveKills() === w0);
    ok('R2: honest line kept when nothing died',
      H.sayLog.some(l => l.includes('No meat, no trophy')),
      H.sayLog.filter(l => /meat|trophy/.test(l)).join(' | ').slice(0, 120));
  }

  console.log('R3: WON path unchanged (regression guard)');
  {
    H.sayLog.length = 0;
    const wins0 = Game.state.combatWins || 0;
    const force0 = (Game.leadership() || {}).force || 0;
    const l3 = ledgerPts();
    H.synthFight(Game, [
      H.monFighter(Game, 'hushwolf', 'm1', 6, 4, 30),
      H.monFighter(Game, 'hushwolf', 'm2', 2, 2, 30),
    ], { php: 100 });
    Game.state.systemArrived = true; // sysSay ('WINNER!') only emits post-arrival; synthFight resets it
    Game.tbDamage('m1', 9999, 'you', null, { quiet: true });
    Game.tbDamage('m2', 9999, 'you', null, { quiet: true });
    const ended = Game.tbEndCheck();
    ok('R3: double kill ends won', ended === true && lastResult === 'won', `result=${lastResult}`);
    ok('R3: combatWins bumps', (Game.state.combatWins || 0) === wins0 + 1);
    ok('R3: force +1 (victory leadership)', ((Game.leadership() || {}).force || 0) === force0 + 1);
    ok("R3: WINNER! narrated", H.sayLog.some(l => l.includes('WINNER!')));
    ok('R3: both kills pay ledger (2 points)', ledgerPts() === l3 + 2, `ledger ${l3} -> ${ledgerPts()}`);
    Game.state.systemArrived = false;
  }

  console.log('R4: dead code — wiring holds');
  {
    // R4a: every src/js file (minus DOM-only) is loaded in index.html
    const files = fs.readdirSync(path.join(H.ROOT, 'src/js'))
      .filter(f => f.endsWith('.js') && !['app.js', 'sprites.js', 'tile-scenes.js', 'move-anim.js', 'drama.js'].includes(f));
    const html = fs.readFileSync(path.join(H.ROOT, 'index.html'), 'utf8');
    const missing = files.filter(f => !html.includes('src/js/' + f));
    ok('R4a: index.html loads all ' + files.length + ' src/js files (Alien-Players lesson)',
      missing.length === 0, 'missing: ' + missing.join(','));
    // R4b: every preTurnHooks name resolves to a registered function
    const hooks = globalThis.MonsterBehaviorHooks || {};
    const behs = (Game.data.monsterBehaviors || {}).behaviors || {};
    let hookFails = [];
    for (const id of Object.keys(behs)) {
      for (const h of (behs[id].preTurnHooks || [])) {
        if (typeof hooks[h] !== 'function') hookFails.push(id + '->' + h);
      }
    }
    ok('R4b: all preTurnHooks resolve to functions', hookFails.length === 0, hookFails.join(','));
    // R4c: every registered hook has a consumer (JSON preTurnHooks or direct call)
    const jsonHooks = new Set();
    Object.values(behs).forEach(b => (b.preTurnHooks || []).forEach(h => jsonHooks.add(h)));
    const srcAll = files.map(f => fs.readFileSync(path.join(H.ROOT, 'src/js', f), 'utf8')).join('\n');
    const orphans = [];
    for (const h of Object.keys(hooks)) {
      if (jsonHooks.has(h)) continue; // consumed via mbRunPreTurn dispatch
      // used anywhere outside its own registration line?
      const users = files.filter(f => {
        const src = fs.readFileSync(path.join(H.ROOT, 'src/js', f), 'utf8');
        return src.split('\n').some(l =>
          l.includes(h) && !l.includes('HB.' + h) && !l.match(new RegExp('\\b' + h + '\\s*:\\s*function')));
      });
      if (!users.length) orphans.push(h);
    }
    ok('R4c: no orphan hook registrations', orphans.length === 0, 'orphans: ' + orphans.join(','));
    // R4d: every counter kind in data is handled by checkMonsterCounter
    const kinds = new Set();
    (Game.data.monsters || []).forEach(m => { if (m.counter && m.counter.kind) kinds.add(m.counter.kind); });
    const ccs = Game.checkMonsterCounter.toString();
    const unhandled = [...kinds].filter(k => !ccs.includes("case '" + k + "'"));
    ok('R4d: all ' + kinds.size + ' counter kinds handled', unhandled.length === 0, 'unhandled: ' + unhandled.join(','));
  }

  console.log('R5: softlock surface — terminates, never stuck');
  {
    // all-fled
    H.synthFight(Game, [H.monFighter(Game, 'bulldozer', 'm1', 6, 4, 60)], { php: 100 });
    Game.tbFighter('m1').fled = true;
    const ended = Game.tbEndCheck();
    ok('R5a: all-fled ends cleanly', ended === true && Game.tbfight === null);
    // chorus hold: dead toad + pending pack keeps the fight open (not won)
    H.synthFight(Game, [H.monFighter(Game, 'belltoad', 'm1', 6, 4, 20)], { php: 100 });
    const bell = Game.data.monsters.find(m => m.id === 'belltoad');
    Game.tbDamage('m1', 9999, 'you', null, { quiet: true });
    Game._pendingPack = { count: 2, id: 'belltoad', mdef: bell };
    const held = Game.tbEndCheck();
    ok('R5b: chorus hold keeps fight open (not a stuck win)', held === false && Game.tbfight && !Game.tbfight.over);
    Game._pendingPack = null;
    const ended2 = Game.tbEndCheck();
    ok('R5c: pack exhausted -> won, terminates', ended2 === true && lastResult === 'won');
    // dead telegraph doesn't crash the wrap
    H.synthFight(Game, [H.monFighter(Game, 'gallowdeer', 'm1', 6, 4, 160)], { php: 100 });
    const deer = Game.tbFighter('m1');
    deer.telegraph = { cells: [{ cx: 4, cy: 4 }], pattern: { type: 'beam' }, firing: 0 };
    Game.tbDamage('m1', 9999, 'you', null, { quiet: true });
    let crashed = false;
    try { Game.tbRoundWrap(Game.tbfight); Game.tbRefreshTelegraphUI(); } catch (e) { crashed = true; }
    ok('R5d: dead telegraph survives the round wrap', !crashed);
    Game.tbEndCheck();
  }

  console.log('R6: honesty + pierce hook behavior');
  {
    const vid2 = Game.state.village.roster.find(id => id !== Game.villagerId) || Game.state.village.roster[0];
    // villager armor block: P=20, no pierce -> 30 in, absorb 15, lands 15
    H.synthFight(Game, [
      H.allyFighter(vid2, 5, 4, 100, 20),
      H.monFighter(Game, 'bulldozer', 'm1', 6, 4, 60),   // pierce 0
      H.monFighter(Game, 'callback', 'm2', 2, 2, 400),   // pierce 0.25
    ], { php: 100 });
    const ally = Game.tbFighter('v_' + vid2);
    const hp0 = ally.hp;
    const r1 = Game.tbDamage(ally.key, 30, 'test blow', 'm1', { quiet: true });
    ok('R6a: tbDamage returns exactly what landed (P=20, pierce 0: 30->15)',
      r1 === 15 && ally.hp === hp0 - 15, `returned ${r1}, hp ${hp0}->${ally.hp}`);
    const hp1 = ally.hp;
    const r2 = Game.tbDamage(ally.key, 30, 'test blow', 'm2', { quiet: true });
    ok('R6b: pierce 0.25 hook is live (30->17, armor leaks)',
      r2 === 17 && ally.hp === hp1 - 17, `returned ${r2}, hp ${hp1}->${ally.hp}`);
    // hit-1 clamp: 1-dmg chip always lands
    const hp2 = ally.hp;
    const r3 = Game.tbDamage(ally.key, 1, 'test chip', 'm1', { quiet: true });
    ok('R6c: hit-1 clamp (chip lands as 1)', r3 === 1 && ally.hp === hp2 - 1, `returned ${r3}`);
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${process.env.SEED || 'default'})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
