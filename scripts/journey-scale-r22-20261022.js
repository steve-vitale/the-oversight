// scripts/journey-scale-r22-20261022.js — journey leg SCALE (days 80–140) R22:
// THE ARMOR ROAD. The r-line proved belong/trade (r12–r18), covenant (r20)
// and lead (r21) aloud in the scale window; the readiness gate's ARMORED bar
// (4 fighters at worn P>=15 for wave 5) is the sole blocker on 100% of
// instrumented never-opened window-days (sim-windowloss DIAG, 2026-10-22,
// "armor the village" named next, finding #646). This pilot plays the armor
// road as a competent player: craft the best craftable armor (hide_armor
// P20), wear the best owned, and census whether the village's ARMORED bar
// is reachable by player agency in the scale window.
//
// PRE-REGISTER (2026-10-22, MEASUREMENT.md sections 9-12, 14):
//   Leg question: in the scale window, does a competent player who actively
//   pursues armor reach the wave-5 ARMORED bar (4 living fighters at worn
//   P>=15)? If not, name the structural blocker with evidence.
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     A1 reach — >=2/4 seeds reach 4 fighters at worn P>=15 by day 140
//       (GO). Else NO-GO with the named structural blocker (a NO-GO here is
//       a finding, not a failure — the bar may be structurally unreachable
//       by player agency).
//     A2 channels — every P>=15 armor piece worn at day 140 attributed to
//       its acquisition channel (craft/find/loot/bequest/start).
//     A3 honesty — wave-5 readiness hold beats (if any) name the short bars
//       truthfully (sense-read, not just a flag flip).
//     A4 people — >=4 full transcripts sense-read in the scale window
//       (days 80-140), 0 senseless flags.
//     A5 survival — villages alive+coherent at decision day (150 loop-days)
//       or honest death (death-aware stop, +10d tail max).
//   Interesting-finding bar: where villager armor actually comes from; whether
//   the transfer gap (no communal armor pile per storage.js ontology — Steve
//   2026-10-09; no NPC crafting; no player->villager give verbs) is the
//   binding constraint; whether the bar is reachable.
//   Horizon: DAYCAP=150 loop-days, death-aware stop.
//   PILOT FIRST: 4 seeds 40001-40004 (fresh, disjoint from r1-r21).
//   Policy: competent + armorRoad layer (hide_armor craft beat; weekly
//   armor census). The base competent policy already wears best armor owned
//   and crafts bark_armor (P10) when known.
// Usage: SEEDS=40001,40002 node scripts/journey-scale-r22-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [40001, 40002, 40003, 40004]);
const DAYCAP = parseInt(process.env.DAYCAP || '150', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22', 'journey-scale-r22-armor');
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

let _G = null, _currentSeed = null, capture = [];
let armorLedger = [];   // weekly {day, seed, fighters:[{vid,name,wornId,wornP,alive}], ready:{...}}
let armorEvents = [];   // armor acquisition lines pulled from capture

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
const SEQ = () => { const g = (typeof globalThis !== 'undefined' ? globalThis : {}); return (g.Scattering && g.Scattering.equipment) || null; };
const ITEMS = () => ((_G && _G.data && _G.data.items) || []);
function defOf(it) {
  const id = (it && (it.itemId || it.id)) || it;
  return (id && ITEMS().find(d => d && d.id === id)) || null;
}
function protOfId(id) {
  const d = ITEMS().find(x => x && x.id === id);
  return (d && d.armor) ? (d.armor.protection || 0) : 0;
}
// per-fighter worn armor P (scholar via armorBonus, villagers via armorOf)
function fighterArmor() {
  const out = [];
  const eq = SEQ();
  const roster = (((_G.state || {}).village || {}).roster) || [];
  const sid = _G.villagerId;
  for (const vid of roster) {
    try {
      const p = person(vid);
      const alive = !!(p && !p.dead);
      let wornP = 0;
      const worn = [];
      if (vid === sid) {
        wornP = (_G.armorBonus ? (_G.armorBonus() | 0) : 0);
        const eqd = (((_G.state || {}).scholar || {}).equipped) || {};
        for (const sl of Object.keys(eqd)) {
          const e = eqd[sl];
          const d = e && defOf(e);
          if (d && d.armor && (d.armor.protection || 0) > 0) {
            worn.push({ id: d.id, p: d.armor.protection || 0, slot: sl });
          }
        }
      } else {
        let vp = null;
        try { vp = _G.vpOf ? _G.vpOf(vid) : null; } catch (e) {}
        if (vp && !vp.dead && eq && eq.armorOf) {
          wornP = eq.armorOf(vp, ITEMS()) || 0;
          const eqd = vp.equipped || {};
          for (const sl of Object.keys(eqd)) {
            const e = eqd[sl];
            const d = e && defOf(e);
            if (d && d.armor && (d.armor.protection || 0) > 0) {
              worn.push({ id: d.id, p: d.armor.protection || 0, slot: sl });
            }
          }
        }
      }
      out.push({ vid, name: vname(vid), wornP, worn, alive });
    } catch (e) {}
  }
  return out;
}
function readiness5() {
  try {
    const r = _G.waveCombatReadiness ? _G.waveCombatReadiness(5) : null;
    if (!r) return null;
    return { ready: !!r.ready, armored: r.armored | 0, armed: r.armed | 0, tricks: r.tricks | 0, veterans: r.veterans | 0, short: (r.short || []).slice(), demand: r.demand ? { armorP: r.demand.armorP | 0 } : null };
  } catch (e) { return null; }
}

// ---------- the armorRoad layer ----------
// Craft hide_armor (P20) for the scholar when the recipe is known, materials
// are on hand, and nothing better is owned/worn. Mirrors competent's bark
// block (which only crafts bark P10). gearUp (base upkeep) equips the best.
function hideArmorBeat(Game, ctx) {
  try {
    if (Game.over || Game.tbfight || (Game.inCombat && Game.inCombat())) return;
    const s = (Game.state && Game.state.scholar) || {};
    const inv = s.inventory || [];
    const eqd = s.equipped || {};
    let wornMax = 0, ownedMax = 0;
    for (const sl of ['torso', 'armor', 'head', 'body']) {
      const d = eqd[sl] && defOf(eqd[sl]);
      if (d && d.armor) wornMax = Math.max(wornMax, d.armor.protection || 0);
    }
    for (const it of inv) {
      const d = defOf(it);
      if (d && d.armor) ownedMax = Math.max(ownedMax, d.armor.protection || 0);
    }
    if (Math.max(wornMax, ownedMax) >= 20) return; // nothing to gain
    const rk = (((Game.state || {}).codex || {}).recipes || {}).hide_armor || {};
    if ((rk.level || 0) < 1) return; // knowledge-gated
    const have = (m) => inv.filter(it => it && it.material === m).reduce((t, it) => t + (it.units || 0), 0);
    if (have('hide') < 2 || have('vine') < 1) return;
    try {
      const vinebank = require('./policies/vinebank');
      if (vinebank && typeof vinebank.defersCraft === 'function' && vinebank.defersCraft(Game, 'hide_armor')) {
        ctx.vinebankDeferHide = (ctx.vinebankDeferHide || 0) + 1;
        return;
      }
    } catch (e) {}
    if (typeof Game.craft === 'function') {
      const made = Game.craft('hide_armor');
      if (made) ctx.hideArmorCrafted = (ctx.hideArmorCrafted || 0) + 1;
      else ctx.hideArmorCraftFailed = (ctx.hideArmorCraftFailed || 0) + 1;
    }
  } catch (e) { ctx.hideArmorBeatError = (ctx.hideArmorBeatError || 0) + 1; }
}

const CONVO_DAYS = [80, 100, 120, 140];
const convoFiles = [];
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious',
  'nv:nod', 'nv:smile', 'nv:pointself', 'nv:listen'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id === 'ans:0' ) || list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-scale-r22-transcript-${_currentSeed}-day${day}.txt`);
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
    log(`occupation=${p.formerOccupation || p.occupation || '?'} trust=${(((_G.state.village || {}).trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}

function census() {
  const day = gday();
  const capText = capture.join('\n');
  const rank = (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })();
  const r5 = readiness5();
  const fighters = fighterArmor();
  const armored15 = fighters.filter(f => f.alive && f.wornP >= 15).length;
  return {
    seed: _currentSeed,
    day, over: !!_G.over, overCause: _G.overCause || null,
    popAlive: fighters.filter(f => f.alive).length,
    popTotal: fighters.length,
    pantryKcal: Math.round(pantryKcal()),
    scaleRank: rank,
    nationalDay: (() => { try { return _G.state.nationalDay || null; } catch (e) { return null; } })(),
    maxWave: (() => { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } })(),
    tableSeat: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).seat || null; } catch (e) { return 'err'; } })(),
    r5, armored15,
    scholarWornP: (fighters.find(f => f.vid === _G.villagerId) || {}).wornP || 0,
    convoFiles: convoFiles.slice(),
  };
}

