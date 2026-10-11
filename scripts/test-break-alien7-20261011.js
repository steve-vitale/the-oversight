// Proof test: break-it alienPlayers 2026-10-11 (run 7).
// Hostile-player attacks against src/js/alienPlayers.js:
//  T1 EXPLOIT  favor farm clamps at +/-100 + daily drift
//  T2 EXPLOIT  armor salvage: kill-only, no duplicates, no grant off fled
//  T3 SOFTLOCK stasis field: live while Rax fields it; clears on fled/dead/over
//  T4 SOFTLOCK all-dead pool: rolls refuse, playground quiet, no phantom starts
//  T5 HONESTY  pre-reveal name scan: no persona name surfaces unless revealed
//  T6 HONESTY  beam resist: 5 pieces -> 0.7^5; 0 pieces -> ~maxHp
//  T7 DEAD-CODE every defined method has >=1 production call site
const H = require('./break-alien-harness.js');
const { Game, RNG } = H;
let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', label); }
}
const SEED = parseInt(process.env.SEED || '777', 10);
function fresh(day) { RNG.reset(SEED); const s = H.fresh(day);
  // wave-2 eligibility: the alien pool gates on unlockedWave() >= 2
  try { Game.ledgerState()[1].points = 5; } catch (e) {}
  Game.state.systemIntegration = 2;
  return s; }

const PIDS = ['vex_marlowe', 'countess_sable', 'rax_dentist', 'pip_quindle', 'sarge', 'dr_fenwick', 'old_tam'];
const NAMES = {};

