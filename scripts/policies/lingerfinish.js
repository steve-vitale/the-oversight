// lingerfinish — wound-selective lingerer finishing (scale-onramp,
// sim-lingerfinish-a, 2026-10-28, tracker blank 1).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: LINGERFINISH unset or not
// '1' → daily delegates to tableseat-nowait byte-identically (the
// det-gate in scripts/test-lingerfinish-sweep.js pins that).
//
// WHAT THIS IS: tableseat-nowait wrapped with ONE answering layer that
// acts on wounded lingerers through the game's own verbs, in order:
//
//   STEP 1 — SORTIE (villager field channel): when the whole treeline is
//     a village-plausible fight (weakest lingerer <= 80 HP, treeline
//     total <= 300 HP), the village musters via answerLingerer('sortie')
//     — real fighters, real rations (2000 kcal each), real blow-by-blow
//     fieldFights. At most once per 6 game days (one muster per siege
//     cohort; lingerers drift off within ~6 nights).
//   STEP 2 — MARCH (scholar TB channel): the scholar marches out
//     (travelTo + triggerEncounter, gorgedrive's verified pattern) to
//     the MOST-WOUNDED remaining lingerer by HP fraction — the prey the
//     village cannot finish but the scholar, whose TB fights now start
//     at world HP (sim-w4tbkill-a phase B, in base), might — restricted
//     to lingerers that are first-on-their-tile, because startCombat
//     fights monsterAt(scholar tile) and marching to a stacked-behind
//     lingerer would fight the wrong entity (see STEP 2 in code).
//
// WHY THE GATES: lingererSortie takes NO target — it fights ALL
// lingering raiders in world order. A policy can control WHEN a sortie
// fires, never WHOM it fights first, so the sortie gate is a
// whole-treeline gate (min + sum), not a single-target gate. The march,
// by contrast, picks one entity, so it is wound-selective per monster
// (lowest fraction first, haven-tile tie-break, lowest absolute HP).
// Field damage (fieldFights.js: villager strike roll([4+wb, 8+wb]) per
// round) sets the sortie numbers: 80 HP is ~2 rounds of party damage
// for the weakest lingerer; 300 HP total is a treeline a 3-fighter
// party can work through without the leader certainly breaking first.
// A 600-975 HP wave-4 lingerer at 0.75 fraction is NOT village prey —
// it is scholar prey, via TB at world HP.
//
// JUDGMENT GATES (documented design calls, Steve can overrule):
//   - TABLE SANCTITY (Steve 2026-10-12, canon): while the table sits,
//     raiders hold the treeline but do not gorge — never engage mid-finale.
//   - PANTRY: the sortie pays whatever _removePantryKcal returns and
//     proceeds regardless, so the policy is the ONLY affordability check:
//     pantry >= 12000 (2x max sortie cost 6000) or HOLD. If the pantry
//     cannot be read at all, HOLD — never march on an unreadable pantry.
//   - SCHOLAR HP (gorgedrive's bars): wave-5 apex needs >= 50% max,
//     lower waves >= 35%.
//   - PARTY (gorgedrive's bar): never march alone when a villager party
//     is available — invite up to 2 honestly; hold if help exists but
//     nobody comes; engage alone only when nobody exists.
//   - Never clobber a live fight or a pending encounter; never answer
//     while asleep or inside the tent (the march's triggerEncounter
//     would route through the tent-breach path).
//   - A sortie that BROKE (vFlee/vDie) skips the march that day — do not
//     compound a broken party with a scholar march.
//   - One march answer per monster id per game day (gorgedrive's
//     id-keyed pattern, inherited with its disclosed limitation: two
//     same-type lingerers on one day share the key).
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

function layerOn() { return process.env.LINGERFINISH === '1'; }

function havenTile(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return {
      x: (v.px !== undefined && v.px !== null) ? v.px : 4,
      y: (v.py !== undefined && v.py !== null) ? v.py : 4,
    };
  } catch (e) { return { x: 4, y: 4 }; }
}

