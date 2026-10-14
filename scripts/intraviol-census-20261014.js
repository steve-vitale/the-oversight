#!/usr/bin/env node
// scripts/intraviol-census-20261014.js — INSTRUMENT-ONLY intra-village violence census.
//
// MOTIVATION (evidence/2026-10-13/sim-plenty-b.md): the wall-suite death census
// reads 61 player deaths, 104 monster-killed villagers, 49 villager-on-villager
// kills, 3 other — ~1/5 of all deaths are the village killing itself, and the
// justice/moot lane has NO measurement on the courtship road. Whether that is
// theft-punishment, succession violence, moot executions, contest deaths, raid
// defense, or a misclassification bug is unmeasured. This script measures it.
//
// INSTRUMENT-ONLY: zero game-code changes. All instrumentation is harness-side
// (wraps Game.registerDeath / Game.tbDamage / Game.say AFTER loadGame), records
// into script-owned properties (Game._intraviol*), consumes no RNG, mutates no
// game state. Gameplay byte-identical with the instrument on vs off — proven in
// scripts/test-intraviol-20261014.js (2 seeds, plus a sabotage control proving
// the equality check is sensitive).
//
// Usage:
//   node scripts/intraviol-census-20261014.js
//     OUT=evidence/2026-10-14/sim-intraviol-20261014.json
//   SEEDS="11,22" POLICIES="leadcourt" — filters (default: 8 seeds x 2 policies)
//   INTRAVIOL_SABOTAGE=1 — sabotage control: tbDamage wrapper consumes one RNG
//     draw per hit (used by the byte-identical proof's RED phase; NEVER for real runs)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const { leadfeast } = require('./policies/feastscale');

const POLICY_REGISTRY = { leadcourt, belongseek, leadfeast };
const DEFAULT_SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180; // death-aware: runDays stops at pop-zero

const _seedF = (process.env.SEEDS || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const _polF = (process.env.POLICIES || '').split(',').map(s => s.trim()).filter(Boolean);
const SABOTAGE = process.env.INTRAVIOL_SABOTAGE === '1';

// ---------- instrument ----------
const DEATH_LINE_RE = /☠|dies|died|dead|kill|murder|moot|execut|ambush|uprising|traitor|exil/i;

function attachIntraviol(Game) {
  if (process.env.INTRAVIOL_NOATTACH === '1') return null; // test RED hook
  if (Game._intraviol) return Game._intraviol; // idempotent
  const log = [];            // one record per REAL death registration (tele fired)
  const lastHitVid = {};     // villagerId -> last tbDamage source that landed
  const sayLines = [];       // death-adjacent transcript (sense-testing)

  // --- registerDeath wrapper: THE choke point (corpses.js) + ledger's wrap ---
  const origRD = Game.registerDeath;
  Game.registerDeath = function (opts) {
    const o = opts || {};
    // Snapshot BEFORE the call: pure reads, no RNG, no mutation.
    let rec = null;
    try {
      const f = this.tbfight || null;
      let fsum = null;
      if (f && Array.isArray(f.fighters)) {
        const counts = {};
        for (const x of f.fighters) {
          const k = (x.kind || '?') + (x.alive ? '' : ':dead');
          counts[k] = (counts[k] || 0) + 1;
        }
        fsum = { uprising: !!f.uprising, betrayal: !!f.betrayal, counts };
      }
      const vid = o.villagerId || null;
      // lastHit is only valid inside the fight where it landed (see tbDamage
      // wrapper) — a stale entry from an earlier fight must not attribute.
      // The fight object itself is never serialized (circular); strip it.
      let lhSnap = null;
      try {
        const curF = this.tbfight || null;
        const lh = vid && lastHitVid[vid] ? lastHitVid[vid] : null;
        if (lh && curF && lh.fight === curF) {
          lhSnap = { sourceKey: lh.sourceKey, sourceKind: lh.sourceKind, sourceVid: lh.sourceVid, label: lh.label };
        }
      } catch (e) {}
      rec = {
        day: ((this.state || {}).scholar || {}).day || 0,
        kind: o.kind || '?',
        who: o.villagerId || o.monsterId || o.name || '?',
        villagerId: vid,
        name: String(o.name || '?').slice(0, 48),
        cause: String(o.cause || '?').slice(0, 80),
        killerId: o.killerId != null ? o.killerId : null,
        player: !!o.player,
        playerVessel: this.villagerId || null,
        uprising: !!(f && f.uprising),
        betrayal: !!(f && f.betrayal),
        fight: fsum,
        justiceStage: ((((this.state || {}).village || {}).justice) || {}).stage || 0,
        lastHit: lhSnap,
      };
    } catch (e) { rec = { day: -1, kind: '?', who: '?', cause: '?', killerId: null, player: false, _snapErr: String(e && e.message || e).slice(0, 80) }; }
    const r = origRD ? origRD.call(this, opts) : undefined;
    // corpses.js double-death guard returns null when the villager already died:
    // no tele('death') fired, not a real death — do not log it.
    if (r !== null && rec) {
      if (log.length < 2000) log.push(rec);
    }
    return r;
  };

  // --- tbDamage wrapper: last-hitter attribution for turn-based combat deaths ---
  // Gameplay-identical: original runs first with identical args; the record is
  // written after the return value is computed; everything is try/caught.
  const origTD = Game.tbDamage;
  if (typeof origTD === 'function') {
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      const r = origTD.apply(this, arguments);
      try {
        if (SABOTAGE) Math.random(); // RED control only: prove the equality check bites
        if (r > 0) {
          const t = this.tbFighter ? this.tbFighter(targetKey) : null;
          const s = sourceKey && this.tbFighter ? this.tbFighter(sourceKey) : null;
          const tvid = t ? (t.villagerId || null) : null;
          if (tvid) {
            lastHitVid[tvid] = {
              sourceKey: sourceKey || null,
              sourceKind: s ? (s.kind || null) : null,
              sourceVid: s ? (s.villagerId || null) : null,
              label: sourceLabel != null ? String(sourceLabel).slice(0, 48) : null,
              // FIGHT SCOPING (intraviol 2026-10-14): a lastHit is only valid
              // inside the fight where it landed. Without this, a villager hit
              // by a monster on day 10 who starves on day 40 misattributes to
              // 'monster'. The registerDeath wrapper checks identity.
              fight: this.tbfight || null,
            };
          }
        }
      } catch (e) { /* observer must never throw */ }
      return r;
    };
  }

  // --- say wrapper: death-adjacent transcript for the SENSE-TESTING LAW ---
  const origSay = Game.say ? Game.say.bind(Game) : null;
  if (origSay) {
    Game.say = function (msg) {
      try {
        if (SABOTAGE) Math.random(); // RED control only: say fires constantly, so
        // this deterministically perturbs the RNG stream — proving the
        // byte-identical check can detect instrument RNG contamination.
        const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
        if (DEATH_LINE_RE.test(text) && sayLines.length < 600) {
          const d = ((this.state || {}).scholar || {}).day || 0;
          sayLines.push({ day: d, text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240) });
        }
      } catch (e) {}
      return origSay(msg);
    };
  }

  const api = { log, lastHitVid, sayLines };
  Game._intraviol = api;
  return api;
}

