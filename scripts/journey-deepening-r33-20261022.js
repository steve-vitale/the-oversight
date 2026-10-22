// journey-deepening-r33-20261022.js -- DEEPENING leg R33:
// THE MEAT TRAIL. The deepening window's 6 quirk-carrying monsters
// (hushwolf, bulldozer, belltoad, speedbump_turtle, mirror_stag,
// ducks_in_a_row — docs/DISEASES.md alien pool; cooking.json monsterDiseases)
// feed the villagerMonsterWeirdness / maybeMonsterWeirdness channels (Steve
// 2026-10-08/16: villagers HAUL unrevealed monster meat home and may TRY it
// like other unrevealed foods). r32 found the channel WIRED but DORMANT:
// 0 villagerMonsterWeirdness events across 6 seeds, 0 butcher/meat mentions
// in captures. The blank is upstream in kill->carcass->loot->clean->haul->
// pantry->meal. This run traces the full supply chain.
//
// Code read (2026-10-22, BEFORE instrumenting): kills leave carcasses via
// monsterCarcassEntries (game.js:42549) onto the corpse (loot-as-action: the
// carcass rots on the body, spoilDay+3); the scholar loots with corpseTakeItem
// / corpseLootAll (competent policy loots in-range corpses) and cleans with
// cleanCarcass (food.js:764); villagers butcher-on-the-spot via
// mapmemButcherForCarry (villager-mapmem.js:407, returns {kcal, unknown})
// and haul remembered carcasses via mapmemHaulAt (villager-mapmem.js:470);
// meat reaches meals via trackMealExposure exposure.monster (game.js:28220),
// which fires villagerMonsterWeirdness (game.js:30187) and the scholar's
// maybeMonsterWeirdness (game.js:26067).
//
// Leg question: in the deepening window (d40-80), does monster meat from the
// 6 quirk-carriers reach village meals, do quirks fire — and if not, which
// supply-chain stage breaks?
//
// PRE-REGISTER (2026-10-22, MEASUREMENT.md 9-12, 14 - BINDING): see
// evidence/2026-10-22/journey-deepening-r33.md. Binding: R1 meat-trail census
// (4 fresh seeds 9961-9964, competent, DAYCAP=100, death-aware stop); R2
// narration sense (report-only); M1 >=3/4 alive at end; M2 >=6 full villager
// transcripts sense-read, 0 senseless. Interesting-finding bar: >=1
// exposure.monster event (meat reaches a meal) with the chain traced, OR a
// named clean break (kills>0 carcasses>0 but unlooted | looted but never
// cleaned | cleaned but never served | served but quirks never fire).
// Anything else is a miss. Quirks firing in the wild = the alien channel
// reads (R2 narration required for the first one).
//
// Race guards: MEASUREMENT only — zero src/js changes, zero data changes,
// no policy tweaks. Harness-only wraps.
//
// Usage: SEEDS=9961,9962,9963,9964 node scripts/journey-deepening-r33-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9961, 9962, 9963, 9964]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census, r21Misread } = require('./lib/death-census');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22');
const QUIRK_MIDS = ['hushwolf', 'bulldozer', 'belltoad', 'speedbump_turtle', 'mirror_stag', 'ducks_in_a_row'];
const QUIRK_IDS = ['howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind'];
const MEAT_LINE_RX = /carcass|meat_|Unknown flesh|strange meat|haul it home|butcher|Howlbelly|Gristlefit|Croakbelly|Shellgut|Witness Maw|Flockmind|howls at night|shoulders haven't|gut ribbits|CLANK|tears run black|quacks when startled|second canine voice|gristle braids|vocal sac|chitin plates/i;

