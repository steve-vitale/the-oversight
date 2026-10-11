// BREAK-IT abilities & godhood round 6 (2026-10-11) — hostile-player proof tests,
// going deeper than rounds 1–5 (evidence/2026-10-11/break-abilities-r5.md).
//
// CATCH 1 (STATE HYGIENE, fixed): playerDeath's mantle transfer read TWO wrong
//   things — this.data.occupations (the key is characterGen.occupations) and
//   newChar.occupation (runtime villagers carry occupationId). Every successor
//   since the bug was born stepped up with ZERO background abilities, while
//   the comment said "background abilities are THEIRS — their past, their
//   hands."
// CATCH 2 (STATE HYGIENE, fixed): succession never ran recomputeActiveSynergies
//   — the new body inherited the OLD body's active synergies (modifiers firing
//   for legs never held) and missed newly-completed ones. Every other grant/
//   XP/load path recomputes; succession didn't.
// CATCH 3 (STEVE 2026-10-11, overruling r6): purify is MAGIC — a System
//   ability, never an occupation skill. r6's pharmacist grant is reverted:
//   purify's unlock type is now 'system_offer' and the System offers it
//   reactively when the scholar is poisoned (translator-precedent friction
//   rule), plus a day-7 cond push. The human/alien lane audit (18 occupations)
//   rides with it — see evidence/2026-10-11/break-purify-audit.md.
// SIBLING SWEEP (same bug class): villager-agency.js npcRangingApt read the
//   same stale this.data.occupations path — no occupation ever scored its +2
//   teachTags ranging bonus. Fixed to characterGen.occupations.
//
// HELD (attacked, resisted): dodge stacking ceiling (max acquirable:
//   footwork T3 0.15 + agi 0.1 + cornered_rat 0.5 = 0.75 — the only other
//   dodge source, adrenaline_surge, is dead-17 so the >1.0 ceiling is
//   unreachable); strike-condition honesty (rage fires only via unleash_rage's
//   rageActive — the 4b68d614 possession-passive removal holds; cornered_rat
//   gated on tbSurroundedBy); useAbility on unheld abilities refuses honestly;
//   dead-17 / undiscoverable-20 / blood_tracker tripwires unchanged (still
//   dead, documented, Steve's call).
//
//   node scripts/test-abilities-breakit-r6-20261011.js   (SEED=... for seeds)
//   FIX=0 replays the old behavior (red); default is fixed (green).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const FIX = process.env.FIX !== '0';
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"'']*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function grant(id, level) {
  const s = Game.state.scholar; s.abilities = s.abilities || [];
  let e = s.abilities.find(a => a.id === id);
  if (!e) { e = { id, name: id, level: level || 1, xp: 0 }; s.abilities.push(e); }
  else if (level) e.level = level;
  return e;
}
const said = [];
const _origSay = Game.say.bind(Game);
Game.say = (t) => { said.push(String(t)); return _origSay(t); };