// ---------- refs (post-run, from the live Game) ----------
function buildRefs(Game) {
  const villagerIds = new Set();
  try {
    for (const v of ((Game.state || {}).village || {}).roster || []) villagerIds.add(v);
    for (const p of (Game.data || {}).villagers || []) if (p.id) villagerIds.add(p.id);
    for (const p of (Game.data || {}).background_survivors || []) if (p.id) villagerIds.add(p.id);
    for (const f of ((Game.state || {}).village || {}).fallen || []) if (f.villagerId) villagerIds.add(f.villagerId);
    if (Game._intraviol && Game._intraviol.initialRoster) {
      for (const v of Game._intraviol.initialRoster) villagerIds.add(v);
    }
  } catch (e) {}
  const monsterNames = new Map(); // lower name -> wave
  try {
    for (const m of (Game.data || {}).monsters || []) {
      if (m.name) monsterNames.set(String(m.name).toLowerCase(), m.wave || null);
      // monsterDisplayName returns mdef.unknown (the strange descriptor, e.g.
      // "Loud-Eyes") pre-System — expedition/field-fight death causes use the
      // display name, so descriptors must resolve as monsters too.
      if (m.unknown) monsterNames.set(String(m.unknown).toLowerCase(), m.wave || null);
    }
    // monsterDisplayName prefers the VILLAGE-AGREED name (codex villageName)
    // once the village names the beast through talk — death causes use the
    // display name, so villageNames must resolve as monsters too.
    for (const e of Object.values(((Game.state || {}).codex || {}).monsters || {})) {
      if (e && e.villageName) monsterNames.set(String(e.villageName).toLowerCase(), null);
    }
  } catch (e) {}
  let playerVessel = null;
  try { playerVessel = Game.villagerId || null; } catch (e) {}
  return { villagerIds, monsterNames, playerVessel };
}

// ---------- classifier ----------
const DEPRIVATION = new Set(['starvation', 'thirst']);
const SYSTEM_CAUSES = new Set(['aid-runner', 'contest', 'hunting', 'emergency hunt', 'experiment',
  'injuries', 'the wild', "a wound that wouldn't close", 'the wilds']);
const FRIENDLY_KINDS = new Set(['villager', 'hostile', 'ally']);