// ---- per-seed globals ----
let capture = [];
let meatLines = [];
let _G = null;
let _currentSeed = null;
let quirkKills = [];     // registerDeath kind=monster, mid in QUIRK_MIDS
let carcassEntries = []; // monsterCarcassEntries calls with quirk mids (meat created)
let butcherCarry = [];   // mapmemButcherForCarry calls (villager butcher-on-spot)
let haulAt = [];         // mapmemHaulAt calls
let scholarLoot = [];    // corpseTakeItem / corpseLootAll with meat_* taken
let cleans = [];         // cleanCarcass calls on meat_* carcasses
let mealMeat = [];       // trackMealExposure with meat_* item (meat reaches a meal)
let quirkRolls = [];     // villager + scholar quirk rolls (fired or missed)
let quirkApplies = [];   // applyStatus hits for quirk ids (ground truth)
let deathReg = [];
let transcriptFiles = [];
let wrapErrs = [];

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  if (MEAT_LINE_RX.test(s) && !(meatLines.length && meatLines[meatLines.length - 1] === s)) {
    meatLines.push(`[d${gday()}] ${s}`);
  }
}
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function scaleNow() { try { return _G.scaleRank ? _G.scaleRank() : null; } catch (e) { return null; } }
function popAlive() { try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; } }
function midOf(plantId) { return String(plantId || '').replace(/^meat_/, ''); }
function isMeat(item) { return item && item.plantId && String(item.plantId).indexOf('meat_') === 0; }

function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let quirks = [];
    try {
      const sts = (p.statuses || p.conditions || []);
      const list = Array.isArray(sts) ? sts.map(s => (s && s.id) || String(s)) : Object.keys(sts);
      quirks = list.filter(s => QUIRK_IDS.indexOf(String(s)) >= 0);
    } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      plantsKnown: plants, quirkStatuses: quirks,
    };
  });
}

