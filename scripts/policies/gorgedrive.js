// gorgedrive — wave-5 pantry-gorge counterplay (scale-onramp r28 ARM 1, 2026-10-14).
//
// The open blank (evidence/2026-10-14/sim-hollow-r27.md, WAVE-5 PANTRY
// PREDATION): a lingering wave-5 monster (The Cancellation) holds the
// treeline and gorges 500-1500 kcal/night from the stores
// (src/js/havenGrowth.js:222: "Drive it off, or call for help."). s88 lost
// 4,071 kcal over two nights -> pantry 17.6k->0 -> 3 hungry days -> the
// scattering. Open question: is the counterplay ("drive it off") reachable,
// or is the beat decoration?
//
// ONE policy-side answer layer, opt-in via GORGEDRIVE=1 (default OFF —
// unset means the wrapper delegates to leadfeast byte-identically; the
// proof test's RED + non-aggression phases pin that). NO game-code changes.
//
// The answer: when a lingering monster is pinned at the haven tile, the
// scholar marches out and answers it with the honest engine verbs:
//   1. Game.travelTo(m.tx, m.ty) — the monster's tile. (startCombat removes
//      the world-monster entity via playerMonster(), which is the monster
//      ON THE PLAYER'S TILE — the scholar must be on the tile for the
//      linkage to hold. No travel, no linkage, the gorge continues.
//      Lingering monsters drift during the day (wanderWorldMonsters) and
//      are re-pinned at dawn — the policy re-scans after travel and
//      requires monsterAt(scholar tile) === target, never removing the
//      wrong entity.)
//   2. Game.triggerEncounter(m.id) — the engine's own "it comes for you"
//      choke point (game.js). The harness resolves it via startCombat +
//      driveFights: a real blow-by-blow player fight with the scholar's
//      real kit, party auto-joining per the 4-square rule (party.js /
//      PARTY.md canon). Kill it and the gorge stops; flee and the entity
//      is removed from the world at fight start ("melt back into the
//      wilds", break-it combat-2) — either way the treeline goes quiet.
//   3. Party via Game.inviteToParty (honest, acceptance-based —
//      personality/trust/cap decide, never forced).
//
// JUDGMENT GATES (all documented design calls, Steve can overrule):
//   - TABLE SANCTITY (Steve 2026-10-12, canon): while the table sits,
//     raiders hold the treeline but do not gorge — never engage mid-finale.
//   - HP: wave-5 apex needs a healthy scholar (>=50% max). Lower waves
//     (>=35%) — the brief's 50% is wave-5-specific; a hushwolf at the
//     treeline is a routine fight the competent scholar handles hurt.
//   - PARTY (brief): never engage a wave-5 lingering monster ALONE when a
//     villager party is available. If no party/followers travel with the
//     scholar and healthy villagers are at home, invite up to 2 via the
//     honest invite verb; if help exists but nobody comes, HOLD — don't
//     march out solo. (No healthy villagers at all: engage alone —
//     there's nobody to ask.)
//   - Never clobber a live fight or a pending encounter (NO SILENT CLOBBER);
//     never answer while asleep or inside the tent (triggerEncounter would
//     route through the tent-breach path — the scholar marches out awake).
//   - One answer per monster per day.
'use strict';
const { leadfeast } = require('./feastscale');

function layerOn() { return process.env.GORGEDRIVE === '1'; }

function havenTile(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return {
      x: (v.px !== undefined && v.px !== null) ? v.px : 4,
      y: (v.py !== undefined && v.py !== null) ? v.py : 4,
    };
  } catch (e) { return { x: 4, y: 4 }; }
}

// lingeringMonsters: every live lingering entity. havenGrowthDaily re-pins
// them to the haven tile at each dawn before the gorge loop, but
// wanderWorldMonsters (35% per tile-entry worldTick) lets them drift during
// the day — the policy tracks the ENTITY, not the tile (design call, Steve
// can overrule; the brief's haven-tile condition is the common case, and
// the haven-tile lingerer is still preferred as the target).
function lingeringMonsters(Game) {
  try {
    const ms = Game.worldMonsters ? Game.worldMonsters() : [];
    return ms.filter(m => m && m.lingering && (m.hp || 0) > 0);
  } catch (e) { return []; }
}

// lingeringAtHaven: the exact set havenGrowthDaily gorges for — pinned at
// the haven tile, alive. (havenGrowth.js: m.lingering, m.tx=hx, m.ty=hy.)
function lingeringAtHaven(Game) {
  try {
    const { x: hx, y: hy } = havenTile(Game);
    return lingeringMonsters(Game).filter(m => m.tx === hx && m.ty === hy);
  } catch (e) { return []; }
}

function scholarHpPct(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const max = (Game.maxHealth ? Game.maxHealth() : 100) || 100;
    return (s.health || 0) / max;
  } catch (e) { return 0; }
}

// healthyVillagersAtHome: the raid defenders' own bar (havenGrowth.js —
// health > 40, at home, not the scholar). These are the people the scholar
// can honestly ask to march out.
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

