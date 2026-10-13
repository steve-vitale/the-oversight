#!/usr/bin/env node
// scripts/villkill-20261013.js — VILLKILL instrument (scale-wall r18 ARM 3,
// DIAGNOSTIC, no game changes).
//
// Question (r18 arm 3): on the courtship road, does the VILLAGE (NPCs) kill
// wave-3 monsters at all, and does the ledger's kill-only rung count those
// kills? r17 found the wave-4 gate is a TWO-RUNG bind (0/16 meet both: 4
// wave-3 ledger kill points + regional+ scale); deepening r9 established
// wave-3 unlocks are earned COLLECTIVELY (villager wave-2 kills feed the
// ledger). If villager wave-3 kills happen and count, the courtship road has
// a second kill engine the scholar-only measurement missed; if they never
// happen (r16 arm C: NPCs die entering fights at median 22 HP, 27/31
// one-shot in 1 round on wave 1 — and wave 3 is harder), that's a measured
// structural answer. Either outcome is a result.
//
// Attribution path (verified by reading 2026-10-13 — no assumptions):
//   The ledger (src/js/waveLedger.js: scoreLedgerKill) takes only a
//   monsterId — it never records WHO killed. Every real kill flows through
//   Game.recordWaveKill (the choke point), called from exactly two classes
//   of site:
//     (1) tbEnd (game.js:37585) — the scholar's turn-based combat kills.
//     (2) synchronously after fieldFight(...) returns {outcome:'vKill'} —
//         resolvePatrol (game.js:6449), resolveWildMonsterEncounter
//         (game.js:17240), expeditionMonster (villager-agency.js:385),
//         aidFight (comms.js:654), _cxBlood/hide/beastmaster
//         (contestEngine.js:369/601/625). In EVERY case the recordWaveKill
//         call is synchronous with the fieldFight return and carries the
//         same monster id.
//   This instrument attributes AT the choke point: it wraps fieldFight to
//   stash a pending {vid, monsterId} marker on vKill, and wraps
//   recordWaveKill to consume the marker (id-matched — a stale or mismatched
//   marker is NOT consumed, so a villager kill can never be misattributed to
//   the scholar or vice versa) and log waveLedgerPoints(3) before/after.
//
// Attribution buckets:
//   scholar-tb   — TB kill, no fieldFight marker (the player/scholar).
//   field-vessel — fieldFight vKill by a player vessel (r16 arm-C mantleOf
//                  separation: mantleOf from-set, or the current scholar's
//                  villagerId).
//   field-npc    — fieldFight vKill by a pure NPC villager.
// "Village action" = field-vessel + field-npc: everything the scholar-only
// r17 measurement missed.
//
// TOOLING ONLY — pass-through wraps; zero game behavior change. Proven by
// scripts/test-villkill-20261013.js.
'use strict';

const WAVE = 3;