// fight-composition helpers (for the tb-combat killer inference)
function fightHasFoes(fight) {
  if (!fight || !fight.counts) return false;
  return Object.keys(fight.counts).some(k => k === 'monster' || k === 'monster:dead');
}
function fightHasHostiles(fight) {
  if (!fight || !fight.counts) return false;
  return Object.keys(fight.counts).some(k => k === 'hostile' || k === 'hostile:dead');
}

function classifyRecord(rec, refs) {
  if (process.env.INTRAVIOL_BROKEN_CLASSIFIER === '1') {
    return { victimKind: 'unknown', killerKind: 'unknown', context: 'unknown' }; // test RED hook
  }
  const cause = String(rec.cause || '?');
  const causeL = cause.toLowerCase();

  // victim
  let victimKind;
  if (rec.player) victimKind = 'player-vessel';
  else if (rec.kind === 'monster' || rec.kind === 'animal') victimKind = 'nonperson';
  else if (rec.villagerId && refs.villagerIds.has(rec.villagerId)) victimKind = 'villager';
  else if (rec.villagerId) victimKind = 'person-other';
  else victimKind = 'unnamed';

  // killer
  const kid = rec.killerId;
  let killerKind;
  let inferredKiller = false;
  if (kid == null) {
    const lh = rec.lastHit;
    if (lh && lh.sourceKind && FRIENDLY_KINDS.has(lh.sourceKind)) {
      killerKind = lh.sourceKind === 'villager' ? 'villager' : 'villager(' + lh.sourceKind + ')';
    } else if (lh && lh.sourceKind === 'monster') killerKind = 'monster';
    else if (lh && lh.sourceKind === 'player') killerKind = 'player-vessel';
    else if (refs.monsterNames.has(causeL)) killerKind = 'monster';
    else if (causeL === 'monster') killerKind = 'monster'; // hurtVillager source label, not a name
    else if (cause === 'raid' || cause === 'raid-defense') killerKind = 'rival-village';
    else if (cause === 'alien') killerKind = 'alien';
    else if (causeL === 'sickness') killerKind = 'none'; // disease, not violence
    else if (DEPRIVATION.has(causeL) || SYSTEM_CAUSES.has(causeL) || causeL.indexOf('phoenix link') >= 0) killerKind = 'none';
    else if (cause === 'combat' && rec.fight && fightHasFoes(rec.fight) && !fightHasHostiles(rec.fight)) {
      // INFERRED (marked): tb-combat death, no last-hitter captured, but the
      // fight snapshot shows monsters engaged and no hostile-villager fighters.
      // The killer is a monster by elimination — the player never kills
      // 'villager'-kind fighters (player kills register 'hostile'-kind).
      killerKind = 'monster'; inferredKiller = true;
    }
    else killerKind = 'unknown';
  } else if (refs.playerVessel && kid === refs.playerVessel) killerKind = 'player-vessel';
  else if (refs.villagerIds.has(kid)) killerKind = 'villager';
  else if (String(kid).indexOf('ap_') === 0) killerKind = 'alien';
  else killerKind = 'unknown';

  // trigger context
  let context;
  if (cause === 'ambush') context = 'betrayal-ambush';
  else if (rec.uprising) context = 'uprising';
  else if (rec.betrayal) context = 'betrayal-fight';
  else if (cause === 'raid') context = 'raid-offense';
  else if (cause === 'raid-defense') context = 'raid-defense';
  else if (causeL.indexOf('split-fight') === 0) context = 'party-split';
  else if (cause === 'aid-runner') context = 'aid-run';
  else if (cause === 'alien') context = 'alien-attack';
  else if (causeL === 'sickness') context = 'disease';
  else if (DEPRIVATION.has(causeL)) context = 'deprivation';
  else if (causeL.indexOf('phoenix link') >= 0) context = 'phoenix-link';
  else if (cause === 'contest') context = 'contest';
  else if (cause === 'hunting' || cause === 'emergency hunt') context = 'hunting';
  else if (cause === 'experiment') context = 'experiment';
  else if (SYSTEM_CAUSES.has(causeL)) context = 'injuries';
  else if (refs.monsterNames.has(causeL)) context = 'monster';
  else if (causeL === 'monster') context = 'monster'; // hurtVillager source label
  else if (cause === 'villager combat') context = 'villager-kill'; // villager killed a monster (field fight)
  else if (cause === 'expedition') context = 'expedition-kill'; // villager killed a monster (expedition)
  else if (cause === 'patrol combat') context = 'patrol-kill'; // villager killed a monster (patrol)
  else if (cause === 'the expedition') context = 'expedition'; // player-vessel died on expedition
  else if (cause === 'combat') context = rec.fight ? 'tb-combat' : 'combat-unattributed';
  else context = 'unknown';

  const out = { victimKind, killerKind, context };
  if (inferredKiller) out.inferredKiller = true;
  return out;
}

