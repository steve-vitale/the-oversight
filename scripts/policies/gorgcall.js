// gorgcall — wave-4/5 pantry-gorge call-for-help layer (loop B, 2026-10-14).
//
// The open blank (sim-findings 2026-10-14 "WAVE-4/5 LINGERERS ARE UNDRIVABLE",
// steve-call; evidence/2026-10-14/sim-predation-b.md): wave-4/5 lingering
// monsters gorge Haven's pantry at the treeline (havenGrowth.js
// havenGrowthDaily: 500-1500 kcal/night via raidPillage) and the beat says
// "Drive it off, or call for help." Combat can't answer them (0/17 drive-off
// kills measured; the predation diagnostic). The gorgedrive policy answers
// waves 1-3 with combat; "call for help" measured 0/24 on those policies.
// This layer asks whether the EXISTING aid chain (src/js/comms.js
// Game.callForHelp: runner / signal / system / cry — help is NEVER free and
// never guaranteed; four_tiers_honest_costs) is the real apex answer.
//
// ONE policy-side answer layer, opt-in via GORGCALL=1 (default OFF — unset
// means the wrapper delegates to leadfeast byte-identically; the proof
// test's RED + non-aggression phases pin that). NO game-code changes. The
// layer is WAVE-4/5 ONLY — wave-1/3 answering belongs to gorgedrive; this
// layer never touches it.
//
// The answer: on a gorge night with a lingering wave-4/5 monster at the
// treeline, the scholar CALLS FOR HELP via the honest engine verbs:
//   1. Game.raiseAidCrisis(name, wave) — only when no crisis is active.
//      Player-declared, reactive (the gorge beat is the trigger); raids
//      normally raise their own crisis first (havenRaidTick), so this fires
//      when the raid's crisis already resolved (the off-tile drift case)
//      while the monster still lingers.
//   2. Game.callForHelp(tier, opts) — tier choice, honest costs, engine-
//      charged (the policy names the price in its own decision line; the
//      engine's lines follow — NO SILENT ACTIONS, Steve):
//        - system relay, when Game.integrationStage() >= 2 (instant,
//          asks all links; garbled + a favor owed — the System's cut).
//        - signal fire otherwise (fast; asks all linked villages; smoke
//          draws company — crisis.attracted+1 — and hostile fires read it).
//        - runner as the ESCALATION: if the episode still lives 2+ days
//          after the first call with no help arrived and none marching,
//          a runner goes to the highest-trust link (slow, real road
//          danger — the engine can take them).
//      (cry is deliberately excluded: build-gated on war_cry-class
//      abilities the policy must not presume — the brief's tier list is
//      runner / signal / system.)
//   3. The engine does the rest: aidAskVillage (aloud, fast, trust>=35,
//      wave>=3 penalty), parties marching real day-parts, aidHelpArrived,
//      the 6-day moved-on valve. The policy NEVER fights the lingerer and
//      never presumes the arrival ends the gorge — if help arrives and
//      stands at the door while the gorge continues, that IS the finding
//      (documented, not built: aidFight is dormant in production).
//
// JUDGMENT GATES (all documented design calls, Steve can overrule):
//   - TABLE SANCTITY (Steve 2026-10-12, canon): raiders don't gorge while
//     the table sits — no call mid-finale.
//   - One call per monster per day; no re-call for the same ENTITY within
//     2 days (episodes pace the calls, not nights — no beacon spam).
//   - No links at all -> no call (counted; one honest policy line: the
//     beacon stays dark when nobody's linked).
//   - Never clobber a live fight or a pending encounter; never call while
//     asleep or inside the tent.
//   - The policy's own raised crisis is RESOLVED ('moved-on') when no
//     wave-4/5 lingerer remains — a lingering generic crisis would BLOCK
//     a later raid's crisis (raiseAidCrisis: one at a time) and steal its
//     crisis.raiders path (the-siege beat). Tight lifecycle, no theft.
//   - LINGERER DRIFT (sim-findings 2026-10-14): entities wander off the
//     haven tile during the day — track the ENTITY (ephemeral _gorgcall
//     marker on the entity), not the tile; wave resolved from the def
//     (entity-wave-missing).
'use strict';
const { leadfeast } = require('./feastscale');

function layerOn() { return process.env.GORGCALL === '1'; }

function havenTile(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return {
      x: (v.px !== undefined && v.px !== null) ? v.px : 4,
      y: (v.py !== undefined && v.py !== null) ? v.py : 4,
    };
  } catch (e) { return { x: 4, y: 4 }; }
}

