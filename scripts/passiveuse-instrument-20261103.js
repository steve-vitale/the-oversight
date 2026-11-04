// passiveuse-instrument-20261103.js — ability-use game-code arm, passive audit.
// DIAG-ONLY, scripts only, zero src/js. Records, per turn-based wave-4
// fight: the scholar's held passives (data modifiers + ability level +
// RESOLVED combat values through the modifier pipeline) and each NPC
// ally's held passives (data values only — the pipeline collects from the
// scholar alone, so NPC modifiers do not resolve; recorded as such).
// Fight-end outcome + HP deltas + tbDamage requested-vs-landed sums let
// the analyzer price each passive against the gear-step yardstick.
// Purity: every fight-start read is a pure read (modTarget, abilityLevel,
// ownedAbilityIds, npcOwnedIds). armorBonus() is DELIBERATELY NOT called:
// it runs migrateEquipment, which can mutate scholar.equipped. armor.flat
// is read as modTarget('armor.flat', 0) instead.
// Composes with abilityuse-instrument-20261103.js: install the prior
// instrument FIRST, this one second; uninstall this one FIRST, then the
// prior one (reverse order restores each wrap correctly).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}

function scholarPassives(Game) {
  const out = { held: [], resolved: {}, readError: null };
  try {
    const defs = Game.data.abilities || [];
    const byId = {};
    for (const a of defs) if (a && a.id) byId[a.id] = a;
    let ids = [];
    if (typeof Game.ownedAbilityIds === 'function') ids = Game.ownedAbilityIds() || [];
    for (const id of ids) {
      const def = byId[id];
      if (!def) { out.held.push({ id: id, level: null, modifiers: null }); continue; }
      let lvl = null;
      try { lvl = (typeof Game.abilityLevel === 'function') ? Game.abilityLevel(id) : null; } catch (e) {}
      out.held.push({ id: id, level: lvl, modifiers: (def.modifiers || []).map(function (m) {
        return { target: m.target, op: m.op, value: m.value, scale: m.scale || null, condition: m.condition || null };
      }) });
    }
    const mt = function (target, base, ctx) {
      try { return (typeof Game.modTarget === 'function') ? Game.modTarget(target, base, ctx || {}) : null; }
      catch (e) { return 'ERROR:' + String((e && e.message) || e).slice(0, 60); }
    };
    out.resolved = {
      strike_damage: mt('combat.strike_damage', 1, {}),
      strike_damage_r1: mt('combat.strike_damage', 1, { round: 1 }),
      first_strike_damage: mt('combat.first_strike_damage', 1, { round: 1 }),
      heavy_damage: mt('combat.heavy_damage', 1, {}),
      dodge_chance: mt('combat.dodge_chance', 0, {}),
      armor_flat: mt('armor.flat', 0, {}),
      max_add: mt('health.max_add', 0, {}),
      trade_window: mt('combat.trade_window', 0, {}),
      enemy_morale: mt('combat.enemy_morale', 1, {}),
    };
  } catch (e) { out.readError = String((e && e.message) || e).slice(0, 100); }
  return out;
}

function npcPassives(Game, vid) {
  const out = { held: [], readError: null };
  try {
    const defs = Game.data.abilities || [];
    const byId = {};
    for (const a of defs) if (a && a.id) byId[a.id] = a;
    let ids = [];
    if (typeof Game.npcOwnedIds === 'function') ids = Game.npcOwnedIds(vid) || [];
    else if (Game.state && Game.state.village && Game.state.village.npcAbilities) ids = (Game.state.village.npcAbilities[vid] || []);
    for (const id of ids) {
      const def = byId[id];
      if (!def) { out.held.push({ id: id, modifiers: null }); continue; }
      out.held.push({ id: id, modifiers: (def.modifiers || []).map(function (m) {
        return { target: m.target, op: m.op, value: m.value, scale: m.scale || null, condition: m.condition || null };
      }) });
    }
  } catch (e) { out.readError = String((e && e.message) || e).slice(0, 100); }
  return out;
}

