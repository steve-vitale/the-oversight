#!/usr/bin/env node
// scripts/trustgain-20261014.js — TRUST-GAIN CENSUS instrument
// (longsim scale-onramp r31 ARM 2/3, 2026-10-14).
//
// Diagnostic arm: ZERO game-code changes. This is a harness-side instrument
// that records every trust write in a sim run, with caller attribution, so
// the gain channels (gifts, deeds, tribute, teaching, favors, amends, unload
// gives, grief beats, tendLink) and the penalty drains (-2/take,
// confrontations) can be ranked in numbers.
//
// Read-only by construction: wraps trustGainProgressive (returns orig value),
// a Proxy on state.village.trust (pass-through set), wrap of _trustGain
// (link-trust currency, separate from villager trust), wrap of
// resolveConsequence (channel `name` field), wrap of bumpTrust (reason
// capture), and a say ring-buffer. Nothing written back to game state;
// Math.random stream untouched (no RNG draws inside the instrument).
//
// SUCCESSION LESSON (r30): per-vid ledgers freeze at scholar death. The
// census records EVERY write (no per-vid ledger reads), and the per-day
// lineage sampler tracks Game.villagerId, so scholar-lineage gains are
// joinable by day. Nothing here reads a frozen ledger as live state.
//
// Usage:
//   const { installTrustCensus } = require('./trustgain-20261014');
//   const census = installTrustCensus(Game); // after loadGame, before runDays
//   // ... runDays ...
//   const rows = census.writes;        // every trust write
//   const prog = census.progressive;   // trustGainProgressive calls (base vs applied)
//   const links = census.linkGains;     // _trustGain link-trust writes (separate currency)
//   const days = census.daySamples;     // scholar lineage + roster size per day
'use strict';