// apexLingerers: live lingering entities of wave >= 4, haven-tile first.
// Wave resolved from the def — entities don't reliably carry it.
function apexLingerers(Game) {
  try {
    const { x: hx, y: hy } = havenTile(Game);
    const defs = ((Game.data || {}).monsters) || [];
    const out = [];
    const ms = Game.worldMonsters ? Game.worldMonsters() : [];
    for (const m of ms) {
      if (!m || !m.lingering || (m.hp || 0) <= 0) continue;
      let w = m.wave;
      if (!w) {
        const d = defs.find(x => x && x.id === m.id);
        w = (d && d.wave) || 1;
      }
      if (w < 4) continue;
      out.push({ m, wave: w, atHaven: m.tx === hx && m.ty === hy });
    }
    out.sort((a, b) => (a.atHaven ? 0 : 1) - (b.atHaven ? 0 : 1));
    return out;
  } catch (e) { return []; }
}

function linkedVillages(Game) {
  try {
    const links = Game.villageLinks ? Game.villageLinks('haven') : [];
    return (links || []).filter(l => l && l.status === 'active');
  } catch (e) { return []; }
}

// bestLink: highest-trust ACTIVE link at/above the ask floor (35, comms.js
// AID_ASK_TRUST) — the runner's honest target. Below the floor the ask is
// refused aloud and the road risk buys nothing.
function bestLink(Game) {
  try {
    const links = linkedVillages(Game);
    let best = null, bt = -1;
    for (const l of links) {
      const t = l.trust || 0;
      if (t >= 35 && t > bt) { bt = t; best = l; }
    }
    if (!best) return null;
    const id = best.primary === 'haven' ? best.subordinate : best.primary;
    return { link: best, id, trust: bt };
  } catch (e) { return null; }
}

function monsterName(Game, m) {
  try { return (Game.monsterDisplayName && Game.monsterDisplayName(m.id)) || m.id; } catch (e) { return m.id; }
}

function scholarFirst(Game) {
  try { return String(Game.displayName ? Game.displayName(Game.villagerId) : 'The scholar').split(' ')[0]; } catch (e) { return 'The scholar'; }
}