// villager-on-villager: victim is a roster villager, killer is a villager
function isVillagerOnVillager(c) {
  return c.victimKind === 'villager' &&
    (c.killerKind === 'villager' || c.killerKind.indexOf('villager(') === 0);
}

// ---------- sweep ----------
async function main() {
  const t0 = Date.now();
  const seeds = _seedF.length ? _seedF : DEFAULT_SEEDS;
  const pids = _polF.length ? _polF : Object.keys(POLICY_REGISTRY);
  const rows = [];
  for (const pid of pids) {
    const base = POLICY_REGISTRY[pid];
    if (!base) { console.error('unknown policy ' + pid); process.exit(2); }
    // the feast layer is opt-in per-policy (plentyb convention): only
    // leadfeast runs with it on
    if (pid === 'leadfeast') process.env.FEASTSCALE_R13 = '1';
    else delete process.env.FEASTSCALE_R13;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'intraviol-' + pid, fullTelemetry: true });
      await setupGame(Game);
      const iv = attachIntraviol(Game);
      try { iv.initialRoster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) {}
      const result = await runDays(Game, base, { days: DAYS, sampleEvery: 30 });
      const refs = buildRefs(Game);
      const deaths = iv.log.map(rec => Object.assign({}, rec, classifyRecord(rec, refs)));
      // wall numbers (cheap, same Game)
      let national = false, table = false, won = false, maxWaveUnlocked = 1;
      try { national = ['national', 'global'].includes(Game.scaleRank ? Game.scaleRank() : 'village'); } catch (e) {}
      try { table = !!(((Game.state || {}).table || {}).seat || ((Game.state || {}).table || {}).waiting); } catch (e) {}
      try { won = !!Game.won; } catch (e) {}
      try { maxWaveUnlocked = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      const vv = deaths.filter(d => isVillagerOnVillager(d));
      const row = {
        label: 'intraviol-20261014', policy: pid, seed,
        days: result.days, endReason: result.endReason,
        national, table, won, maxWaveUnlocked,
        deathTotal: deaths.length,
        villagerDeaths: deaths.filter(d => d.victimKind === 'villager').length,
        playerDeaths: deaths.filter(d => d.victimKind === 'player-vessel').length,
        vvDeaths: vv.length,
        deaths, sayLines: iv.sayLines,
      };
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `deaths=${row.deathTotal} villagerDeaths=${row.villagerDeaths} vv=${row.vvDeaths} ` +
        `national=${national} table=${table} won=${won} w${maxWaveUnlocked}`);
      for (const d of vv) {
        console.log(`      VV d${d.day} ${String(d.name).slice(0, 22)} <- ${String(d.killerId).slice(0, 18)} ` +
          `ctx=${d.context} cause=${String(d.cause).slice(0, 40)}`);
      }
    }
  }
  // aggregate
  const agg = { vvByContext: {}, vvByCause: {}, killerKinds: {}, victimKinds: {} };
  let vvTotal = 0, villagerDeathTotal = 0;
  for (const r of rows) for (const d of r.deaths) {
    agg.victimKinds[d.victimKind] = (agg.victimKinds[d.victimKind] || 0) + 1;
    agg.killerKinds[d.killerKind] = (agg.killerKinds[d.killerKind] || 0) + 1;
    if (d.victimKind === 'villager') villagerDeathTotal++;
    if (isVillagerOnVillager(d)) {
      vvTotal++;
      agg.vvByContext[d.context] = (agg.vvByContext[d.context] || 0) + 1;
      agg.vvByCause[d.cause] = (agg.vvByCause[d.cause] || 0) + 1;
    }
  }
  const rep = {
    label: 'intraviol-20261014', seeds, policies: pids, days: DAYS,
    sabotage: SABOTAGE,
    runs: rows.length,
    vvTotal, villagerDeathTotal,
    vvShareOfVillagerDeaths: villagerDeathTotal ? +(vvTotal / villagerDeathTotal).toFixed(3) : 0,
    agg, rows,
    ms: Date.now() - t0,
  };
  console.log('\n=== INTRAVIOL ===');
  console.log(`runs=${rep.runs} villagerDeaths=${villagerDeathTotal} vv=${vvTotal} ` +
    `vvShare=${rep.vvShareOfVillagerDeaths} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  console.log('victimKinds: ' + JSON.stringify(agg.victimKinds));
  console.log('killerKinds: ' + JSON.stringify(agg.killerKinds));
  console.log('vvByContext: ' + JSON.stringify(agg.vvByContext));
  console.log('vvByCause: ' + JSON.stringify(agg.vvByCause));
  const out = process.env.OUT || 'evidence/2026-10-14/sim-intraviol-20261014.json';
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(path.resolve(out), JSON.stringify(rep, null, 1));
  console.error('wrote ' + out);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachIntraviol, buildRefs, classifyRecord, isVillagerOnVillager };