function frames(skip) {
  const st = (new Error().stack || '').split('\n').slice(1);
  const out = [];
  for (const line of st) {
    const m = line.match(/at (?:async )?([^\s(]+)/);
    if (!m) continue;
    let name = m[1];
    const dot = name.lastIndexOf('.');
    if (dot >= 0) name = name.slice(dot + 1);
    // strip node internal / eval noise
    if (name === 'eval' || name === 'Object.<anonymous>' || name === '<anonymous>') continue;
    if (name === 'forEach' || name === 'map' || name === 'filter') continue; // see through to the enclosing engine fn
    if (skip && skip.has(name)) continue;
    out.push(name);
    if (out.length >= 6) break;
  }
  return out;
}

// callerName: first stack frame outside the instrument + named internals.
// For bumpTrust-routed writes the interesting frame is the CALLER of
// bumpTrust (one deeper).
function callerName(skipExtra) {
  const skip = new Set(['set', 'get', 'trustGainProgressive', 'installTrustCensus',
    'callerName', 'frames', 'wrapBumpTrust', 'wrapProgressive', 'proxyTrust',
    'wrapLinkGain', 'wrapResolve', 'wrapSay', 'Object.eval', '_trustGain',
    // resolveConsequence is a pass-through router: the CHANNEL is its
    // caller (giveFood, makeAmends, comfort...) and its `name` field.
    // Seeing through it keeps write rows and progressive rows on the
    // same engine caller. The name field is captured separately (wrap 5).
    'resolveConsequence', '_creditPantryGift']);
  if (skipExtra) for (const s of skipExtra) skip.add(s);
  const fs = frames(skip);
  if (!fs.length) return '?';
  // Pass-through routers: my own wrappers share the original's inferred
  // name (bumpTrust), and carexplore's setTrust helper applies an
  // already-scaled gain — the CHANNEL is the caller behind them.
  const ROUTERS = new Set(['bumpTrust', 'setTrust']);
  let i = 0;
  while (i < fs.length - 1 && ROUTERS.has(fs[i])) i++;
  return fs[i];
}

function installTrustCensus(Game) {
  const census = {
    writes: [],        // {day, vid, old, neu, delta, caller}
    progressive: [],   // {day, vid, base, scaled, caller}
    linkGains: [],     // {day, linkId, n, applied, caller}
    bumpReasons: [],   // {day, vid, n, reason, applied}
    resolveNames: [],  // {day, vid, name, trust}
    daySamples: [],    // {day, vid, scholarTrust, roster, villageDays}
    say: [],           // {day, msg} ring buffer (cap)
  };
  const dayNow = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const bumpReasonByVid = {}; // vid -> reason (joined in post from bumpReasons)

  // --- 1. trustGainProgressive: canonical gain path, base vs applied ---
  const origTGP = Game.trustGainProgressive;
  if (typeof origTGP === 'function') {
    Game.trustGainProgressive = function (vid, base) {
      const caller = callerName();
      let scaled;
      try { scaled = origTGP.call(this, vid, base); }
      catch (e) { scaled = base; }
      try {
        census.progressive.push({ day: dayNow(), vid: String(vid), base, scaled, caller });
      } catch (e) {}
      return scaled;
    };
  }

  // --- 2. Proxy on state.village.trust: EVERY write, with delta ---
  function proxyTrust() {
    try {
      const v = Game.state.village;
      if (!v) return;
      const cur = v.trust;
      if (!cur || cur.__trustCensusProxy) return; // already proxied
      const handler = {
        set(target, prop, value) {
          try {
            const old = target[prop];
            const oldN = (typeof old === 'number') ? old : (old === undefined ? 10 : old);
            const neu = value;
            const delta = (typeof neu === 'number') ? neu - (typeof old === 'number' ? old : oldN) : 0;
            if (delta !== 0 && typeof neu === 'number') {
              census.writes.push({ day: dayNow(), vid: String(prop), old: oldN, neu, delta, caller: callerName() });
            }
          } catch (e) {}
          target[prop] = value;
          return true;
        },
        deleteProperty(target, prop) {
          try {
            const old = target[prop];
            if (typeof old === 'number' && old !== 0) {
              census.writes.push({ day: dayNow(), vid: String(prop), old, neu: 0, delta: -old, caller: 'delete:' + callerName() });
            }
          } catch (e) {}
          delete target[prop];
          return true;
        },
      };
      const p = new Proxy(cur, handler);
      Object.defineProperty(p, '__trustCensusProxy', { value: true, enumerable: false });
      v.trust = p;
    } catch (e) {}
  }
  census.reproxy = proxyTrust;
  proxyTrust();

  // --- 3. _trustGain: LINK-trust currency (hierarchy.js) — separate from villager trust ---
  const origLG = Game._trustGain;
  if (typeof origLG === 'function') {
    Game._trustGain = function (link, n) {
      const caller = callerName();
      let applied = 0;
      try { applied = origLG.call(this, link, n); }
      catch (e) { applied = 0; }
      try {
        census.linkGains.push({ day: dayNow(), linkId: link && link.id, n, applied, caller });
      } catch (e) {}
      return applied;
    };
  }

  // --- 4. bumpTrust: capture the reason string for attribution ---
  const origBump = Game.bumpTrust;
  if (typeof origBump === 'function') {
    Game.bumpTrust = function (vid, n, reason) {
      let before = null;
      try { const t = (Game.state.village || {}).trust || {}; before = t[vid]; } catch (e) {}
      const r = origBump.apply(this, arguments);
      try {
        const t = (Game.state.village || {}).trust || {};
        const after = t[vid];
        // caller one-deeper (past both bumpTrust frames) so reasons join
        // their channel exactly, not approximately by (vid,day).
        const bc = callerName();
        census.bumpReasons.push({ day: dayNow(), vid: String(vid), n, reason: reason || '?', before, after, caller: bc,
          channel: CHANNELS[bc] || ('other:' + bc) });
        if (reason) bumpReasonByVid[String(vid)] = reason;
      } catch (e) {}
      return r;
    };
  }

  // --- 5. resolveConsequence: the `name` field is the channel ---
  const origRC = Game.resolveConsequence;
  if (typeof origRC === 'function') {
    Game.resolveConsequence = function (vid, opts) {
      try {
        if (opts && typeof opts.trust === 'number' && opts.trust !== 0) {
          census.resolveNames.push({ day: dayNow(), vid: String(vid), name: opts.name || '?', trust: opts.trust });
        }
      } catch (e) {}
      return origRC.apply(this, arguments);
    };
  }

  // --- 6. say buffers (sense-testing: read the beats, not just counts) ---
  // Ring (recent context) + per-day archive (so early-day beats survive to
  // end-of-run analysis — the ring alone evicts them).
  census.daySays = {};
  const origSay = Game.say;
  const SAY_CAP = 4000, DAY_SAY_CAP = 25;
  if (typeof origSay === 'function') {
    Game.say = function (msg) {
      try {
        const d = dayNow();
        const m = String((msg && (msg.text || msg)) || msg);
        census.say.push({ day: d, msg: m });
        if (census.say.length > SAY_CAP) census.say.splice(0, census.say.length - SAY_CAP);
        const arr = census.daySays[d] || (census.daySays[d] = []);
        if (arr.length < DAY_SAY_CAP) arr.push(m);
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  }

  // --- 7. per-day lineage sampler (call from the daily hook) ---
  census.sampleDay = function () {
    try {
      const v = Game.state.village || {};
      const vid = Game.villagerId;
      const tr = (v.trust || {})[vid];
      census.daySamples.push({
        day: dayNow(), vid: String(vid),
        scholarTrust: tr === undefined ? null : tr,
        writeIndex: census.writes.length, // passive exact observation boundary
        roster: (v.roster || []).length,
      });
    } catch (e) {}
  };

  census.dayNow = dayNow;
  return census;
}

// CHANNEL CLASSIFICATION — caller name -> channel.
// Built from static analysis of every trust write site (game.js, hierarchy.js,
// carexplore.js, conversation.js, convo-scene.js, betrayal.js, contests.js,
// abilityActions.js). Unknown callers classify as 'other:<caller>' and are
// SURFACED in the report — the census must be complete, never silently
// bucketed.
const CHANNELS = {
  // GAINS
  comfort: 'gain:grief-comfort',            // game.js comfort (+8)
  makeAmends: 'gain:amends',                // game.js makeAmends (+4)
  mediateConflict: 'gain:confrontation-mediate', // game.js mediateConflict (+6 both sides)
  rallyVillage: 'gain:rally',               // game.js rallyVillage (+3)
  askSupport: 'gain:favor-support',         // game.js askSupport (+5)
  confrontGossip: 'gain:confrontation-gossip', // game.js confrontGossip (+4)
  donateToPantry: 'gain:donate-unload',     // game.js donateToPantry (kcal/500, x2 generous)
  putAwayFinished: 'gain:counter-unload',   // actual deliberate counter transfer
  applyRep: 'gain:rep-drift',               // game.js applyRep (direct-witness trust ripple)
  abilityOnAcquire: 'gain:ability-unlock',  // game.js abilityOnAcquire
  evStranger: 'gain:event-stranger',        // game.js evStranger
  _evTrustAll: 'gain:event-trustall',       // game.js _evTrustAll
  giveFood: 'gain:food-deed',               // game.js giveFood (deedAmt via resolver)
  appealToGoal: 'gain:appeal-goal',         // game.js appealToGoal (+4)
  resolveInvite: 'gain:betrayal-invite',    // betrayal.js resolveInvite
  nvRespond: 'gain:convo-respond',          // conversation.js nvRespond (+3)
  tendLink: 'link:tend',                    // hierarchy tendLink (+8 via _trustGain) — link currency
  payTribute: 'link:tribute',               // hierarchy payTribute — link currency
  villagerInitiative: 'gain:npc-initiative', // game.js villagerInitiative — they come to YOU (wants with legs)
  tickNeeds: 'drain:ignored-ask',           // game.js tickNeeds — ignored requests (-2)
  // villager-objectives.js: NPC daily life — the working/social deed family
  objReturnEffect: 'gain:work-deed',        // hauled water/wood/food, snare line, garden, fish, expedition return
  objAwayStep: 'gain:social-away',          // walked out together, visits, chance meetings on the road
  objTick: 'gain:objective-tick',           // objective ticks
  resolveOneAssignment: 'gain:assignment-deed', // assignments resolved (haven work)
  resolveWildMonsterEncounter: 'gain:monster-deed', // stood down a monster / bled together
  // drain families
  villageAutoRecruit: 'drain:auto-recruit', // membership.js — village decided without you / stranger taken in (-1)
  declineInvite: 'drain:declined-invite',   // betrayal.js — declined their invitation (-1)
  callOutTeaching: 'gain:teaching-callout', // game.js — contested teaching (+2/-1/-3/-5, mixed)
  slotMoment: 'gain:mentor-slot',           // progression.js — mentored through the slot moment (+4)
  expeditionReturn: 'gain:expedition-return', // villager-agency.js — came back from an expedition (+1)
  npcNodeTravel: 'gain:forage-deed',        // game.js npcNodeTravel — foraged the wilds for the village (+1)
  mapmemButcherForCarry: 'gain:haul-deed', // villager-mapmem.js — actual carcass taken for carry (+1); unknown flesh is not credited as food
  mapmemHaulAt: 'gain:haul-deed', // actual arrival/carcass handling (+1), including unknown flesh; not a food deed
  incidents: 'gain:fireside-conflict',      // game.js conflictIncident — sided/cold-shouldered (+2/-2, mixed)
  conflictIncident: 'gain:fireside-conflict', // same, closure frame named for the fn
  npcTakeAction: 'gain:npc-chat',           // game.js npcTakeAction — NPCs chatting near you warms them toward you (+1, both ways)
  _contestVerdict: 'gain:contest-verdict',  // contests.js — contest verdict trust (+3, played contests)
  leadershipFriction: 'drain:lead-friction', // game.js — gave orders over a contender (-2, LEAD-road friction)
  acceptApplication: 'drain:intake-overrule', // membership.js — overruled a hostile room on intake
  convoConflictFallout: 'drain:convo-fallout', // conversation.js — conflict fallout (-2, jealousy/history)
  theftConfrontation: 'drain:theft-confrontation', // game.js — Route A confrontation (dormant on current base)
  objMaybeDepart: 'gain:social-away',       // villager-objectives.js — walked out together (same family as objAwayStep)
  teachPlant: 'gain:teaching',              // game.js teachPlant — talk-capped at 40 (words only go so far)
  noteSharedFight: 'gain:blood-bond',       // party-bond.js — bled together (+3/+1)
  fieldFight: 'gain:answered-call',         // fieldFights.js — answered a call for help (+1)
  // SETS — baseline assignments, NOT earned gains. Counted separately in
  // the balance so they never inflate the "gain side".
  arrivalTick: 'set:newcomer-trust',        // membership.js — newcomer trust SET to 20
  visitorInteract: 'set:newcomer-trust',    // betrayal.js — accepted visitor trust SET to 20
  playerDeath: 'set:succession-inherit',   // ledger.js — mantle inheritance SET (40% office + 40% own + vouch, floor 10)
  // DRAINS
  takeFromPantry: 'drain:pantry-take-sting', // -2 per take / thief -20 / revoke
  takeFromPantryBulk: 'drain:pantry-bulk',
  confront: 'drain:confrontation',          // justice confrontations (-10)
  // resolveConsequence name-field channels (convo path) — matched on name prefix
};
const RC_CHANNELS = {
  'comfort': 'gain:grief-comfort',
  'makeAmends': 'gain:amends',
  'giveFood': 'gain:food-deed',
  'theorize': 'gain:theorize-talk',
  'promise:made': 'gain:promise-made',
};

function classifyWrite(w) {
  // w: {vid, delta, caller}
  const c = w.caller || '?';
  if (c.indexOf('delete:') === 0) return 'other:delete';
  if (CHANNELS[c]) return CHANNELS[c];
  if (w.delta < 0) return 'drain:other-' + c;
  return 'other:' + c;
}

// Aggregate census rows into a ranked channel table.
// scholarVids: Set of vids in the scholar lineage (for lineage-scoped view),
//   or a Map day->vid for the strict per-day scholar (excludes a successor's
//   NPC-era gains before their succession day).
function rankChannels(census, scholarVids) {
  const byChannel = {};
  // exact reason join: bumpReasons carry their own caller->channel, so each
  // write's reason is the one from the same engine call, not the day's last.
  const reasonByChannel = {};
  for (const b of census.bumpReasons) {
    const rk = b.channel || 'other:?';
    const e = reasonByChannel[rk] || (reasonByChannel[rk] = {});
    e[b.reason || '?'] = (e[b.reason || '?'] || 0) + 1;
  }
  const inLineageStrict = (scholarVids instanceof Map)
    ? (w => scholarVids.get(w.day) === w.vid)
    : (w => scholarVids ? scholarVids.has(w.vid) : true);
  for (const w of census.writes) {
    const ch = classifyWrite(w);
    const inLineage = inLineageStrict(w);
    const e = byChannel[ch] || (byChannel[ch] = {
      channel: ch, fires: 0, gainTotal: 0, drainTotal: 0,
      scholarGain: 0, scholarDrain: 0, scholarFires: 0, reasons: {},
    });
    e.fires++;
    if (w.delta > 0) { e.gainTotal += w.delta; if (inLineage) { e.scholarGain += w.delta; e.scholarFires++; } }
    else { e.drainTotal += w.delta; if (inLineage) e.scholarDrain += w.delta; }
  }
  for (const ch of Object.keys(byChannel)) {
    if (reasonByChannel[ch]) byChannel[ch].reasons = reasonByChannel[ch];
  }
  const rows = Object.values(byChannel).sort((a, b) => (b.gainTotal - a.gainTotal) || (b.fires - a.fires));
  // progressive efficiency: applied/base per caller
  const prog = {};
  for (const p of census.progressive) {
    const ch = CHANNELS[p.caller] ? CHANNELS[p.caller] : ('other:' + p.caller);
    const e = prog[ch] || (prog[ch] = { channel: ch, calls: 0, baseTotal: 0, scaledTotal: 0 });
    e.calls++; e.baseTotal += p.base; e.scaledTotal += p.scaled;
  }
  return { rows, prog: Object.values(prog).sort((a, b) => b.scaledTotal - a.scaledTotal) };
}

module.exports = { installTrustCensus, CHANNELS, RC_CHANNELS, classifyWrite, rankChannels };