function install(Game) {
  const t = { fights: [], instrumentErrors: [], wrapCounts: {} };
  const orig = {};
  let seq = 0;
  let open = null; // {seq, fight, row}
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  function fighterKind(key) {
    try {
      const f = (typeof Game.tbFighter === 'function') ? Game.tbFighter(key) : null;
      return f ? (f.kind || null) : null;
    } catch (e) { return null; }
  }

  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function (mid) {
      count('startCombat');
      let effId = null;
      try {
        let worldId = null, pendingId = null;
        try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
        try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
        effId = mid || pendingId || worldId || null;
      } catch (e) { err('start.pre', e); }
      const isW4 = !!(effId && waveOf(Game, effId) === 4);
      const beforeFight = Game.tbfight || null;
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (isW4) {
          const fight = Game.tbfight || null;
          if (fight && fight !== beforeFight) {
            if (open && !open.ended) { const prev = t.fights.find(function (x) { return x.seq === open.seq; }); if (prev) prev.superseded = true; }
            seq++;
            const humans = [], monsters = [];
            for (const f of (fight.fighters || [])) {
              if (!f) continue;
              if (f.kind === 'monster') {
                const mid2 = ((f.mdef || {}).id || f.monsterId || f.id) || null;
                monsters.push({ key: f.key || null, mid: mid2, hp: f.hp != null ? f.hp : null, maxHp: f.maxHp != null ? f.maxHp : null });
              } else if (f.key === 'p' || f.kind === 'villager' || f.kind === 'ally') {
                const vid = f.villagerId || (f.key === 'p' ? (Game.villagerId || null) : null);
                const isScholar = (f.key === 'p');
                humans.push({ key: f.key || null, kind: f.kind || null, vid: vid,
                  hp: f.hp != null ? f.hp : null, maxHp: f.maxHp != null ? f.maxHp : null,
                  scholarPassives: isScholar ? scholarPassives(Game) : null,
                  npcPassives: isScholar ? null : npcPassives(Game, vid) });
              }
            }
            const row = { seq: seq, day: dayOf(Game), mid: effId, fightId: fight.id || null,
              scholar: scholarPassives(Game), humans: humans, monsters: monsters,
              dmgRows: [], end: null, endHumans: null, endMonsters: null, superseded: false };
            t.fights.push(row);
            open = { seq: seq, fight: fight, ended: false };
          }
        }
      } catch (e) { err('start.post', e); }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  if (typeof Game.tbDamage === 'function') {
    orig.tbDamage = Game.tbDamage;
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      count('tbDamage');
      let r;
      try { r = orig.tbDamage.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (open && !open.ended && Game.tbfight === open.fight) {
          const row = t.fights.find(function (x) { return x.seq === open.seq; });
          if (row) row.dmgRows.push({ targetKey: targetKey || null, targetKind: fighterKind(targetKey),
            requested: dmg, landed: (typeof r === 'number' ? r : null),
            sourceKey: sourceKey || null, sourceKind: fighterKind(sourceKey),
            sourceLabel: sourceLabel || null });
        }
      } catch (e) { err('tbDamage.post', e); }
      return r;
    };
  } else { err('install.tbDamage', new Error('not a function')); }

  if (typeof Game.tbEnd === 'function') {
    orig.tbEnd = Game.tbEnd;
    Game.tbEnd = function (result) {
      count('tbEnd');
      let preHumans = null, preMonsters = null;
      try {
        const f = Game.tbfight || null;
        if (f && !f.over) {
          preHumans = (f.fighters || []).filter(function (x) { return x && x.kind !== 'monster'; })
            .map(function (x) { return { key: x.key || null, hp: x.hp != null ? x.hp : null, alive: !!x.alive, fled: !!x.fled }; });
          preMonsters = (f.fighters || []).filter(function (x) { return x && x.kind === 'monster'; })
            .map(function (x) { return { key: x.key || null, hp: x.hp != null ? x.hp : null, alive: !!x.alive, fled: !!x.fled }; });
        }
      } catch (e) { err('tbEnd.pre', e); }
      let r;
      try { r = orig.tbEnd.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (open && !open.ended) {
          const row = t.fights.find(function (x) { return x.seq === open.seq; });
          if (row) { row.end = (result != null ? String(result) : null); row.endHumans = preHumans; row.endMonsters = preMonsters; }
          open.ended = true; open = null;
        }
      } catch (e) { err('tbEnd.post', e); }
      return r;
    };
  } else { err('install.tbEnd', new Error('not a function')); }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
  }
  return { t: t, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, scholarPassives: scholarPassives, npcPassives: npcPassives };
