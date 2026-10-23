#!/usr/bin/env node
// mantlechain-instr-20261022.js — DIAG instrument for arm sim-mantlechain
// (run fleshout-20261022T2125Z, axis scale-onramp). ZERO src/js, zero game
// change: wraps Game.mantleBecome (succession events) and Game.tele
// (wave-4 combat_start rows + death rows with live-fight wave context) and
// captures say-windows for the sense pass. RNG-neutral: no Math.random
// draws added, read-only recording.
//
// THE QUESTION (sim-vetwindow DIAG finding, evidence/2026-10-22/diag-vetwindow.json):
// "the mantle-promotion chain is a veteran-death accelerant: the mantle passes
// to trusted veteran villagers (Saleh→Shuting→Sanne; Ethan→Mia; Mai→Nadia→Saleh
// across 3/4 DIAG runs), then the new scholar leads the next wave-4 party and
// dies in it. Veterans don't just die as fighters — the succession system
// concentrates risk on them."
//
// Succession model (code-grounded, ledger.js playerDeath + villager-build.js
// mantleBecome): on scholar death the mantle passes to the highest-trust living
// villager (trust decides — candidates.sort((a,b)=>(trust[b]||0)-(trust[a]||0))).
// The instrument records, per succession: day, old→new, the successor's trust,
// occupation, and veteran status (wave-4+ kills in waveKillLog), then follows
// the successor: wave-4 party leadership and death.
//
// Attribution (analyzer: scripts/mantlechain-analyze-20261022.js):
//   IN-SCOPE  = a villager with ≥1 wave-4+ waveKillLog kill (day ≤ death day,
//               the standing.js readiness "VETERANS" bar's own definition) who
//               died in a wave-4 fight.
//   chain-accelerated = in-scope AND died as the mantle-holder (player death)
//               AND the mantle was acquired ≤30 days before the death.
//   baseline-fighter  = in-scope AND NOT chain-accelerated (died as a plain
//               fighter/companion, or held the mantle longer than 30 days).
// The buckets are exhaustive by construction (0 unattributed is a plumbing
// check, not a modeling choice).
//
// Death→wave-4-fight linkage (recorded at tele time, before anything mutates):
//   basis 'live-tbfight': a live non-over TB fight with monster fighters —
//      wave from data.monsters.
//   basis 'same-day': no live fight but a wave-4+ combat_start the same day
//      (fights resolve same-day in sims). GATED to combat causes only —
//      cause 'combat', 'split-fight:*', 'raid*', or a monster name — so a
//      same-day starvation death is never mis-scored as a wave-4 death.
//
// Usage (the vetwindow-DIAG substrate, where the chain was observed):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 node scripts/mantlechain-instr-20261022.js
//
// Writes: evidence/2026-10-22/perseed-mantlechain/mantlechain-s<seed>-<base>.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

function assertSubstrateEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
    if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 required.`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('DIAG STOP: SEATDRIVE=0 required.'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'VETWINDOW']) {
    if (k in process.env) { console.error(`DIAG STOP: ${k} must be unset (pinned substrate).`); process.exit(2); }
  }
}
if (require.main === module) assertSubstrateEnv();

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const SEEDS = [65471, 65472, 65473, 65474, 65475, 65476, 65477, 65478];
const BASES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-mantlechain');
fs.mkdirSync(OUTDIR, { recursive: true });

function nameOf(Game, vid) {
  try {
    const def = ((Game.data || {}).villagers || []).find(x => x && x.id === vid);
    if (def && def.name) return String(def.name).split(' ')[0];
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

function combatCause(cause, Game) {
  // Which death causes count as "died in a fight" for the same-day fallback.
  const c = String(cause || '');
  if (c === 'combat' || c.indexOf('split-fight') === 0 || c.indexOf('raid') === 0) return true;
  try {
    if ((Game.data.monsters || []).some(m => m.name === c)) return true;
  } catch (e) {}
  return false;
}

function installMantlechain(Game) {
  const T = { successions: [], fights: [], deaths: [], sayAll: [], instrumentErrors: [] };
  const day = () => ((Game.state || {}).scholar || {}).day | 0;

  // 1. Succession events — outermost wrap on the load-time chain
  //    (godverbs/titans wrap underneath; behavior untouched).
  const omb = typeof Game.mantleBecome === 'function' ? Game.mantleBecome.bind(Game) : null;
  Game.mantleBecome = function (oldId, newId) {
    let r;
    try { r = omb ? omb.apply(this, arguments) : undefined; }
    catch (e) { T.instrumentErrors.push('mantleBecome-fwd:' + String(e && e.message || e)); throw e; }
    try {
      const v = Game.state.village || {};
      const trust = ((v.trust || {})[newId]) || 0;
      const ch = ((Game.data || {}).villagers || []).find(x => x && x.id === newId) || {};
      let w4k = 0, anyK = 0;
      try {
        for (const e of (Game.state.waveKillLog || [])) {
          if (!e || e.by !== newId) continue;
          anyK++;
          if ((e.w | 0) >= 4) w4k++;
        }
      } catch (e) {}
      T.successions.push({
        day: day(), oldId, oldName: nameOf(Game, oldId), newId, newName: nameOf(Game, newId),
        trust: trust | 0, occupationId: ch.occupationId || null,
        wave4plusKills: w4k, anyWaveKills: anyK, veteran: w4k > 0,
      });
    } catch (e) { T.instrumentErrors.push('succ-row:' + String(e && e.message || e)); }
    return r;
  };

  // 2. Tele rows — wave-4 combat starts + deaths with live-fight context.
  //    NOTE: sim-harness runDays wraps Game.tele on top of this for its own
  //    live-death capture; both fire, restore order is safe.
  const otele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    let r;
    try { r = otele.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      if (type === 'combat_start' && data && (data.wave | 0) >= 4) {
        const party = [];
        try {
          for (const f of (((Game.tbfight || {}).fighters) || [])) {
            if (f && f.kind === 'villager' && f.villagerId) party.push(f.villagerId);
          }
        } catch (e) {}
        T.fights.push({ day: day(), mid: data.vs || null, wave: data.wave | 0,
          scholar: Game.villagerId || null, party });
      }
      if (type === 'death') {
        let wave = null, mid = null, basis = 'none', scholarIn = false;
        try {
          const tf = Game.tbfight;
          if (tf && !tf.over && Array.isArray(tf.fighters)) {
            for (const f of tf.fighters) {
              if (f && f.kind === 'monster' && f.monsterId && !f.fled) mid = f.monsterId;
              if (f && f.kind === 'player') scholarIn = true;
            }
            if (mid) {
              const md = ((Game.data || {}).monsters || []).find(m => m.id === mid);
              wave = (md && md.wave | 0) || null;
              if (wave) basis = 'live-tbfight';
            }
          }
        } catch (e) {}
        if (!wave && data && combatCause(data.cause, Game)) {
          // same-day fallback (fights resolve same-day in sims; combat-cause gated).
          try {
            const d = day();
            for (let i = T.fights.length - 1; i >= 0; i--) {
              if (T.fights[i].day === d) {
                wave = T.fights[i].wave; mid = T.fights[i].mid; basis = 'same-day'; break;
              }
            }
          } catch (e) {}
        }
        const drow = {
          day: day(), who: data && data.who, whoName: nameOf(Game, data && data.who),
          kind: data && data.kind, cause: data && data.cause,
          fightWave: wave, fightMid: mid, fightBasis: basis, scholarInFight: scholarIn,
        };
        // TELEFLAG race (corpses.js registerDeath / harness live-capture):
        // a villager-death path can fire the death tele before playerDeath
        // does, and playerDeath's registerDeath call then REPAIRS player:true
        // on the already-fired record. Read player LAZILY off the live tele
        // record (the repair mutates this same object) — an eager read would
        // undercount scholar deaths.
        try {
          const tel = (Game.state && Game.state.telemetry) || [];
          const rec = tel.length ? tel[tel.length - 1] : null;
          if (rec && rec.type === 'death' && String(rec.who) === String(data && data.who)) {
            Object.defineProperty(drow, 'player', { enumerable: true, configurable: true,
              get: function () { return !!rec.player; } });
          } else {
            drow.player = !!(data && data.player);
          }
        } catch (e) { drow.player = !!(data && data.player); }
        T.deaths.push(drow);
      }
    } catch (e) { T.instrumentErrors.push('tele-row:' + String(e && e.message || e)); }
    return r;
  };

  // 3. Say-capture for the sense pass (windows extracted at the end).
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try { T.sayAll.push({ day: day(), text: String(x).replace(/\s+/g, ' ').slice(0, 600) }); } catch (e) {}
    return osay.apply(this, arguments);
  };

  return {
    T,
    uninstall() {
      try { if (omb) Game.mantleBecome = omb; } catch (e) {}
      try { Game.tele = otele; } catch (e) {}
      try { Game.say = osay; } catch (e) {}
    },
  };
}

function senseWindows(T) {
  // Sense material: say lines around succession events (±2d) and in-scope
  // deaths (±1d), filtered to succession/fight/death content, bounded.
  const rx = /mantle|codex|scholar|succession|not her|picked up|keep writing|killed|slain|died|death|dead|strike|fight|party|wave|veteran|wound/i;
  const out = [];
  const push = (label, lo, hi) => {
    const win = T.sayAll.filter(l => l.day >= lo && l.day <= hi && rx.test(l.text));
    if (win.length) out.push({ label, lo, hi, lines: win.slice(0, 120).map(l => `[d${l.day}] ${l.text}`) });
  };
  for (const s of T.successions) push(`SUCCESSION d${s.day}: ${s.oldName} → ${s.newName} (trust ${s.trust}, ${s.veteran ? 'VETERAN' : 'not-veteran'})`, s.day - 2, s.day + 2);
  for (const d of T.deaths) { if (d.fightWave >= 4) push(`DEATH d${d.day}: ${d.whoName} (${d.cause}, ${d.fightBasis})`, d.day - 1, d.day + 1); }
  return out;
}

async function oneConfig(seed, base) {
  const { Game } = await loadGame({ seed, mode: 'mantlechain-diag', fullTelemetry: false });
  const inst = installMantlechain(Game);
  const policy = AD.armedFor(base);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  inst.uninstall();

  const waveKillLog = [];
  try {
    for (const e of (Game.state.waveKillLog || [])) {
      if (!e) continue;
      waveKillLog.push({ d: e.d | 0, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), w: e.w | 0, via: e.via || null });
    }
  } catch (e) {}
  let scaleRank = null, standing = null, maxWave = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { standing = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : null; } catch (e) {}
  try { maxWave = Game.unlockedWave ? (Game.unlockedWave() | 0) : null; } catch (e) {}

  const row = {
    run: 'sim-mantlechain', axis: 'scale-onramp', at: new Date().toISOString(),
    instrument: 'mantlechain (succession events + wave-4 combat_start rows + death rows with live-fight wave context)',
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1',
    seed, base, policy: policy.id,
    endReason: result.endReason, days: result.days,
    scaleRank, standing, maxWave, won: !!Game.won,
    successions: inst.T.successions,
    fights: inst.T.fights,
    deaths: inst.T.deaths,
    waveKillLog,
    senseWindows: senseWindows(inst.T),
    sayLinesTotal: inst.T.sayAll.length,
    instrumentErrors: inst.T.instrumentErrors,
  };
  const fp = path.join(OUTDIR, `mantlechain-s${seed}-${base}.json`);
  fs.writeFileSync(fp, JSON.stringify(row, null, 1) + '\n');
  return row;
}

async function main() {
  let nSucc = 0, nD = 0;
  for (const base of BASES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      console.log(`##### mantlechain seed=${seed} base=${base}`);
      const r = await oneConfig(seed, base);
      nSucc += r.successions.length; nD += r.deaths.length;
      if (r.instrumentErrors.length) {
        console.error('DIAG STOP: instrument errors:', JSON.stringify(r.instrumentErrors.slice(0, 5)));
        process.exit(3);
      }
      console.log(`  days=${r.days} end=${r.endReason} scale=${r.scaleRank} won=${r.won} w4fights=${r.fights.length} succ=${r.successions.length} deaths=${r.deaths.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
    }
  }
  console.log(`\nDONE: 16 configs, ${nSucc} successions, ${nD} deaths. Per-seed JSONs in ${OUTDIR}`);
}

if (require.main === module) {
  main().catch(e => { console.error('DIAG CRASH:', e && e.stack || e); process.exit(1); });
}
module.exports = { installMantlechain, combatCause, nameOf, SEEDS, BASES, DAYS, OUTDIR };
