// vetretention — "the village protects its blooded" (flesh-out loop,
// 2026-10-23, run fleshout-20261023T1215Z, arm sim-vetretention, axis
// scale-onramp).
//
// THE SURFACE (sim-vetkill-autopsy DIAG, evidence/2026-10-23/
// sim-vetkill-autopsy.md): the defer5 readiness bar demands 2 LIVING
// wave-4+ killers, and the killers EXIST then DIE — 8/10 killer vids
// died 1–8 days AFTER their kills (mean ~6d) in later attritional
// combat (5 aid-crisis raids, 2 haven fights), 0 in the wave-4 fight
// itself. This arm attacks POST-KILL ATTRITION, not formation
// (formation is sim-vetformation's lane; the two arms share zero files).
//
// THE RETENTION (policy-side, zero src/js): for a 14-day window after a
// wave-4+ kill, named blooded vids get three named protections:
//   (a) SHELTER when hurt (health <= 55): the village walks its wounded
//       veterans inside ahead of the night's draft — the shelter verb
//       (src/js/shelter.js) mechanically excludes them from the haven
//       raid draft (havenGrowth.js havenRaidTick reads isSheltered),
//       the wild router (game.js villagerMonsterTick), and duties.
//       Released when healed (>= 85) or the window lapses. The honest
//       cost is lost production while sheltered (documented in shelter.js).
//   (b) TRIAGE priority: blooded vids get the engine's own heal check
//       (game.js villagerHealCheck — pharmacy, then camp healer) run
//       for them proactively each day, ahead of the game's own
//       departure gates. Priority because they are asked first.
//   (c) ESCORT pairing: on raids, blooded vids are marked in
//       v.shielded — the raid draft's own back-of-the-line sort
//       (havenGrowth.js: "shielded villagers stand at the BACK of the
//       defender line... everyone else is spent first"; the state the
//       table's facilitate('shield') writes, table.js:1432). On
//       expeditions, a blooded vid never walks out alone: the layer
//       wraps startExpedition and sends a healthy companion on the
//       same expedition (same target, parallel legs — a real person
//       walking into real stakes, engine-honest state).
//
// SCOPE: scripts/policies/ ONLY, zero src/js. Composes OUTSIDE the
// armorydrive stack (AD.armedFor): the drive forms the veterans, this
// layer keeps them breathing. The vetbench finding is honored: the
// game-side muster (shelterMusterCheck) already shelters EVERYONE on
// wave-4+ threat-near-haven days, so this lever targets the post-kill
// window on ORDINARY days — named blooded vids, not the wave window.
// The layer never releases villagers the muster owns (v.shelterMustered
// active defers releases), and never double-counts muster shelterings.
//
// THE CHAIR (sim-mantlechain DIAG, evidence/2026-10-22/sim-mantlechain.md):
// 8/8 in-scope veteran wave-4 deaths were AS THE MANTLE-HOLDER; the
// chair is the accelerant, not the fight. This layer protects blooded
// FIGHTERS — it never funnels anyone into the scholar's chair: the
// scholar is never sheltered/shielded/healed-by-this-layer (the verb
// skips the player's villager anyway), and the moment a blooded vid
// becomes the scholar, all retention stands down (shelter released,
// shield cleared, tracking dropped). The layer never touches trust,
// so it cannot feed the succession rule that hands the mantle to the
// trusted.
//
// Env gate VETRETENTION=1 opts IN (default OFF). Gate off = pure
// delegation: daily calls the base exactly, setup calls the base
// exactly, startExpedition is never wrapped, ctx untouched — the proof
// test's det-gate pins byte-identical trajectories.
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 = The Mirror
// Draft; the VETERANS bar = living roster members with wave-4+ kills in
// state.waveKillLog, standing.js). No canon doc covers armor/equipment
// or village protection rites — stated, not invented.
'use strict';
const AD = require('./armorydrive');

function vrOn() { return process.env.VETRETENTION === '1'; }

// The post-kill window: 14 days after a wave-4+ kill (the autopsy's
// 1–8d attrition gap, mean ~6d, fits inside with margin).
const VR_WINDOW = 14;
const VR_SHELTER_HURT = 55; // shelter when at/below this HP
const VR_SHELTER_WELL = 85; // release when at/above this HP
const VR_ESCORT_MIN_HP = 70; // escort must be healthy