// isVessel: r16 arm-C mantleOf separation. A vid is a player vessel if it is
// the current scholar's villager, or appears as `from` in the village's
// mantleOf handoff list (ledger.js writes it on every playerDeath). Post-hoc
// the list is complete; mid-run it covers all completed successions.
function isVessel(Game, vid) {
  try {
    const v = String(vid == null ? '' : vid);
    if (!v) return false;
    const cur = Game.villagerId != null ? String(Game.villagerId)
      : String(((Game.state || {}).scholar || {}).villagerId || '');
    if (cur && v === cur) return true;
    const mantle = ((Game.state || {}).village || {}).mantleOf || [];
    for (const x of mantle) if (String(x.from) === v) return true;
  } catch (e) {}
  return false;
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function ledgerPts(Game, wave) {
  try { return (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(wave) | 0) : 0; } catch (e) { return 0; }
}

function attachVillKill(Game, m) {
  const vk = m.villkill = {
    kills: [],            // every wave-3 recordWaveKill, attributed + delta'd
    byType: {},           // monsterId -> {scholar, vessel, npc, pts}
    nonWave3: 0,          // recordWaveKill calls for other waves (sanity)
  };

  // fieldFight wrap: capture the killer on vKill. The marker is consumed by
  // the recordWaveKill wrap; a non-vKill outcome clears it so a stale marker
  // can never leak into a later, unrelated kill.
  const origFF = Game.fieldFight ? Game.fieldFight.bind(Game) : null;
  if (origFF) {
    Game.fieldFight = function (vid, mdef, monster, opts) {
      const rec = origFF(vid, mdef, monster, opts);
      try {
        if (rec && rec.outcome === 'vKill' && mdef && mdef.id) {
          Game._vkPending = {
            vid: String(vid == null ? '' : vid),
            monsterId: mdef.id,
            wave: mdef.wave || 1,
            rounds: rec.rounds || 0,
            vTaken: rec.vTaken || 0,
            noFlee: !!(opts && opts.noFlee),
          };
        } else {
          Game._vkPending = null;
        }
      } catch (e) {}
      return rec;
    };
  }

  // recordWaveKill wrap: the choke point. Log wave-3 kills with attribution
  // and the ledger delta tied to THIS kill (before/after around the call).
  const origRWK = Game.recordWaveKill ? Game.recordWaveKill.bind(Game) : null;
  if (origRWK) {
    Game.recordWaveKill = function (monsterId) {
      let wave = 0;
      try {
        const mdef = (Game.data.monsters || []).find(x => x.id === monsterId) || {};
        wave = mdef.wave || 1;
      } catch (e) {}
      const before = ledgerPts(Game, WAVE);
      const pend = Game._vkPending;
      Game._vkPending = null;
      const r = origRWK(monsterId);
      try {
        if (wave === WAVE) {
          const after = ledgerPts(Game, WAVE);
          let src = 'scholar-tb', vid = null, rounds = null, vTaken = null, noFlee = false;
          if (pend && pend.monsterId === monsterId) {
            vid = pend.vid; rounds = pend.rounds; vTaken = pend.vTaken; noFlee = pend.noFlee;
            src = isVessel(Game, vid) ? 'field-vessel' : 'field-npc';
          }
          const k = {
            day: gday(Game), monsterId, wave, src, vid, rounds, vTaken, noFlee,
            ledgerBefore: before, ledgerAfter: after, delta: after - before,
          };
          vk.kills.push(k);
          const e = vk.byType[monsterId] || (vk.byType[monsterId] = { scholar: 0, vessel: 0, npc: 0, pts: 0 });
          if (src === 'scholar-tb') e.scholar++;
          else if (src === 'field-vessel') e.vessel++;
          else e.npc++;
          e.pts += (after - before);
        } else {
          vk.nonWave3++;
        }
      } catch (e) {}
      return r;
    };
  }
  return vk;
}

// finalizeVillKill(Game, m): per-run summary answering the arm's questions.
function finalizeVillKill(Game, m) {
  const vk = (m && m.villkill) || { kills: [], byType: {} };
  const kills = vk.kills || [];
  const bySrc = { 'scholar-tb': 0, 'field-vessel': 0, 'field-npc': 0 };
  let villagePts = 0, scholarPts = 0, rungCloseDay = null, rungCloseSrc = null;
  const BAR = 4; // wave-3 ledger bar for the wave-4 gate (wave-ledger.json)
  for (const k of kills) {
    bySrc[k.src] = (bySrc[k.src] || 0) + 1;
    if (k.src === 'scholar-tb') scholarPts += k.delta;
    else villagePts += k.delta;
    if (rungCloseDay == null && k.ledgerAfter >= BAR && k.ledgerBefore < BAR) {
      rungCloseDay = k.day; rungCloseSrc = k.src;
    }
  }
  const finalPts = ledgerPts(Game, WAVE);
  return {
    wave3Kills: kills.length,
    scholarKills: bySrc['scholar-tb'] || 0,
    vesselKills: bySrc['field-vessel'] || 0,
    npcKills: bySrc['field-npc'] || 0,
    villageKills: (bySrc['field-vessel'] || 0) + (bySrc['field-npc'] || 0),
    scholarPts, villagePts,
    ledgerPtsFinal: finalPts,
    rungClosed: finalPts >= BAR,
    rungCloseDay, rungCloseSrc,
    // "closed via village action": the village's own kills scored >= the bar
    rungClosedViaVillage: villagePts >= BAR,
    byType: vk.byType || {},
    killLog: kills,
    nonWave3Kills: vk.nonWave3 || 0,
  };
}

module.exports = { attachVillKill, finalizeVillKill, isVessel, WAVE };