async function main() {
await H.boot();
PIDS.forEach(pid => { const p = Game.apPersona(pid); if (p) NAMES[pid] = p.name; });

// ---------- T1: favor farm clamps ----------
{
  fresh(30);
  for (let i = 0; i < 60; i++) Game.apAdjustFavor(6, 'farm', 'fight');
  ok(Game.apFanLane('fight') === 100, 'T1 favor clamps at +100 (got ' + Game.apFanLane('fight') + ')');
  for (let i = 0; i < 60; i++) Game.apAdjustFavor(-6, 'farm', 'fight');
  ok(Game.apFanLane('fight') === -100, 'T1 favor clamps at -100');
  fresh(30);
  Game.apAdjustFavor(50, 'x', 'fight');
  Game.state.systemArrived = true;
  for (let d = 0; d < 10; d++) { Game.state.scholar.day++; try { Game.apDailyTick(); } catch (e) {} }
  ok(Game.apFanLane('fight') <= 40, 'T1 drift pulls favor down over days (got ' + Game.apFanLane('fight') + ')');
}

// ---------- T2: armor salvage ----------
{
  fresh(30);
  const inv = () => (Game.state.scholar.inventory || []).length;
  const n0 = inv();
  // fled (not killed): no salvage, no favor armor path
  Game.apOnCombatEnd('vex_marlowe', 'won', { killed: false });
  ok(inv() === n0, 'T2 no salvage off a fled (non-kill) win');
  // killed: exactly one piece granted
  Game.apOnCombatEnd('vex_marlowe', 'won', { killed: true });
  ok(inv() === n0 + 1, 'T2 kill grants exactly one armor piece');
  const firstId = (Game.state.scholar.inventory[n0] || {}).itemId;
  ok(/^alien_/.test(firstId || ''), 'T2 granted piece is alien armor (' + firstId + ')');
  ok(Game.apIsDead('vex_marlowe'), 'T2 kill marks persona dead');
  // own every piece: no duplicate grant
  const pool = ['alien_helm', 'alien_carapace', 'alien_greaves', 'alien_gauntlets', 'alien_boots'];
  pool.forEach(id => { try { Game.apGrantItem(id); } catch (e) {} });
  const n1 = inv();
  H.clearLog();
  Game.apOnCombatEnd('sarge', 'won', { killed: true });
  ok(inv() === n1, 'T2 no duplicate armor when full set owned');
  ok(/standard gear/.test(H.sayText()), 'T2 "standard gear" line when nothing new to strip');
  // dead persona cannot re-encounter: 500 forced rolls
  RNG.reset(SEED+1);
  let seen = 0;
  for (let i = 0; i < 500; i++) {
    const pid = Game.apRollEncounter();
    if (pid === 'vex_marlowe') seen++;
  }
  ok(seen === 0, 'T2 dead persona never re-rolled (' + seen + '/500)');
  ok(Game.apStartEncounter('vex_marlowe') === false, 'T2 apStartEncounter refuses a corpse');
}

// ---------- T3: stasis field ----------
{
  fresh(30);
  const f = Game.apBuildFighter('rax_dentist', 4, 4);
  f.alienTech = [{ id: 'stasis_field', name: 'Stasis Field', desc: 'x' }];
  Game.tbfight = { over: false, fighters: [f] };
  ok(Game.apStasisFieldLive() === 'rax_dentist', 'T3 stasis live while Rax fields it');
  f.fled = true;
  ok(Game.apStasisFieldLive() === false, 'T3 stasis clears when Rax flees');
  f.fled = false; f.alive = false;
  ok(Game.apStasisFieldLive() === false, 'T3 stasis clears when Rax dies');
  f.alive = true; Game.tbfight.over = true;
  ok(Game.apStasisFieldLive() === false, 'T3 stasis clears when fight over');
  Game.tbfight = null;
  // no stasis tech: no block
  const f2 = Game.apBuildFighter('sarge', 4, 4);
  Game.tbfight = { over: false, fighters: [f2] };
  ok(Game.apStasisFieldLive() === false, 'T3 no stasis without the tech');
  Game.tbfight = null;
}

// ---------- T4: all-dead pool ----------
{
  fresh(45);
  const ap = Game.apState();
  PIDS.forEach(pid => { ap.met[pid] = { encounters: 3, dead: true, deadDay: 40 }; });
  RNG.reset(SEED+2);
  let anyRoll = null;
  for (let i = 0; i < 300; i++) { const r = Game.apRollEncounter(); if (r) anyRoll = r; }
  ok(anyRoll === null, 'T4 apRollEncounter returns null with all personas dead');
  ok(Game.apMaybeActivate() === null, 'T4 apMaybeActivate refuses with all dead');
  ok(Game.apRollGroupEncounter() === null, 'T4 apRollGroupEncounter refuses with all dead');
  H.clearLog();
  try { Game.apPlaygroundTick(); ok(true, 'T4 playground tick does not throw'); }
  catch (e) { ok(false, 'T4 playground tick threw: ' + e.message); }
  // non-combat benevolent Wren dead too: dead drop refuses
  ap.met.wren = { encounters: 0, dead: true };
  ok(Game.apDeadDrop() === false, 'T4 dead Wren leaves no dead drops');
}

// ---------- T5: pre-reveal name scan ----------
{
  fresh(30);
  Game.state.systemArrived = true;
  let leaked = [];
  PIDS.forEach(pid => {
    H.clearLog();
    const f = Game.apBuildFighter(pid, 4, 4);
    if (f.name !== 'Stranger') leaked.push(pid + ':fighter=' + f.name);
    Game.apCombatIntro(pid);
    Game.apPilotTaunt(pid);
    for (let i = 0; i < 10; i++) {
      Game.apCombatChatter(pid, 'banter', f, 0.5);
      Game.apCombatChatter(pid, 'winning', f, 0.2);
      Game.apSayCombat(pid, 'onHit', 1.0);
    }
    Game.apCodexEntry(pid);
    const txt = H.allText();
    const nm = NAMES[pid];
    if (nm && txt.includes(nm) && !Game.apKnowsAlien(pid)) leaked.push(pid + ':name-in-text-unrevealed');
    const entry = Game.state.codex.aliens[pid];
    if (entry && entry.name !== 'someone') leaked.push(pid + ':codex=' + entry.name);
  });
  ok(leaked.length === 0, 'T5 no pre-reveal leaks (' + leaked.join('; ') + ')');
  // feed naming IS the reveal path: if a name appears, the pid must be known
  fresh(30);
  Game.state.systemArrived = true;
  const ap = Game.apState();
  ap.met.vex_marlowe = { encounters: 2 }; // sadistic, met -> feed gossip eligible
  H.clearLog();
  for (let i = 0; i < 60; i++) { Game.state.scholar.day++; try { Game.apFeedMessage(); } catch (e) {} }
  const txt = H.allText();
  const vname = NAMES.vex_marlowe;
  if (txt.includes(vname)) {
    ok(Game.apKnowsAlien('vex_marlowe'), 'T5 feed-named persona is revealed (naming IS the reveal)');
  } else {
    ok(true, 'T5 feed never named the rival this seed (no leak either way)');
  }
}

// ---------- T6: beam resist honesty ----------
{
  fresh(30);
  const s = Game.state.scholar;
  s.maxHp = 100;
  ok(Game.apBeamResistPieces().length === 0, 'T6 no pieces naked');
  RNG.reset(SEED+3);
  const d0 = Game.apBeamHit('player', 0, 'test beam', { damageType: 'alien_beam' });
  ok(d0 >= 85 && d0 <= 115, 'T6 naked beam ~maxHp (got ' + d0 + ')');
  // equip the full alien set
  const slotOf = { alien_helm: 'head', alien_carapace: 'torso', alien_greaves: 'legs', alien_gauntlets: 'hands', alien_boots: 'shoes' };
  s.equipped = {};
  Object.keys(slotOf).forEach(id => { s.equipped[slotOf[id]] = { itemId: id }; });
  const pieces = Game.apBeamResistPieces();
  ok(pieces.length === 5, 'T6 full alien set counts 5 resist pieces (got ' + pieces.length + ')');
  RNG.reset(SEED+3);
  const d5 = Game.apBeamHit('player', 0, 'test beam', { damageType: 'alien_beam' });
  const expect5 = Math.round(d0 * Math.pow(0.7, 5));
  ok(Math.abs(d5 - expect5) <= 2, 'T6 full set multiplies by 0.7^5 (got ' + d5 + ', expect ~' + expect5 + ')');
  ok(d5 >= 1, 'T6 beam always lands >=1');
  // one piece
  s.equipped = { head: { itemId: 'alien_helm' } };
  ok(Game.apBeamResistPieces().length === 1, 'T6 single piece counts');
}

// ---------- T7: dead-code re-verification (production only) ----------
{
  const fs = require('fs'), path = require('path');
  const jsDir = path.join(__dirname, '..', 'src', 'js');
  const src = fs.readFileSync(path.join(jsDir, 'alienPlayers.js'), 'utf8');
  const defs = [...src.matchAll(/^    ([A-Za-z]+): function/gm)].map(m => m[1]);
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && f !== 'alienPlayers.js');
  let dead = [];
  const apSrc = src;
  defs.forEach(n => {
    // production call sites: `.name(` anywhere in other src files, or internal `.name(`
    let hits = 0;
    files.forEach(f => {
      const t = fs.readFileSync(path.join(jsDir, f), 'utf8');
      if (new RegExp('\\.' + n + '\\s*\\(').test(t)) hits++;
    });
    if (new RegExp('\\.' + n + '\\s*\\(').test(apSrc)) hits++; // internal
    if (hits === 0) dead.push(n);
  });
  ok(dead.length === 0, 'T7 all ' + defs.length + ' defined methods have >=1 production call site (dead: ' + dead.join(',') + ')');
  ok(/alienPlayers\.js/.test(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')), 'T7 alienPlayers.js loaded in index.html');
}

console.log('\nPASS ' + pass + ' / FAIL ' + fail);
process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
