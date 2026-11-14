// reunion-ally-probe-20261114.js — DIAGNOSTIC (not a panel driver).
// Plays one Reunion wave at a given H/D and prints, per round: every
// fighter's position + HP, the Reunion's chosen move, and the narration
// lines. Answers: what do the allies DO while the scholar dies?
// Usage: SEED=86009 H=0.5 D=0.6 node scripts/reunion-ally-probe-20261114.js
'use strict';
const path = require('path');
const K = require(path.join(__dirname, '..', 'scripts', 'godpath', 'lib'));
const STAGE = require(path.join(__dirname, '..', 'scripts', 'stageally-instrument-20261106'));
const CAP = require(path.join(__dirname, '..', 'scripts', 'arena-capture-20261107'));
const SEED = parseInt(process.env.SEED || '86009', 10) || 86009;
const H = parseFloat(process.env.H || '0.5');
const D = parseFloat(process.env.D || '0.6');
const LOADOUT = {
  scholar: { melee: 'machete', torso: 'wardens_cloak' },
  allies: { ranged: 'hunting_spear', torso: 'bark_armor' },
};
function monsterOf(f) {
  try { return (f.fighters || []).find(function (x) { return x && x.kind === 'monster'; }) || null; } catch (e) { return null; }
}
function liveMonsterKey(Game) {
  try {
    const ms = (Game.tbfight.fighters || []).filter(function (x) { return x && x.kind === 'monster' && x.alive !== false && !x.fled; });
    return ms.length ? (ms[0].key || 'm_0') : null;
  } catch (e) { return null; }
}
function partyNOf(Game) {
  try {
    return (Game.tbfight.fighters || []).filter(function (x) {
      return x && (x.kind === 'player' || x.kind === 'villager') && x.alive !== false && !x.fled;
    }).length;
  } catch (e) { return -1; }
}
function logLines(Game) {
  try {
    return (Game.log || []).map(function (e) {
      if (e == null) return null;
      if (typeof e === 'string') return e;
      return String(e.text != null ? e.text : (e.msg != null ? e.msg : e));
    });
  } catch (e) { return []; }
}
(async function () {
  const Game = await K.load({ seed: SEED, narration: true });
  const rd = (Game.data.monsters || []).find(function (m) { return m.id === 'reunion'; });
  rd.hp = [Math.round(rd.hp[0] * H), Math.round(rd.hp[1] * H)];
  function scaleDmg(a) { if (a && a.damage) a.damage = [Math.round(a.damage[0] * D), Math.round(a.damage[1] * D)]; }
  scaleDmg(rd.attack);
  (rd.attacks || []).forEach(scaleDmg);
  Game.unlockedWave = function () { return 4; };
  const inst = STAGE.install(Game);
  const cap = CAP.install(Game);
  K.newRun(Game);
  try { Game.state.scholar.day = 30; } catch (e) {}
  try {
    const s = Game.state.scholar;
    s.mx = 4; s.my = 4;
    if (Game.ensureVillagerPositions) Game.ensureVillagerPositions();
    const roster = ((Game.state.village || {}).roster || []).slice();
    const vpos = (Game.state.village || {}).positions || {};
    const spots = [{ mx: 3, my: 4 }, { mx: 5, my: 4 }];
    const chosen = roster.filter(function (rid) { return rid !== Game.villagerId; }).slice(0, 2);
    chosen.forEach(function (rid, i) { vpos[rid] = spots[i]; });
    Game.state.village.roster = chosen;
  } catch (e) {}
  function equipScholar(itemId, slot) {
    const s = Game.state.scholar;
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: itemId, units: 1 });
    Game.equip(s.inventory.length - 1, slot);
  }
  function equipAlly(vid, itemId, slot) {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    if (!vp) return;
    const def = (Game.data.items || []).find(function (i) { return i.id === itemId; });
    vp.equipped = vp.equipped || {};
    vp.equipped[slot] = { itemId: itemId, name: (def && def.name) || itemId };
    if (Array.isArray(vp.items)) vp.items.push({ itemId: itemId, units: 1 });
  }
  equipScholar(LOADOUT.scholar.melee, 'melee');
  equipScholar(LOADOUT.scholar.torso, 'torso');
  (Game.state.village.roster || []).forEach(function (rid) {
    equipAlly(rid, LOADOUT.allies.ranged, 'ranged');
    equipAlly(rid, LOADOUT.allies.torso, 'torso');
  });
  try { Game.state.activeContest = { contestId: 'gauntlet' }; } catch (e) {}
  try { Game.state.arenaContest = { contestId: 'gauntlet', waves: ['reunion'], waveIdx: 0 }; } catch (e) {}
  K.fight(Game, 'reunion', { px: 5, py: 4, mx: 6, my: 4, party: true });
  console.log('partyN=' + partyNOf(Game) + ' reunionCount=' +
    (Game.tbfight.fighters || []).filter(function (x) { return x.kind === 'monster'; }).length);
  const deathsBefore = cap.t.deaths.length;
  let lastLog = 0;
  let guard = 0;
  while (guard++ < 600) {
    if (cap.t.deaths.length > deathsBefore) { console.log('DIED'); break; }
    const f = Game.tbfight;
    if (!f || f.over) { console.log('ENDED result=' + (f && f.result)); break; }
    const rnd = f.round;
    const snap = (f.fighters || []).map(function (x) {
      return (x.key || '?') + ':' + x.kind + ' [' + x.mx + ',' + x.my + '] hp=' + Math.round(x.hp || 0) +
        '/' + Math.round(x.maxHp || 0) + (x.alive === false ? ' DEAD' : '') + (x.fled ? ' FLED' : '');
    }).join(' | ');
    console.log('--- round ' + rnd + ' ---\n' + snap);
    const lines = logLines(Game);
    const fresh = lines.slice(lastLog);
    lastLog = lines.length;
    fresh.forEach(function (l) { if (l) console.log('  LOG: ' + String(l).slice(0, 200)); });
    if (Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      const key = liveMonsterKey(Game);
      if (key) { try { Game.tbPlayerStrike(key); } catch (e) { console.log('strike err ' + e.message); } }
      else { try { Game.tbPlayerWait(); } catch (e) {} }
      if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
        try { Game.tbAdvance(); } catch (e) {}
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { console.log('STUCK'); break; }
    }
  }
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {}
  try { cap.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