// monsterWave: world-monster entities do NOT reliably carry `wave` (the
// raid path reads m.wave || 1 defensively) — resolve from the def by id.
function monsterWave(Game, m) {
  try {
    if (m && m.wave) return m.wave;
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}

// gorgeDrive: the answer layer. Called from daily (once per loop-day, before
// sleep rolls the night the gorge would fire on).
function gorgeDrive(Game, ctx) {
  if (!layerOn()) return;
  try {
    const s = (Game.state || {}).scholar || {};
    if (!s || Game.over) return;
    // early-guard blocks are counted when a lingerer is actually waiting —
    // otherwise the "why didn't it engage" question is unanswerable
    const earlyBlocked = (Game.tbfight && !Game.tbfight.over) || Game.pendingEncounter || Game._sleeping || s.insideTent;
    if (earlyBlocked) {
      try {
        if (lingeringMonsters(Game).length) ctx.gorgeBlockedEarly = (ctx.gorgeBlockedEarly || 0) + 1;
      } catch (e) {}
      return;
    }
    if (Game.tableActive && Game.tableActive()) {      // TABLE SANCTITY (Steve 2026-10-12)
      ctx.gorgeHeldTable = (ctx.gorgeHeldTable || 0) + 1;
      return;
    }
    const lingerers = lingeringMonsters(Game);
    if (!lingerers.length) return;
    ctx.gorgeDaysSaw = (ctx.gorgeDaysSaw || 0) + 1;
    // prefer the haven-tile lingerer (the gorging position); a drifted one
    // is still the same treeline threat and gets answered where it stands.
    const { x: hx0, y: hy0 } = havenTile(Game);
    const atHaven = (m) => m.tx === hx0 && m.ty === hy0;
    lingerers.sort((a, b) => (atHaven(a) ? 0 : 1) - (atHaven(b) ? 0 : 1));
    const m = lingerers[0];
    const day = s.day || 0;
    ctx._gorgeAns = ctx._gorgeAns || {};
    if (ctx._gorgeAns[m.id + '|' + day]) return;        // one answer per monster per day
    // HP JUDGMENT: wave-5 apex needs a healthy scholar; lower waves the
    // lower bar (documented above). Wave resolved from the def — entities
    // don't reliably carry it.
    const need = (monsterWave(Game, m) >= 5) ? 0.5 : 0.35;
    if (scholarHpPct(Game) < need) {
      ctx.gorgeHeldHp = (ctx.gorgeHeldHp || 0) + 1;
      return;
    }
    // PARTY JUDGMENT (brief): never alone when a villager party is available.
    if (!companions(Game)) {
      const cands = healthyVillagersAtHome(Game).filter(id => {
        try { if (!Game.state.systemArrived) return false; } catch (e) { return false; }
        try { if (Game.partyFull && Game.partyFull()) return false; } catch (e) {}
        const trust = (((Game.state || {}).village || {}).trust || {})[id];
        return (trust === undefined ? 10 : trust) >= 20; // inviteToParty's trust floor
      });
      for (const vid of cands.slice(0, 2)) {
        try {
          const r = Game.inviteToParty ? Game.inviteToParty(vid) : null;
          if (r && r.ok) { ctx.gorgeInvitesOk = (ctx.gorgeInvitesOk || 0) + 1; break; }
          ctx.gorgeInvitesRefused = (ctx.gorgeInvitesRefused || 0) + 1;
        } catch (e) {}
      }
      if (!companions(Game) && cands.length) {
        // help exists but nobody would come — hold. Don't march out solo.
        ctx.gorgeHeldAlone = (ctx.gorgeHeldAlone || 0) + 1;
        return;
      }
      // no healthy villagers at all: nobody to ask — engage alone.
    }
    // MARCH OUT: travel to the monster's tile (the startCombat <->
    // playerMonster() linkage needs the scholar ON its tile), then re-scan:
    // tile entry ticks the world (worldTick -> wanderWorldMonsters), so the
    // target may have drifted — and the one-per-tile rule means monsterAt
    // returns the first entity there. Require the tile's monster to BE our
    // target (never remove the wrong entity); otherwise try again tomorrow.
    if (Game.map && (Game.map.px !== m.tx || Game.map.py !== m.ty)) {
      try { Game.travelTo(m.tx, m.ty); } catch (e) {}
      if (Game.over || (Game.tbfight && !Game.tbfight.over) || Game.pendingEncounter) return;
    }
    let target = null;
    try {
      const at = Game.monsterAt ? Game.monsterAt(Game.map.px, Game.map.py) : null;
      if (at === m) target = m;
    } catch (e) {}
    if (!target) { ctx.gorgeVerifyFailed = (ctx.gorgeVerifyFailed || 0) + 1; return; }
    if (Game.triggerEncounter) Game.triggerEncounter(target.id);
    ctx._gorgeAns[m.id + '|' + day] = true;
    ctx.gorgeEngagements = (ctx.gorgeEngagements || 0) + 1;
    // NO SILENT ACTIONS (Steve): the answer reads in the transcript — a
    // village decision, not a dispenser line.
    try {
      const who = Game.displayName ? String(Game.displayName(Game.villagerId)).split(' ')[0] : 'The scholar';
      const mn = Game.monsterDisplayName ? Game.monsterDisplayName(m.id) : m.id;
      const partyN = companions(Game);
      Game.say(`🥁 ${who} marches out to drive off the lingering ${mn} at the treeline${partyN ? ` — ${partyN} at their back` : ' — alone, no one else to ask'}.`);
    } catch (e) {}
  } catch (e) {}
}

function withGorgeDrive(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      const r = base.daily(Game, ctx);
      try { gorgeDrive(Game, ctx); } catch (e) {}
      return r;
    },
  });
}

const leadfeastGorgedrive = withGorgeDrive(
  leadfeast,
  'leadfeast+gorgedrive',
  'leadfeast + r28 gorge-drive layer (GORGEDRIVE=1): scholar answers lingering treeline monsters'
);

// policyForRun: the census driver always runs through this so the gate-off
// baseline exercises the exact delegation path the proof pins byte-identical.
function policyForRun() { return leadfeastGorgedrive; }

module.exports = {
  layerOn, withGorgeDrive, leadfeastGorgedrive, leadfeast, policyForRun,
  gorgeDrive, lingeringAtHaven, lingeringMonsters, havenTile, scholarHpPct, healthyVillagersAtHome, companions, monsterWave,
};