// gorgeCall: the answer layer. Called from daily (once per loop-day, before
// sleep rolls the night the gorge would fire on).
function gorgeCall(Game, ctx) {
  if (!layerOn()) return;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!s || Game.over) return;
    const day = s.day || 0;
    const earlyBlocked = (Game.tbfight && !Game.tbfight.over) || Game.pendingEncounter || Game._sleeping || s.insideTent;
    if (earlyBlocked) {
      try { if (apexLingerers(Game).length) ctx.gorgeCallBlockedEarly = (ctx.gorgeCallBlockedEarly || 0) + 1; } catch (e) {}
      return;
    }
    if (Game.tableActive && Game.tableActive()) {      // TABLE SANCTITY
      ctx.gorgeCallHeldTable = (ctx.gorgeCallHeldTable || 0) + 1;
      return;
    }
    // Tight crisis lifecycle: the layer's own raised crisis dies when the
    // episode does — never block a later raid's crisis (one crisis at a
    // time; raid crises carry crisis.raiders -> the-siege beat).
    const apex = apexLingerers(Game);
    const crisis = Game.aidCrisis ? Game.aidCrisis() : null;
    if (crisis && crisis._gorgcallRaised && !apex.length) {
      try { Game.resolveAidCrisis('moved-on'); ctx.gorgeCrisisResolved = (ctx.gorgeCrisisResolved || 0) + 1; } catch (e) {}
      return;
    }
    if (!apex.length) return;
    ctx.gorgeCallDaysSaw = (ctx.gorgeCallDaysSaw || 0) + 1;
    const { m, wave } = apex[0];
    // One call per monster per day; no re-call for the same ENTITY within
    // 2 days (episodes pace the calls, not nights).
    const mark = m._gorgcall || {};
    if (mark.lastCallDay === day) { ctx.gorgeCallOncePerDay = (ctx.gorgeCallOncePerDay || 0) + 1; return; }
    if (mark.firstCallDay != null && day - mark.firstCallDay < 2 && !mark.escalated) {
      ctx.gorgeCallCooldown = (ctx.gorgeCallCooldown || 0) + 1;
      return;
    }
    const mn = monsterName(Game, m);
    // The door: raids normally raise their own crisis; the layer raises one
    // only when the door is quiet but the teeth are still here.
    let cr = crisis;
    if (!cr) {
      try {
        cr = Game.raiseAidCrisis ? Game.raiseAidCrisis(mn, wave) : null;
        if (cr) { cr._gorgcallRaised = true; ctx.gorgeCrisisRaised = (ctx.gorgeCrisisRaised || 0) + 1; }
      } catch (e) {}
    }
    if (!cr) { ctx.gorgeCallNoCrisis = (ctx.gorgeCallNoCrisis || 0) + 1; return; }
    const who = scholarFirst(Game);
    // TIER CHOICE (honest costs, engine-charged; the policy names the price):
    //   system relay when the neural creep can carry voices (stage 2+);
    //   signal fire otherwise (fast — the gorge is nightly);
    //   runner as the escalation when the first call bought nothing.
    let tier = 'signal';
    try { if (Game.integrationStage && Game.integrationStage() >= 2) tier = 'system'; } catch (e) {}
    let pending = 0, arrived = 0;
    try { pending = ((Game.state || {}).pendingHelp || []).length; } catch (e) {}
    try { arrived = (((Game.aidCrisis && Game.aidCrisis()) || {}).helpAtDoor || []).length; } catch (e) {}
    // The door is already answered: help marching or at the door. Calling
    // again would stack parties (and favors owed) against one monster — the
    // gorge continuing under an answered door is the engine's finding, not
    // a reason to re-call.
    if (mark.firstCallDay != null && (pending > 0 || arrived > 0)) {
      ctx.gorgeCallHeldAnswered = (ctx.gorgeCallHeldAnswered || 0) + 1;
      return;
    }
    const escalate = mark.firstCallDay != null && day - mark.firstCallDay >= 2 &&
      !mark.escalated && pending === 0 && arrived === 0;
    if (escalate) {
      const bl = bestLink(Game);
      if (!bl) { ctx.gorgeCallEscSkip = (ctx.gorgeCallEscSkip || 0) + 1; return; }
      tier = 'runner';
      mark.escalated = true;
      mark.escalateTarget = bl.id;
    } else {
      if (!linkedVillages(Game).length) {
        ctx.gorgeCallNoLinks = (ctx.gorgeCallNoLinks || 0) + 1;
        try { Game.say(`${who} would call for help against the lingering ${mn} — but no fire is linked. The beacon stays dark. Haven stands alone.`); } catch (e) {}
        return;
      }
    }
    const opts = {};
    if (tier === 'runner' && mark.escalateTarget) opts.targetId = mark.escalateTarget;
    let res = null;
    try { res = Game.callForHelp ? Game.callForHelp(tier, opts) : null; } catch (e) { res = 'threw'; }
    m._gorgcall = { firstCallDay: mark.firstCallDay != null ? mark.firstCallDay : day, lastCallDay: day, escalated: !!mark.escalated, tier };
    ctx.gorgeCalls = ctx.gorgeCalls || [];
    ctx.gorgeCalls.push({ day, tier, monsterId: m.id, wave, result: String(res) });
    ctx['gorgeCall_' + tier] = (ctx['gorgeCall_' + tier] || 0) + 1;
    // NO SILENT ACTIONS: the decision reads in the transcript — a village
    // deciding, costs named, never a meter.
    try {
      if (tier === 'signal') Game.say(`🔥 ${who} lights the beacon against the lingering ${mn} at the treeline — smoke climbs for every linked fire. Hostile eyes will read it too, and the treeline will crowd. That's the price of being heard.`);
      else if (tier === 'system') Game.say(`◈ ${who} begs the System to carry a call against the lingering ${mn} — the relay is enthusiastic and already translating. A favor will be owed. That's the price of being carried.`);
      else Game.say(`🏃 ${who} sends a runner to ${mark.escalateTarget || 'the nearest linked fire'} about the lingering ${mn} — the beacon bought nothing. The road is dangerous and the runner is gone from Haven's hands. That's the price of the second try.`);
    } catch (e) {}
  } catch (e) {}
}

function withGorgeCall(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      const r = base.daily(Game, ctx);
      try { gorgeCall(Game, ctx); } catch (e) {}
      return r;
    },
  });
}

const leadfeastGorgcall = withGorgeCall(
  leadfeast,
  'leadfeast+gorgcall',
  'leadfeast + gorge-call layer (GORGCALL=1): scholar calls for help against wave-4/5 lingering treeline monsters'
);

// policyForRun: the sweep driver always runs through this so the gate-off
// baseline exercises the exact delegation path the proof pins byte-identical.
function policyForRun() { return leadfeastGorgcall; }

module.exports = {
  layerOn, withGorgeCall, leadfeastGorgcall, leadfeast, policyForRun,
  gorgeCall, apexLingerers, havenTile, bestLink,
};