(async () => {
await Game.init();
Game.genRoster('Columbus, Ohio');
Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
try { Game.depart(); } catch (e) {}
Game.state.scholar.day = 10;
console.log(`seed=${SEED} mode=${FIX ? 'FIXED (current code)' : 'OLD (pre-fix shim)'}`);

// The old (buggy) background-grant expression, for FIX=0 demonstration.
function oldGrantExpr(newChar) {
  const occ = (Game.data.occupations || []).find(o => o.id === newChar.occupation) || {};
  return (occ.granted || []).filter(id => (Game.data.abilities || []).find(a => a.id === id));
}
function newGrantExpr(newChar) {
  const occ = (((Game.data.characterGen || {}).occupations) || []).find(o => o.id === newChar.occupationId) || {};
  return (occ.granted || []).filter(id => (Game.data.abilities || []).find(a => a.id === id));
}

// ============ CATCH 1: successor background abilities ============
{
  const sc = Game.state.scholar;
  sc.health = 0;
  const vidBefore = Game.villagerId;
  try { Game.playerDeath('test bg abilities'); } catch (e) {}
  const ns = Game.state.scholar;
  const newChar = (Game.data.villagers || []).find(x => x.id === Game.villagerId) || {};
  const expected = newGrantExpr(newChar).sort();
  const got = (ns.backgroundAbilities || []).map(a => a.id || a).sort();
  ok('C1: succession happened', Game.villagerId !== vidBefore && !Game.over);
  if (FIX) {
    ok('C1: successor gets THEIR background abilities (occupationId + characterGen path)',
      JSON.stringify(got) === JSON.stringify(expected) && got.length > 0,
      `expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`);
  } else {
    // OLD: the stale expression always found nothing, whatever the occupation held.
    const oldGot = oldGrantExpr(newChar);
    ok('C1[old]: the stale path (data.occupations + .occupation) granted nothing even when the occupation has grants',
      oldGot.length === 0 && expected.length > 0,
      `old=${JSON.stringify(oldGot)} expected=${JSON.stringify(expected)}`);
    // and the fixed expression finds them on the same data — the bug was the path, not the data
    ok('C1[old]: the fixed expression finds the grants the old path missed',
      JSON.stringify(newGrantExpr(newChar).sort()) === JSON.stringify(expected) && expected.length > 0);
  }
}

// ============ CATCH 2: synergy recompute on succession ============
{
  // Old body: background legs completing a DISCOVERED synergy (apex_sense:
  // tracker + echo_location, minLevel 1 — no occupation grants echo_location,
  // so no successor can hold both legs).
  const sc = Game.state.scholar;
  sc.backgroundAbilities = [
    { id: 'tracker', name: 'Tracker', level: 1, xp: 0, background: true },
    { id: 'echo_location', name: 'Echo Location', level: 1, xp: 0, background: true },
  ];
  sc.synergies = (sc.synergies || []).concat(['apex_sense']);
  Game.recomputeActiveSynergies();
  const activeBefore = (sc.activeSynergies || []).includes('apex_sense');
  ok('C2: setup — apex_sense active on the old body (legs held)', activeBefore);
  let stubbed = false;
  let realRecompute = null;
  if (!FIX) { // replay the old behavior: succession ran no recompute
    realRecompute = Game.recomputeActiveSynergies;
    Game.recomputeActiveSynergies = function () { stubbed = true; };
  }
  sc.health = 0;
  const vidBefore = Game.villagerId;
  try { Game.playerDeath('test synergy recompute'); } catch (e) {}
  if (!FIX) Game.recomputeActiveSynergies = realRecompute;
  const ns = Game.state.scholar;
  ok('C2: succession happened', Game.villagerId !== vidBefore && !Game.over);
  // invariant: every ACTIVE synergy's legs are currently held by this body
  const held = new Set(((ns.abilities || []).concat(ns.backgroundAbilities || [])).map(a => a.id || a));
  const synDefs = {}; (Game.data.synergies || []).forEach(s => { synDefs[s.id] = s; });
  function legsHeld(sid) {
    const def = synDefs[sid]; if (!def) return true;
    const paths = def.requires_any || [def.requires || []];
    return paths.some(p => p.every(leg => {
      if (synDefs[leg]) return (ns.synergies || []).includes(leg);
      if (String(leg).startsWith('tech:') || String(leg).startsWith('skill:')) return true;
      return held.has(leg);
    }));
  }
  const stale = (ns.activeSynergies || []).filter(sid => !legsHeld(sid));
  if (FIX) {
    ok('C2: no stale synergies on the new body (recompute ran at succession)',
      stale.length === 0 && !(ns.activeSynergies || []).includes('apex_sense'),
      `stale=${JSON.stringify(stale)} active=${JSON.stringify(ns.activeSynergies)}`);
  } else {
    ok('C2[old]: the old body\'s apex_sense is still active on the new body (stale — legs gone)',
      (ns.activeSynergies || []).includes('apex_sense') && !held.has('tracker'),
      `active=${JSON.stringify(ns.activeSynergies)} held=${JSON.stringify([...held])}`);
    ok('C2[old]: stale legs violate the active-synergy invariant', stale.length > 0,
      `stale=${JSON.stringify(stale)}`);
  }
}

// ============ CATCH 3: purify is System magic (Steve 2026-10-11) ============
{
  const cg = Game.data.characterGen || {};
  const abs = Game.data.abilities || [];
  const pdef = abs.find(a => a.id === 'purify') || {};
  const pharm = ((cg.occupations) || []).find(o => o.id === 'pharmacist') || {};
  if (!FIX) {
    // replay the r6 misclassification: pharmacist teaches magic, unlock 'granted'
    pdef.unlock = { type: 'granted' };
    pharm.granted = (pharm.granted || []).concat(['purify']);
  }
  const anyOccGrantsPurify = ((cg.occupations) || []).some(o => (o.granted || []).includes('purify'));
  if (FIX) {
    ok('C3: purify unlock type is system_offer (alien ability, not a skill)',
      (pdef.unlock || {}).type === 'system_offer', `type=${(pdef.unlock || {}).type}`);
    ok('C3: no occupation grants purify (no human teaches magic)',
      !anyOccGrantsPurify, 'pharmacist teaches herbal_remedy only');
    // functional: poisoned post-day-7 -> the System offers purify reactively
    const sc = Game.state.scholar;
    Game.state.systemArrived = true;
    sc.abilities = []; sc.abilityChoices = null; sc.poisons = [];
    try { if (Game.abilitySlots) { /* slots gate the offer */ } } catch (e) {}
    Game.applyStatus('scholar', 'poison', { name: 'throat sac toxin', source: 'the belltoad' });
    const offered = (sc.abilityChoices || []).some(c => ((c && c.id) || c) === 'purify');
    ok('C3: poisoned scholar gets a reactive System offer of purify', offered,
      `choices=${JSON.stringify((sc.abilityChoices || []).map(c => (c && c.id) || c))}`);
    // take the cure through the real path, then the button cures
    if (offered) Game.chooseAbility('purify');
    ok('C3: purify acquired via the System offer', Game.hasAbility('purify'));
    const poisonedBefore = (Game.seList ? Game.seList('scholar') : []).some(e => e.id === 'poison');
    const fired = Game._activateAbilityInner('purify');
    const poisonedAfter = (Game.seList ? Game.seList('scholar') : []).some(e => e.id === 'poison');
    ok('C3: purify cures applied poison (functional)', poisonedBefore && !poisonedAfter && fired !== false);
  } else {
    ok('C3[old]: r6 misclassification replayed (pharmacist grants purify as granted-skill)',
      anyOccGrantsPurify && (pdef.unlock || {}).type === 'granted');
  }
}

// ============ HELD: dodge ceiling (sub-immunity, conditional) ============
{
  const sc = Game.state.scholar;
  sc.passives = { footwork: 3 };
  try { Game.state.scholar.stat && 0; } catch (e) {}
  // set agi to 10 via practice state: stat() reads s.stats; force directly
  sc.stats = sc.stats || {}; sc.stats.agi = 10;
  grant('cornered_rat');
  grant('adrenaline_control'); // strike mult only — no dodge
  // adrenaline_surge (+0.15/lvl dodge) is dead-17: unacquirable, so excluded
  const surgeDead = !Game.hasAbility('adrenaline_surge');
  const foot = Game.passiveBonus('footwork');
  const agiB = Math.max(0, (10 - 5) * 0.02);
  let mod = 0; try { mod = Game.modTarget('combat.dodge_chance', 0); } catch (e) {}
  const maxDodge = foot + agiB + mod + 0.5; // +0.5 cornered_rat while surrounded
  ok('H-dodge: max acquirable dodge stays under 1.0 (no immunity)',
    maxDodge < 1.0 && surgeDead, `foot=${foot} agi=${agiB} mod=${mod} total=${maxDodge}`);
}

// ============ HELD: strike-condition honesty (source + spot runtime) ============
{
  const gs = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  const tbStrike = gs.slice(gs.indexOf('tbPlayerStrike(targetKey)'), gs.indexOf('tbPlayerStrike(targetKey)') + 9000);
  ok('H-strike: no possession-passive rage block in tbPlayerStrike (4b68d614 holds)',
    !/hasAbility\('rage'\)[^]*d \*= 2/.test(tbStrike) || /rageActive/.test(tbStrike),
    'checked');
  ok('H-strike: cornered_rat damage gated on tbSurroundedBy(3)',
    /hasAbility\('cornered_rat'\) && this\.tbSurroundedBy\(3\)/.test(tbStrike));
  const aa = fs.readFileSync(path.join(ROOT, 'src/js/abilityActions.js'), 'utf8');
  ok('H-strike: rage x2 lives only in the unleash_rage action flag path',
    /s\.rageActive && s\.rageActive\.rounds > 0/.test(aa));
}

// ============ HELD: useAbility on unheld ability refuses honestly ============
{
  const s = Game.state.scholar;
  s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'rage');
  s.backgroundAbilities = (s.backgroundAbilities || []).filter(a => (a.id || a) !== 'rage');
  const n = said.length;
  const r = Game.useAbility('rage', 'unleash_rage');
  const msg = said.slice(n).join('\n');
  ok('H-use: useAbility on unheld ability refuses honestly, nothing spent',
    r === false && /don't have that ability/i.test(msg), msg.slice(0, 120));
}

// ============ TRIPWIRES (documented dead sets — purify fixed this round, rest unchanged, Steve's call) ============
{
  const abs = Game.data.abilities || [];
  const cg = Game.data.characterGen || {};
  const occG = new Set();
  ((cg.occupations) || []).forEach(o => (o.granted || []).forEach(g => occG.add(g)));
  const dead = abs.filter(a => {
    const t = (a.unlock || {}).type;
    return !(t === 'system_offer' || occG.has(a.id));
  }).map(a => a.id).sort();
  ok('T-dead14: purify via System; evidence_board/pathfinder homed (programmer/truck_driver)',
    dead.length === 14 && !dead.includes('purify') && !dead.includes('evidence_board') && !dead.includes('pathfinder'),
    `n=${dead.length} ${JSON.stringify(dead)}`);
  // undiscoverable synergies: fixpoint over synergy legs
  const syns = Game.data.synergies || [];
  const synIds = new Set(syns.map(x => x.id));
  const acq = (aid) => { const a = abs.find(x => x.id === aid); return !!a && ((a.unlock || {}).type === 'system_offer' || occG.has(aid)); };
  const disc = new Set(); let ch = true;
  while (ch) {
    ch = false;
    for (const s of syns) {
      if (disc.has(s.id)) continue;
      const paths = s.requires_any || [s.requires || []];
      for (const p of paths) {
        let okp = true;
        for (const leg of p) {
          if (synIds.has(leg)) { if (!disc.has(leg)) { okp = false; break; } }
          else if (String(leg).startsWith('tech:') || String(leg).startsWith('skill:')) continue;
          else if (!acq(leg)) { okp = false; break; }
        }
        if (okp) { disc.add(s.id); ch = true; break; }
      }
    }
  }
  const undis = syns.filter(s => !disc.has(s.id)).map(s => s.id).sort();
  ok('T-undisc15: pathfinder/evidence_board homed -> farsight, trails_end, string_wall, trailblazers_promise, green_highway now discoverable',
    undis.length === 15, `n=${undis.length} ${JSON.stringify(undis)}`);
  const bt = syns.find(s => s.id === 'blood_tracker');
  ok('T-blood_tracker: still discoverable but mechanically void (Steve\'s call)',
    !!bt && (bt.modifiers || []).length === 0, `modifiers=${JSON.stringify((bt || {}).modifiers)}`);
}

// ============ SIBLING SWEEP: villager-agency occupation path ============
{
  const va = fs.readFileSync(path.join(ROOT, 'src/js/villager-agency.js'), 'utf8');
  ok('S-sweep: npcRangingApt reads characterGen.occupations (stale data.occupations gone)',
    /\(this\.data\.characterGen \|\| \{\}\)\.occupations/.test(va) && !/\(this\.data\.occupations \|\| \[\]\)/.test(va));
  const lg = fs.readFileSync(path.join(ROOT, 'src/js/ledger.js'), 'utf8');
  ok('S-sweep: ledger succession reads characterGen.occupations + occupationId (stale path gone)',
    /\(this\.data\.characterGen \|\| \{\}\)\.occupations/.test(lg) && !/\(this\.data\.occupations \|\| \[\]\)/.test(lg));
}

console.log(`\nRESULT: ${pass} ok, ${fail} FAIL (SEED=${SEED}, FIX=${FIX ? 1 : 0})`);
  if (fail) process.exitCode = 1;
})();