// ---- conversation driver (engage-first, 8 turns; from r30/r32, verbatim behavior) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
function pickChoice(choices, turn) {
  const list = choices || [];
  if (turn === 0) {
    const acc = list.find(x => x && x.id === 'betrayal:accept');
    if (acc) return acc;
    const dec = list.find(x => x && x.id === 'betrayal:decline');
    if (dec && list.every(x => !x || !ENGAGE.includes(x.id))) return dec;
  }
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid, tag) {
  const fp = path.join(EVIDIR, `journey-deepening-r33-transcript-competent-${_currentSeed}-day${day}${tag || ''}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(c => c && c.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
  } catch (e) { log('CONVO ERROR: ' + (e && e.stack || e)); }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  transcriptFiles.push(fp);
  return fp;
}

function makePolicy() {
  const policy = Object.create(competent);
  policy.id = 'journey-deepening-r33-competent';
  return policy;
}
function wrap(name, fn) {
  try {
    const _f = fn;
    return function () {
      let r;
      try { r = _f.apply(this, arguments); } catch (e) { r = 'ERR'; wrapErrs.push(name + ': ' + (e && e.message)); }
      return r;
    };
  } catch (e) { wrapErrs.push('setup ' + name + ': ' + (e && e.message)); return null; }
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = []; meatLines = [];
  quirkKills = []; carcassEntries = []; butcherCarry = []; haulAt = [];
  scholarLoot = []; cleans = []; mealMeat = []; quirkRolls = []; quirkApplies = [];
  deathReg = []; transcriptFiles = []; wrapErrs = [];
  console.log(`\n########## SEED ${seed} (meat-trail census) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r33', fullTelemetry: true });
  _G = Game;

  // --- text capture + meat-filtered buffer (filter at write time) ---
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // --- registerDeath wrap: quirk-mid kills (kind=monster) ---
  try {
    if (typeof Game.registerDeath === 'function') {
      const _rd = Game.registerDeath.bind(Game);
      Game.registerDeath = function (opts) {
        try {
          const o = opts || {};
          deathReg.push({
            day: gday(), kind: o.kind || '?', cause: o.cause || '?',
            killerId: (o.killerId == null ? null : String(o.killerId)),
            vid: o.villagerId != null ? String(o.villagerId) : null,
            monsterId: o.monsterId != null ? String(o.monsterId) : null,
            who: o.villagerId || o.monsterId || o.name || '?',
            name: o.name || null, player: !!o.player,
          });
          if ((o.kind === 'monster') && QUIRK_MIDS.indexOf(String(o.monsterId)) >= 0) {
            quirkKills.push({
              day: gday(), mid: String(o.monsterId), cause: o.cause || '?',
              killerId: (o.killerId == null ? null : String(o.killerId)),
              player: !!o.player, witnesses: (o.witnesses || []).length,
            });
            console.log(`*** QUIRK-KILL d${gday()}: ${o.monsterId} (cause=${o.cause}, killer=${o.killerId || (o.player ? 'scholar' : '?')})`);
          }
        } catch (e0) {}
        return _rd.apply(this, arguments);
      };
    } else wrapErrs.push('registerDeath missing');
  } catch (e) { wrapErrs.push('registerDeath setup: ' + (e && e.message)); }

  // --- monsterCarcassEntries wrap: carcass meat created ---
  try {
    if (typeof Game.monsterCarcassEntries === 'function') {
      const _mce = Game.monsterCarcassEntries.bind(Game);
      Game.monsterCarcassEntries = function (mdef) {
        let r = null;
        try { r = _mce.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          const mid = (mdef && mdef.id) || '?';
          if (QUIRK_MIDS.indexOf(String(mid)) >= 0 && Array.isArray(r)) {
            carcassEntries.push({
              day: gday(), mid: String(mid),
              entries: r.map(x => ({ plantId: x.plantId, hiddenKcal: x.hiddenKcal, units: x.units, foodState: x.foodState })),
            });
            console.log(`*** CARCASS d${gday()}: ${mid} -> ${r.map(x => x.plantId + ':' + x.hiddenKcal + 'kcal').join(', ')}`);
          }
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('monsterCarcassEntries missing');
  } catch (e) { wrapErrs.push('monsterCarcassEntries setup: ' + (e && e.message)); }

  // --- mapmemButcherForCarry wrap: villager butcher-on-the-spot ---
  try {
    if (typeof Game.mapmemButcherForCarry === 'function') {
      const _bfc = Game.mapmemButcherForCarry.bind(Game);
      Game.mapmemButcherForCarry = function (vid, corpse) {
        let r = null;
        try { r = _bfc.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          if (r && r !== 'ERR') {
            butcherCarry.push({
              day: gday(), vid: vid || null, vname: vname(vid),
              kcal: r.kcal || 0, label: r.label || null,
              unknown: ((r.unknown || [])).map(u => ({ plantId: u.plantId, hiddenKcal: u.hiddenKcal, units: u.units })),
              corpseKind: (corpse && corpse.kind) || '?',
            });
            console.log(`*** BUTCHER-CARRY d${gday()}: ${vname(vid)} kcal=${r.kcal || 0} unknown=[${((r.unknown || []).map(u => u.plantId)).join(',')}]`);
          }
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('mapmemButcherForCarry missing');
  } catch (e) { wrapErrs.push('mapmemButcherForCarry setup: ' + (e && e.message)); }

  // --- mapmemHaulAt wrap: villager haul-objective arrivals ---
  try {
    if (typeof Game.mapmemHaulAt === 'function') {
      const _mha = Game.mapmemHaulAt.bind(Game);
      Game.mapmemHaulAt = function (vid) {
        let r = false;
        try { r = _mha.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          if (r === true) {
            haulAt.push({ day: gday(), vid: vid || null, vname: vname(vid) });
            console.log(`*** HAUL-AT d${gday()}: ${vname(vid)}`);
          }
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('mapmemHaulAt missing');
  } catch (e) { wrapErrs.push('mapmemHaulAt setup: ' + (e && e.message)); }

  // --- corpse loot wraps: scholar taking meat_* off bodies ---
  function lootWrap(name) {
    try {
      if (typeof Game[name] !== 'function') { wrapErrs.push(name + ' missing'); return; }
      const _f = Game[name].bind(Game);
      Game[name] = function (cid, idx) {
        let before = [];
        try {
          const list = _G.corpses ? _G.corpses() : ((_G.state || {}).corpses || []);
          const c = list.find(x => x && x.id === cid);
          before = ((c && c.items) || []).filter(isMeat).map(i => ({ plantId: i.plantId, name: i.name }));
        } catch (e0) {}
        let r = null;
        try { r = _f.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          if (before.length) {
            scholarLoot.push({ day: gday(), fn: name, cid: String(cid).slice(0, 24), meat: before, result: String(r && r.taken ? r.taken.length : r).slice(0, 40) });
            console.log(`*** SCHOLAR-LOOT d${gday()}: ${name} took [${before.map(b => b.plantId).join(',')}]`);
          }
        } catch (e0) {}
        return r;
      };
    } catch (e) { wrapErrs.push(name + ' setup: ' + (e && e.message)); }
  }
  lootWrap('corpseTakeItem');
  lootWrap('corpseLootAll');

  // --- cleanCarcass wrap: scholar cleaning meat_* ---
  try {
    if (typeof Game.cleanCarcass === 'function') {
      const _cc = Game.cleanCarcass.bind(Game);
      Game.cleanCarcass = function (idx, container) {
        let targets = [];
        try {
          const inv = container || ((_G.state || {}).scholar || {}).inventory || [];
          targets = inv.filter(i => i && i.foodState === 'carcass' && isMeat(i))
            .map(i => ({ plantId: i.plantId, name: i.name, hiddenKcal: i.hiddenKcal }));
        } catch (e0) {}
        let r = null;
        try { r = _cc.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          if (targets.length) {
            cleans.push({ day: gday(), meat: targets, result: r === 'ERR' ? 'ERR' : (r != null ? 'ok' : 'null') });
            console.log(`*** CLEAN d${gday()}: [${targets.map(t => t.plantId).join(',')}] -> ${r === 'ERR' ? 'ERR' : (r != null ? 'ok' : 'null')}`);
          }
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('cleanCarcass missing');
  } catch (e) { wrapErrs.push('cleanCarcass setup: ' + (e && e.message)); }

  // --- trackMealExposure wrap: meat reaching a meal ---
  try {
    if (typeof Game.trackMealExposure === 'function') {
      const _tme = Game.trackMealExposure.bind(Game);
      Game.trackMealExposure = function (exposure, item, cookedByVillage) {
        let r = null;
        try { r = _tme.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          if (isMeat(item)) {
            mealMeat.push({
              day: gday(), mid: midOf(item.plantId), name: String(item.name || '').slice(0, 60),
              foodState: item.foodState || '?', cookedByVillage: !!cookedByVillage,
              exposureMonsterLen: (exposure && exposure.monster ? exposure.monster.length : 0),
            });
            console.log(`*** MEAL-MEAT d${gday()}: ${item.plantId} state=${item.foodState} villageCooked=${!!cookedByVillage}`);
          }
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('trackMealExposure missing');
  } catch (e) { wrapErrs.push('trackMealExposure setup: ' + (e && e.message)); }

  // --- quirk roll wraps: villager + scholar ---
  try {
    if (typeof Game.villagerMonsterWeirdness === 'function') {
      const _vmw = Game.villagerMonsterWeirdness.bind(Game);
      Game.villagerMonsterWeirdness = function (vid, item, chanceOverride) {
        let r = false;
        try { r = _vmw.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          quirkRolls.push({
            day: gday(), who: 'villager', vid: vid || null, vname: vname(vid),
            mid: midOf((item || {}).plantId), foodState: (item || {}).foodState || '?',
            fired: r === true,
          });
          if (r === true) console.log(`*** QUIRK-FIRED d${gday()}: villager ${vname(vid)} <- ${midOf((item || {}).plantId)}`);
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('villagerMonsterWeirdness missing');
  } catch (e) { wrapErrs.push('villagerMonsterWeirdness setup: ' + (e && e.message)); }
  try {
    if (typeof Game.maybeMonsterWeirdness === 'function') {
      const _mmw = Game.maybeMonsterWeirdness.bind(Game);
      Game.maybeMonsterWeirdness = function (it) {
        let r = false;
        try { r = _mmw.apply(this, arguments); } catch (e) { r = 'ERR'; }
        try {
          quirkRolls.push({ day: gday(), who: 'scholar', mid: midOf((it || {}).plantId), foodState: (it || {}).foodState || '?', fired: r === true });
          if (r === true) console.log(`*** QUIRK-FIRED d${gday()}: scholar <- ${midOf((it || {}).plantId)}`);
        } catch (e0) {}
        return r;
      };
    } else wrapErrs.push('maybeMonsterWeirdness missing');
  } catch (e) { wrapErrs.push('maybeMonsterWeirdness setup: ' + (e && e.message)); }

  // --- applyStatus wrap: quirk applications (ground truth) ---
  try {
    if (typeof Game.applyStatus === 'function') {
      const _as = Game.applyStatus.bind(Game);
      Game.applyStatus = function (target, id, opts) {
        try {
          if (QUIRK_IDS.indexOf(String(id)) >= 0) {
            quirkApplies.push({
              day: gday(),
              target: (target === 'scholar' || target === 'p') ? 'scholar' : vname(target),
              id: String(id), source: String((opts && opts.source) || '').slice(0, 120),
            });
            console.log(`*** QUIRK-APPLY d${gday()}: ${(target === 'scholar' || target === 'p') ? 'scholar' : vname(target)} <- ${id}`);
          }
        } catch (e0) {}
        return _as.apply(this, arguments);
      };
    } else wrapErrs.push('applyStatus missing');
  } catch (e) { wrapErrs.push('applyStatus setup: ' + (e && e.message)); }

  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r33', date: new Date().toISOString().slice(0, 10), node: process.version } });

  // --- people check: 3 living-villager conversations at end-state (r32 lesson: per-vid filenames) ---
  try {
    const living = ((_G.state.village.roster || []).filter(id => !person(id).dead)).slice(0, 3);
    for (const vid of living) runConversation(result.gameDays, vid, `-end-${String(vid).slice(0, 12)}`);
  } catch (e) { console.log('convo sampling ERROR: ' + (e && e.message)); }

  // --- end census: any quirk holders? (array-aware statuses; r32 instrument bug fixed) ---
  const endCensus = buildCensus();
  const quirkHolders = endCensus.filter(c => (c.quirkStatuses || []).length > 0);
  let scholarQuirks = [];
  try {
    const s = _G.state.scholar || {};
    const sts = s.statuses || {};
    const list = Array.isArray(sts) ? sts.map(x => (x && x.id) || String(x)) : Object.keys(sts);
    scholarQuirks = list.filter(k => QUIRK_IDS.indexOf(String(k)) >= 0);
  } catch (e) {}

  // --- death census (r27 kind-aware) ---
  const rosterIds = (((Game.state || {}).village || {}).roster || []);
  const dcFull = census(deathReg, { playerId: 'p', roster: rosterIds });
  const dcWindow = census(deathReg.filter(d => (d.day || 0) >= 40), { playerId: 'p', roster: rosterIds });

  const chainSummary = {
    quirkKills: quirkKills.length,
    quirkKillsByMid: quirkKills.reduce((o, e) => { o[e.mid] = (o[e.mid] || 0) + 1; return o; }, {}),
    carcassesCreated: carcassEntries.length,
    carcassKcal: carcassEntries.reduce((n, e) => n + e.entries.reduce((a, x) => a + (x.hiddenKcal || 0), 0), 0),
    butcherCarryEvents: butcherCarry.length,
    butcherCarryKcal: butcherCarry.reduce((n, e) => n + (e.kcal || 0), 0),
    butcherCarryUnknownItems: butcherCarry.reduce((n, e) => n + (e.unknown || []).length, 0),
    haulAtEvents: haulAt.length,
    scholarLootMeatEvents: scholarLoot.length,
    scholarCleans: cleans.length,
    mealMeatEvents: mealMeat.length,
    mealMeatByMid: mealMeat.reduce((o, e) => { o[e.mid] = (o[e.mid] || 0) + 1; return o; }, {}),
    quirkRolls: quirkRolls.length,
    quirkRollsFired: quirkRolls.filter(q => q.fired).length,
    quirkRollsVillager: quirkRolls.filter(q => q.who === 'villager').length,
    quirkRollsScholar: quirkRolls.filter(q => q.who === 'scholar').length,
    quirkApplies: quirkApplies.length,
    quirkAppliesById: quirkApplies.reduce((o, e) => { o[e.id] = (o[e.id] || 0) + 1; return o; }, {}),
    villagerQuirkHoldersAtEnd: quirkHolders.map(c => ({ id: c.id, name: c.name, statuses: c.quirkStatuses })),
    scholarQuirksAtEnd: scholarQuirks,
  };
  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason,
    finalWave: waveNow(), finalScale: scaleNow(),
    quirkKills, carcassEntries, butcherCarry, haulAt, scholarLoot, cleans, mealMeat, quirkRolls, quirkApplies,
    chainSummary,
    wrapErrs,
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, r21misreadFull: r21Misread(deathReg), records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r33-competent-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  try { fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r33-meatlines-competent-${seed}.txt`), meatLines.join('\n')); }
  catch (e) { console.log('meatlines dump ERROR: ' + (e && e.message)); }
  try {
    let txt = capture.join('\n');
    if (txt.length > 1024 * 1024) txt = '[HEAD TRUNCATED — see meatlines file for meat narration]\n' + txt.slice(-1024 * 1024);
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r33-capture-competent-${seed}.txt`), txt);
  } catch (e) { console.log('capture dump ERROR: ' + (e && e.message)); }
  const cs = chainSummary;
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `kills=${cs.quirkKills} carc=${cs.carcassesCreated} butch=${cs.butcherCarryEvents}(unk=${cs.butcherCarryUnknownItems}) haul=${cs.haulAtEvents} ` +
    `sloot=${cs.scholarLootMeatEvents} clean=${cs.scholarCleans} meal=${cs.mealMeatEvents} rolls=${cs.quirkRolls}(fired${cs.quirkRollsFired}) applies=${cs.quirkApplies} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let tK = 0, tC = 0, tB = 0, tH = 0, tL = 0, tCl = 0, tM = 0, tR = 0, tA = 0, alive = 0;
  for (const s of summary) {
    const cs = s.chainSummary || {};
    tK += cs.quirkKills || 0; tC += cs.carcassesCreated || 0; tB += cs.butcherCarryEvents || 0;
    tH += cs.haulAtEvents || 0; tL += cs.scholarLootMeatEvents || 0; tCl += cs.scholarCleans || 0;
    tM += cs.mealMeatEvents || 0; tR += cs.quirkRolls || 0; tA += cs.quirkApplies || 0;
    if (!s.fatal && s.endReason === 'survived') alive++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `kills=${cs.quirkKills || 0} carc=${cs.carcassesCreated || 0} butch=${cs.butcherCarryEvents || 0} haul=${cs.haulAtEvents || 0} ` +
      `sloot=${cs.scholarLootMeatEvents || 0} clean=${cs.scholarCleans || 0} meal=${cs.mealMeatEvents || 0} rolls=${cs.quirkRolls || 0} applies=${cs.quirkApplies || 0}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: kills=${tK} carcasses=${tC} butcherCarry=${tB} haulAt=${tH} scholarLoot=${tL} cleans=${tCl} mealMeat=${tM} rolls=${tR} applies=${tA} alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