function lingeringMonsters(Game) {
  try {
    const ms = Game.worldMonsters ? Game.worldMonsters() : [];
    return ms.filter(m => m && m.lingering && (m.hp || 0) > 0);
  } catch (e) { return []; }
}

function maxHpOf(Game, m) {
  try {
    if (m && m.maxHp && isFinite(m.maxHp) && m.maxHp > 0) return m.maxHp;
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    if (def && def.hp && isFinite(def.hp[0]) && def.hp[0] > 0) return def.hp[0];
  } catch (e) {}
  return (m && m.hp) || 0;
}

function woundedLingerers(Game, list) {
  return (list || []).map(m => {
    const mx = maxHpOf(Game, m);
    return { m, hp: m.hp || 0, maxHp: mx, frac: mx > 0 ? (m.hp || 0) / mx : 1 };
  }).filter(x => x.maxHp > 0 && x.hp < x.maxHp);
}

// pickMarchTarget: lowest HP fraction first; haven-tile tie-break, then
// lowest absolute HP. Pure over precomputed entries (testable).
function pickMarchTarget(entries, haven) {
  if (!entries || !entries.length) return null;
  const atHaven = (x) => haven && x.m.tx === haven.x && x.m.ty === haven.y;
  const sorted = entries.slice().sort((a, b) => {
    if (a.frac !== b.frac) return a.frac - b.frac;
    const ha = atHaven(a) ? 0 : 1, hb = atHaven(b) ? 0 : 1;
    if (ha !== hb) return ha - hb;
    return a.hp - b.hp;
  });
  return sorted[0];
}

function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const max = (Game.maxHealth ? Game.maxHealth() : 100) || 100;
    return (s.health || 0) / max;
  } catch (e) { return 0; }
}

function healthyVillagersAtHome(Game) {
  try {
    const v = Game.state.village || {};
    const me = Game.villagerId;
    return (v.roster || []).filter(id =>
      id !== me &&
      !(v.away && v.away[id]) &&
      ((v.health || {})[id] === undefined || (v.health || {})[id] > 40));
  } catch (e) { return []; }
}

function companions(Game) {
  let n = 0;
  try { n += (Game.partyMembers ? Game.partyMembers() : []).length; } catch (e) {}
  try { n += (((Game.state || {}).village || {}).followers || []).length; } catch (e) {}
  return n;
}

function monsterWave(Game, m) {
  try {
    if (m && m.wave) return m.wave;
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}

// pantryKcal: pantryKcalLive first, cached pantryKcal second, summed
// pantry items third. null when unreadable (caller HOLDs on null).
function pantryKcal(Game) {
  try {
    const v = (Game.state || {}).village || {};
    if (typeof Game.pantryKcalLive === 'function') {
      const n = Game.pantryKcalLive(v);
      if (isFinite(n)) return n;
    }
  } catch (e) {}
  try {
    const v = (Game.state || {}).village || {};
    if (isFinite(v.pantryKcal)) return v.pantryKcal;
    if (Array.isArray(v.pantry)) {
      return v.pantry.reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 1)), 0);
    }
  } catch (e) {}
  return null;
}

// sortieGate: pure decision over a lingerer list + pantry + muster count
// + cooldown state. Returns {fire} or {fire:false, why}.
function sortieGate(list, pantry, healthyCount, lastSortieDay, today) {
  if (!list || !list.length) return { fire: false, why: 'none' };
  const hps = list.map(m => m.hp || 0);
  const min = Math.min.apply(null, hps);
  const sum = hps.reduce((t, h) => t + h, 0);
  if (min > 80) return { fire: false, why: 'minHp' };
  if (sum > 300) return { fire: false, why: 'sumHp' };
  if ((healthyCount | 0) < 2) return { fire: false, why: 'muster' };
  if (pantry === null || !(pantry >= 12000)) return { fire: false, why: 'pantry' };
  if (lastSortieDay !== null && lastSortieDay !== undefined && (today - lastSortieDay) < 6) {
    return { fire: false, why: 'cooldown' };
  }
  return { fire: true, min, sum };
}