function vrDay(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

function vrIsLiving(Game, vid) {
  try {
    if (vid === Game.villagerId) return true;
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
    return !!(vp && !vp.dead);
  } catch (e) { return false; }
}

function vrHealth(Game, vid) {
  try {
    const v = (Game.state || {}).village || {};
    const h = (v.health || {})[vid];
    return (typeof h === 'number') ? h : 100;
  } catch (e) { return 100; }
}

function vrName(Game, vid) {
  try {
    if (Game.displayName) return String(Game.displayName(vid)).split(' ')[0];
  } catch (e) {}
  return 'someone';
}

// The blooded: living roster vids (never the scholar) with a wave-4+
// waveKillLog kill inside the window. Returns [{vid, killDay}] with
// killDay = the most recent qualifying kill (window measured from it).
function vrBlooded(Game) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    const scholar = Game.villagerId || null;
    const today = vrDay(Game);
    const log = (Game.state || {}).waveKillLog || [];
    const lastKill = {};
    for (const e of log) {
      if (!e || e.by == null || (e.w | 0) < 4) continue;
      const d = (e.d | 0);
      if (d > today) continue;
      if (lastKill[e.by] == null || d > lastKill[e.by]) lastKill[e.by] = d;
    }
    for (const vid of (v.roster || [])) {
      if (!vid || vid === scholar) continue;
      if (!vrIsLiving(Game, vid)) continue;
      const kd = lastKill[vid];
      if (kd == null) continue;
      if (today - kd > VR_WINDOW) continue;
      out.push({ vid, killDay: kd });
    }
  } catch (e) {}
  return out;
}

function vrTrace(Game, ctx, vid, action, extra) {
  try {
    ctx.vrTrace = ctx.vrTrace || [];
    const row = { day: vrDay(Game), vid, action };
    if (extra) for (const k of Object.keys(extra)) row[k] = extra[k];
    ctx.vrTrace.push(row);
  } catch (e) {}
}

// ---- retention beats (bounded: once per vid per window; the village
// ---- reads as people protecting people, never a resource manager)

function vrShieldSay(Game, vid) {
  try {
    const n = vrName(Game, vid);
    Game.say(`🛡️ ${n} is blooded — the watch marks them shielded: the village's fights will spend others first. ${n} hears the order and goes quiet. "You want me breathing for the door that matters."`);
  } catch (e) {}
}

function vrShelterSay(Game, vid, hp) {
  try {
    const n = vrName(Game, vid);
    Game.say(`🚪 ${n} is hurting (${Math.max(0, Math.round(hp))} HP) — the watch walks them inside and bars the hall door. "You bled for us once this week. That's enough for now."`);
  } catch (e) {}
}

function vrReleaseSay(Game, vid) {
  try {
    const n = vrName(Game, vid);
    Game.say(`📯 ${n} is back on their feet — the hall door unbars for them, and the village goes back to work around them.`);
  } catch (e) {}
}

function vrEscortSay(Game, escortVid, bloodedVid) {
  try {
    const e = vrName(Game, escortVid), b = vrName(Game, bloodedVid);
    Game.say(`🎒 ${e} shoulders a pack to walk with ${b}. "You're not going out there alone — not this week."`);
  } catch (e) {}
}

// ---- the shield (raid escort): v.shielded is the raid draft's own
// ---- back-of-the-line state (havenGrowth.js; written game-side by
// ---- table.js facilitate('shield')). The layer sets and clears the
// ---- same key — no game change, same semantics.

function vrShielded(Game) {
  try {
    const v = (Game.state || {}).village || {};
    v.shielded = v.shielded || {};
    return v.shielded;
  } catch (e) { return {}; }
}

function vrApplyShield(Game, ctx, vid, killDay) {
  const sh = vrShielded(Game);
  if (sh[vid]) return false;
  sh[vid] = true;
  vrTrace(Game, ctx, vid, 'shield', { killDay });
  if (!ctx.vrSaidShield) ctx.vrSaidShield = {};
  if (!ctx.vrSaidShield[vid]) { vrShieldSay(Game, vid); ctx.vrSaidShield[vid] = true; }
  ctx.vrShielded = (ctx.vrShielded || 0) + 1;
  return true;
}

function vrClearShield(Game, ctx, vid, why) {
  const sh = vrShielded(Game);
  if (!sh[vid]) return false;
  delete sh[vid];
  vrTrace(Game, ctx, vid, 'unshield', { why });
  return true;
}

// ---- the escort (expedition pairing): wrap startExpedition so a
// ---- blooded vid never walks out alone. Installed in setup, ONLY
// ---- when the gate is on (gate off = no wrap = byte-identical).

function vrPickEscort(Game, bloodedVid) {
  try {
    const v = (Game.state || {}).village || {};
    const scholar = Game.villagerId || null;
    const blooded = {};
    for (const b of vrBlooded(Game)) blooded[b.vid] = true;
    for (const vid of (v.roster || [])) {
      if (!vid || vid === scholar || vid === bloodedVid) continue;
      if (!vrIsLiving(Game, vid)) continue;
      if (blooded[vid]) continue; // the strong protect the blooded, not the blooded the blooded
      if (v.away && v.away[vid]) continue;
      if (Game.isSheltered && Game.isSheltered(vid)) continue;
      if (vrHealth(Game, vid) < VR_ESCORT_MIN_HP) continue;
      return vid; // deterministic: first eligible in roster order
    }
  } catch (e) {}
  return null;
}