async function playSeed(seed) {
  _currentSeed = seed;
  capture = []; armorLedger = []; armorEvents = []; convoFiles.length = 0;
  console.log(`\n===== SEED ${seed} (armor road) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r22' });
  _G = Game;
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const baseDaily = competent.daily.bind(competent);
  const baseSetup = competent.setup.bind(competent);
  const baseUpkeep = competent.upkeep ? competent.upkeep.bind(competent) : null;
  const policy = Object.create(competent);
  policy.id = 'journey-scale-r22-armorroad';
  policy._ctx = null;
  policy.setup = function (G, ctx) { baseSetup(G, ctx); policy._ctx = ctx; };
  policy.upkeep = function (G, ctx) { if (baseUpkeep) baseUpkeep(G, ctx); };
  policy.daily = function (G, ctx) {
    baseDaily(G, ctx);       // competent play FIRST and fully
    hideArmorBeat(G, ctx);   // then the armor-road craft beat (additive)
    const gd = gday();
    if (gd % 7 === 0 && gd > 0 && ctx._armorCensusDay !== gd) {
      ctx._armorCensusDay = gd;
      const fighters = fighterArmor();
      const r5 = readiness5();
      armorLedger.push({
        day: gd, seed,
        armored15: fighters.filter(f => f.alive && f.wornP >= 15).length,
        r5: r5 ? { armored: r5.armored, armed: r5.armed, tricks: r5.tricks, veterans: r5.veterans, ready: r5.ready, short: r5.short } : null,
        fighters: fighters.map(f => ({ n: f.name, p: f.wornP, worn: f.worn, alive: f.alive })),
      });
    }
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = G.npcComm ? G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      if (vid) { try { convoFiles.push(runConversation(gd, vid)); } catch (e) {} }
    }
  };
  const result = await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed, mode: 'journey-scale-r22-armor', date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  const ctx = policy._ctx || {};
  const c = census();
  c.hideArmorCrafted = ctx.hideArmorCrafted | 0;
  c.hideArmorCraftFailed = ctx.hideArmorCraftFailed | 0;
  c.barkArmorCrafted = ctx.barkArmorCrafted | 0;
  c.geared = ctx.geared | 0;
  c.vinebankDeferHide = ctx.vinebankDeferHide | 0;
  const deaths = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (e && e.type === 'death') deaths.push({ day: e.day, who: e.who, cause: e.cause, player: !!e.player });
    }
  } catch (e2) {}
  c.deathLog = deaths;
  const out = { census: c, armorLedger, notes: (ctx.notes || []).slice(-20) };
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r22-armor-${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r22-capture-${seed}.txt`), capture.join('\n'));
  // armor-relevant beat lines: readiness holds, armor crafts/finds/loot, wave unlocks
  const beatLines = capture.filter(s => /armor the village|armored|hide_armor|bark_armor|riot_gear|military_vest|swat_vest|leather_jacket|alien_helm|alien_carapace|alien_greaves|alien_gauntlets|alien_boots|worldroot|bloodplate|second_skin|conquerors_plate|stormcloak|witness_coat|wardens_cloak|shelter_cloak|skull_helm|lifebound|adaptive_dermis|the Producers|greenlit|Mirror Draft/i.test(s)).slice(0, 200);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r22-armorbeats-${seed}.txt`), beatLines.join('\n'));
  console.log(`seed ${seed}: day=${c.day} over=${c.over}(${c.overCause||''}) pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} rank=${c.scaleRank} wave=${c.maxWave} armored15=${c.armored15} r5=${c.r5 ? JSON.stringify({a:c.r5.armored,ready:c.r5.ready,short:c.r5.short}) : 'n/a'} scholarP=${c.scholarWornP} hide=${c.hideArmorCrafted} bark=${c.barkArmorCrafted} seat=${c.tableSeat}`);
  return c;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try {
      results.push(await playSeed(seed));
    } catch (e) {
      console.log(`SEED ${seed} CRASH: ${e && e.stack || e}`);
      results.push({ seed, crash: String(e && e.message || e) });
    }
  }
  console.log('\n===== R22 ARMOR PILOT SUMMARY =====');
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed}: day=${r.day} over=${r.over} pop=${r.popAlive}/${r.popTotal} rank=${r.scaleRank} wave=${r.maxWave} armored15=${r.armored15} scholarP=${r.scholarWornP} hide=${r.hideArmorCrafted} bark=${r.barkArmorCrafted} seat=${r.tableSeat}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