function tableHeld(Game) {
  try { return !!(Game.tableActive && Game.tableActive()); } catch (e) { return false; }
}
function blocked(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return !!Game.over || (Game.tbfight && !Game.tbfight.over) || !!Game.pendingEncounter || !!Game._sleeping || !!s.insideTent;
  } catch (e) { return true; }
}

function lingerfinishStep(Game, ctx) {
  if (!layerOn()) return;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!s || Game.over) return;
    const today = s.day || 0;
    const earlyBlocked = blocked(Game);
    let lingerers = lingeringMonsters(Game);
    if (!lingerers.length) return;
    ctx.lfDaysSaw = (ctx.lfDaysSaw || 0) + 1;
    if (earlyBlocked) {
      ctx.lfHeldEarly = (ctx.lfHeldEarly || 0) + 1;
      return;
    }
    if (tableHeld(Game)) { ctx.lfHeldTable = (ctx.lfHeldTable || 0) + 1; return; }
    const wounded = woundedLingerers(Game, lingerers);
    if (wounded.length) ctx.lfDaysSawWounded = (ctx.lfDaysSawWounded || 0) + 1;

    // STEP 1 — SORTIE (whole-treeline gate; the sortie itself fights all).
    let sortieBroke = false;
    const gate = sortieGate(lingerers, pantryKcal(Game), healthyVillagersAtHome(Game).length,
      (ctx._lfLastSortieDay !== undefined ? ctx._lfLastSortieDay : null), today);
    if (gate.fire && typeof Game.answerLingerer === 'function') {
      let r = null;
      try { r = Game.answerLingerer('sortie'); } catch (e) { ctx.lfSortieErr = String((e && e.message) || e).slice(0, 80); }
      ctx._lfLastSortieDay = today;
      ctx.lfSortieCalls = (ctx.lfSortieCalls || 0) + 1;
      if (r && typeof r === 'object') {
        ctx.lfSortieCleared = (ctx.lfSortieCleared || 0) + (r.cleared | 0);
        if (r.broke) { ctx.lfSortieBroke = (ctx.lfSortieBroke || 0) + 1; sortieBroke = true; }
        if (r.paid) ctx.lfSortiePaid = (ctx.lfSortiePaid || 0) + (r.paid | 0);
      }
      try {
        const who = Game.displayName ? String(Game.displayName(Game.villagerId)).split(' ')[0] : 'The scholar';
        Game.say(`🥁 ${who} watches the muster go — the treeline is weak enough to finish, and the village goes to finish it.`);
      } catch (e) {}
    } else if (!gate.fire) {
      ctx['lfSortieHeld_' + gate.why] = (ctx['lfSortieHeld_' + gate.why] || 0) + 1;
    }
    if (sortieBroke) return; // do not compound a broken party with a march

    // STEP 2 — MARCH (most-wounded remaining lingerer, re-scanned).
    // ENGINE LIMIT (disclosed): startCombat fights playerMonster() =
    // monsterAt(scholar tile) = the FIRST world monster on that tile.
    // A most-wounded lingerer stacked behind another entity on the
    // haven tile cannot be the TB target — marching there would fight
    // the wrong entity. Candidates are therefore wounded lingerers
    // that ARE first-on-their-tile; the march picks the most-wounded
    // among those, never a stacked-behind one. (Gorgedrive's stricter
    // form — hold unless the single pick verifies — would stall on
    // every stacked treeline; this form keeps the same no-wrong-
    // entity guarantee while staying wound-selective among the
    // fightable set.)
    lingerers = lingeringMonsters(Game);
    if (!lingerers.length) return;
    if (blocked(Game)) { ctx.lfHeldEarly = (ctx.lfHeldEarly || 0) + 1; return; }
    if (tableHeld(Game)) { ctx.lfHeldTable = (ctx.lfHeldTable || 0) + 1; return; }
    const wounded2 = woundedLingerers(Game, lingerers);
    if (!wounded2.length) { ctx.lfMarchHeld_unwounded = (ctx.lfMarchHeld_unwounded || 0) + 1; return; }
    let fightable = wounded2;
    try {
      fightable = wounded2.filter(x => {
        const at = Game.monsterAt ? Game.monsterAt(x.m.tx, x.m.ty) : null;
        return at === x.m;
      });
    } catch (e) {}
    if (!fightable.length) { ctx.lfMarchHeld_notfirst = (ctx.lfMarchHeld_notfirst || 0) + 1; return; }
    const wounded2f = fightable;
    const haven = havenTile(Game);
    const pick = pickMarchTarget(wounded2f, haven);
    const m = pick.m;
    ctx._lfMarchAns = ctx._lfMarchAns || {};
    if (ctx._lfMarchAns[m.id + '|' + today]) { ctx.lfMarchHeld_answered = (ctx.lfMarchHeld_answered || 0) + 1; return; }
    const need = (monsterWave(Game, m) >= 5) ? 0.5 : 0.35;
    if (scholarHpPct(Game) < need) { ctx.lfMarchHeld_hp = (ctx.lfMarchHeld_hp || 0) + 1; return; }
    if (!companions(Game)) {
      const cands = healthyVillagersAtHome(Game).filter(id => {
        try { if (!Game.state.systemArrived) return false; } catch (e) { return false; }
        try { if (Game.partyFull && Game.partyFull()) return false; } catch (e) {}
        const trust = (((Game.state || {}).village || {}).trust || {})[id];
        return (trust === undefined ? 10 : trust) >= 20;
      });
      for (const vid of cands.slice(0, 2)) {
        try {
          const r = Game.inviteToParty ? Game.inviteToParty(vid) : null;
          if (r && r.ok) { ctx.lfMarchInvitesOk = (ctx.lfMarchInvitesOk || 0) + 1; break; }
          ctx.lfMarchInvitesRefused = (ctx.lfMarchInvitesRefused || 0) + 1;
        } catch (e) {}
      }
      if (!companions(Game) && cands.length) {
        ctx.lfMarchHeld_alone = (ctx.lfMarchHeld_alone || 0) + 1;
        return;
      }
    }
    if (Game.map && (Game.map.px !== m.tx || Game.map.py !== m.ty)) {
      try { Game.travelTo(m.tx, m.ty); } catch (e) {}
      if (Game.over || (Game.tbfight && !Game.tbfight.over) || Game.pendingEncounter) return;
    }
    let target = null;
    try {
      const at = Game.monsterAt ? Game.monsterAt(Game.map.px, Game.map.py) : null;
      if (at === m) target = m;
    } catch (e) {}
    if (!target) { ctx.lfMarchVerifyFailed = (ctx.lfMarchVerifyFailed || 0) + 1; return; }
    if (Game.triggerEncounter) Game.triggerEncounter(target.id);
    ctx._lfMarchAns[m.id + '|' + today] = true;
    ctx.lfMarchEngagements = (ctx.lfMarchEngagements || 0) + 1;
    try {
      const who = Game.displayName ? String(Game.displayName(Game.villagerId)).split(' ')[0] : 'The scholar';
      const mn = Game.monsterDisplayName ? Game.monsterDisplayName(m.id) : m.id;
      const partyN = companions(Game);
      Game.say(`🥁 ${who} marches out to finish the wounded ${mn} at the treeline${partyN ? ` — ${partyN} at their back` : ' — alone, no one else to ask'}.`);
    } catch (e) {}
  } catch (e) {}
}

function withLingerfinish(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      const r = base.daily(Game, ctx);
      try { lingerfinishStep(Game, ctx); } catch (e) {}
      return r;
    },
  });
}

const tableseatLingerfinish = withLingerfinish(
  tableseatNowait,
  'tableseat-nowait+lingerfinish',
  'tableseat-nowait + wound-selective lingerer finishing (LINGERFINISH=1): sortie for finishable treelines, scholar march for the most-wounded lingerer'
);

function policyForRun() { return tableseatLingerfinish; }

module.exports = {
  layerOn, withLingerfinish, tableseatLingerfinish, policyForRun,
  lingerfinishStep, lingeringMonsters, woundedLingerers, pickMarchTarget,
  sortieGate, havenTile, scholarHpPct, healthyVillagersAtHome, companions,
  monsterWave, pantryKcal, maxHpOf,
};