function vrInstallExpeditionWrap(Game, ctx) {
  if (Game.__vrExpeditionWrapped) return;
  const orig = Game.startExpedition;
  if (typeof orig !== 'function') return;
  Game.__vrExpeditionWrapped = true;
  Game.startExpedition = function (vid, hx, hy, announce) {
    let bloodedKillDay = null;
    const wasBlooded = (() => {
      try {
        const scholar = this.villagerId || null;
        if (!vid || vid === scholar) return false;
        const b = vrBlooded(this).find(x => x.vid === vid);
        if (b) bloodedKillDay = b.killDay;
        return !!b;
      } catch (e) { return false; }
    })();
    orig.call(this, vid, hx, hy, announce);
    if (!vrOn() || !wasBlooded) return;
    try {
      const v = this.state.village || {};
      const away = (v.away || {})[vid];
      if (!away || away.purpose !== 'expedition') return; // didn't depart
      const escortVid = vrPickEscort(this, vid);
      if (!escortVid) { vrTrace(this, ctx, vid, 'escort-none'); return; }
      orig.call(this, escortVid, hx, hy, false);
      const eaway = (v.away || {})[escortVid];
      if (!eaway || eaway.purpose !== 'expedition') { vrTrace(this, ctx, vid, 'escort-failed', { escortVid }); return; }
      // Same expedition: the escort walks the blooded vid's road, not
      // their own. Engine-honest state — exactly what startExpedition
      // writes, with the escort's purpose marked.
      let a = null;
      try { a = this.agencyState(); } catch (e) {}
      const bev = (a && a.exped && a.exped[vid]) || null;
      if (bev && a && a.exped) {
        a.exped[escortVid] = {
          tx: bev.tx, ty: bev.ty, dist: bev.dist, legs: 0,
          sinceDay: bev.sinceDay, sincePart: bev.sincePart,
          duration: bev.duration, finds: [], encounters: [],
          escortFor: vid,
        };
        v.away[escortVid] = {
          nx: bev.tx, ny: bev.ty, purpose: 'expedition',
          escortFor: vid,
          sinceDay: bev.sinceDay, sincePart: bev.sincePart,
          duration: bev.duration,
        };
        try {
          const node = this.npcNode ? this.npcNode(vid) : null;
          if (node && this.npcSetNode) this.npcSetNode(escortVid, node.nx, node.ny);
        } catch (e) {}
        vrTrace(this, ctx, vid, 'escort', { escortVid, killDay: bloodedKillDay });
        ctx.vrEscorts = (ctx.vrEscorts || 0) + 1;
        const saidKey = vid + ':escort';
        ctx.vrSaid = ctx.vrSaid || {};
        if (!ctx.vrSaid[saidKey]) { vrEscortSay(this, escortVid, vid); ctx.vrSaid[saidKey] = true; }
      }
    } catch (e) { /* fail-closed: the escort never breaks a departure */ }
  };
}

function withVetRetention(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      if (base.setup) base.setup(Game, ctx);
      if (!vrOn()) return; // gate off: no wrap, byte-identical
      vrInstallExpeditionWrap(Game, ctx);
    },
    daily(Game, ctx) {
      if (!vrOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx); // the whole stack runs first and fully — never preempted
      try {
        ctx.vrMine = ctx.vrMine || []; // vids THIS layer sheltered
        ctx.vrSaid = ctx.vrSaid || {};
        ctx.vrSaidShield = ctx.vrSaidShield || {};
        const v = (Game.state || {}).village || {};
        const scholar = Game.villagerId || null;
        const musterActive = !!(v && v.shelterMustered);

        // The blooded set, today. (vrBlooded already excludes the scholar —
        // a blooded vid who took the mantle drops out of the set here and
        // is handled as a chair transition in the lapse branch below. The
        // mantlechain finding: the chair is the accelerant, so retention
        // stands down the moment the mantle moves — this layer protects
        // blooded FIGHTERS and never funnels anyone toward the chair.)
        const bloodedNow = vrBlooded(Game);
        const bloodedSet = {};
        for (const b of bloodedNow) bloodedSet[b.vid] = b.killDay;
        // Track window lapses AND chair transitions: vids blooded
        // yesterday but not today lose the shield and (if mine) the
        // shelter. A vid who became the scholar is a chair transition,
        // not a lapse.
        const prevBlooded = ctx.vrPrevBlooded || {};
        for (const vid of Object.keys(prevBlooded)) {
          if (!(vid in bloodedSet)) {
            const isChair = (vid === scholar);
            vrClearShield(Game, ctx, vid, isChair ? 'chair' : 'window-lapsed');
            const mi = ctx.vrMine.indexOf(vid);
            if (mi >= 0 && !musterActive && Game.releaseShelter) {
              Game.releaseShelter([vid]);
              ctx.vrMine.splice(mi, 1);
              vrTrace(Game, ctx, vid, isChair ? 'chair-release' : 'release',
                { why: isChair ? 'chair' : 'window-lapsed' });
            }
            delete ctx.vrSaidShield[vid];
          }
        }
        ctx.vrPrevBlooded = Object.assign({}, bloodedSet);

        for (const vid of Object.keys(bloodedSet)) {
          const killDay = bloodedSet[vid];
          // (c1) SHIELD — the raid escort: spend others first. Applies to
          // every blooded vid in-window (the engagement backbone).
          vrApplyShield(Game, ctx, vid, killDay);
          const hp = vrHealth(Game, vid);
          const sheltered = !!(Game.isSheltered && Game.isSheltered(vid));
          const mine = ctx.vrMine.indexOf(vid) >= 0;
          // (a) SHELTER when hurt. Never touch vids the muster owns.
          if (!sheltered && hp <= VR_SHELTER_HURT && !musterActive && Game.shelterVillagers) {
            const n = Game.shelterVillagers([vid], { reason: 'vetretention', quiet: true }) | 0;
            if (n > 0) {
              ctx.vrMine.push(vid);
              ctx.vrShelters = (ctx.vrShelters || 0) + 1;
              vrTrace(Game, ctx, vid, 'shelter', { hp: Math.round(hp), killDay });
              const saidKey = vid + ':shelter';
              if (!ctx.vrSaid[saidKey]) { vrShelterSay(Game, vid, hp); ctx.vrSaid[saidKey] = true; }
            }
          }
          // Release mine when well again (deferred while the muster is active).
          if (mine && !musterActive && hp >= VR_SHELTER_WELL && Game.releaseShelter) {
            Game.releaseShelter([vid]);
            ctx.vrMine.splice(ctx.vrMine.indexOf(vid), 1);
            vrTrace(Game, ctx, vid, 'release', { why: 'healed', hp: Math.round(hp) });
            const saidKey = vid + ':release';
            if (!ctx.vrSaid[saidKey]) { vrReleaseSay(Game, vid); ctx.vrSaid[saidKey] = true; }
          }
          // (b) TRIAGE priority: the engine's own heal check, run for the
          // blooded first — pharmacy, then camp healer. Engages below 70 HP.
          if (hp < 100 && Game.villagerHealCheck) {
            const before = vrHealth(Game, vid);
            let satOut = false;
            try {
              let first = 'Someone';
              try { first = vrName(Game, vid); } catch (e2) {}
              satOut = !!Game.villagerHealCheck(vid, first);
            } catch (e) {}
            const after = vrHealth(Game, vid);
            if (after > before) {
              ctx.vrHeals = (ctx.vrHeals || 0) + 1;
              vrTrace(Game, ctx, vid, 'heal', { from: Math.round(before), to: Math.round(after), killDay });
            } else if (satOut) {
              vrTrace(Game, ctx, vid, 'sitout', { hp: Math.round(before), killDay });
            }
          }
        }
        // Dead-vid hygiene: drop shield/shelter tracking for the dead.
        for (const vid of Object.keys(vrShielded(Game))) {
          if (!vrIsLiving(Game, vid) && vid !== scholar) vrClearShield(Game, ctx, vid, 'dead');
        }
      } catch (e) { /* fail-closed: retention never kills a run */ }
    },
  });
}

function normBase(base) { return AD.normBase(base); }
// Control for the pilot: the armorydrive stack (ARMORYDRIVE=1 outside the
// non-seat substrate), VETRETENTION unset.
function substrateFor(base) { return AD.armedFor(normBase(base)); }
// The vetretention arm: retention OUTSIDE the same stack, VETRETENTION=1.
function armedFor(base) {
  const b = normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withVetRetention(substrateFor(b),
    `${tag}-vetretention`,
    `${b} + armorydrive (ARMORYDRIVE=1) + VETRETENTION retention (VETRETENTION=1): 14d post-kill protection for blooded vids — shelter when hurt, triage priority, escort pairing (raid shield + expedition companion)`);
}

module.exports = {
  vrOn, VR_WINDOW, VR_SHELTER_HURT, VR_SHELTER_WELL, vrBlooded, vrHealth,
  vrPickEscort, withVetRetention, normBase, substrateFor, armedFor,
};
