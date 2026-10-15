#!/usr/bin/env node
// scripts/sweep-raidassess-20261015.js — RAID-PACK ASSESSMENT PILOT
// (sim-raidassess, 2026-10-15, scale-onramp axis, sim-findings #344).
//
// The modal bearer <redacted> on national-holding runs is w1 x haven x
// turn-based (bearercombat: 20/89) — a raider (modal: Highbeam Deer) reaches
// the sleeping scholar through the raid's pendingEncounter and the base
// policy STANDS THE WALL (on this substrate the base never barrier-pushes).
// Force is falsified (besiegeanswer: 27 answers bought 19 feeds). The honest
// lever space is AVOIDANCE: no deliberate engagement of a lost raid fight.
// The layer (scripts/policies/raidassess.js, gate RAIDASSESS=1, default OFF,
// zero src/js) assesses the DPR race at fight start during a raid-raised aid
// crisis at haven and disengages (walk to edge, tbBarrierExit, dawn return)
// on a lost race; parity/won -> existing behavior. Alien-player ("Stranger")
// duels get the pessimistic prior.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — BINDING, written BEFORE sims):
//   PRIMARY (binding): w1 x haven x turn-based bearer <redacted> per run
//     (bearer deaths with ctx.fightType='turn-based', tileClass='haven',
//     killerClass='w1'), summed over the 16 runs/side.
//     GO: armed_total <= control_total x 0.60.
//   Degeneracy rule: control_total == 0 -> INSUFFICIENT-EVIDENCE (no GO on a
//     degenerate metric).
//   Exercise gate: armed-side raAssessed >= 4 across the sweep, else
//     INSUFFICIENT-EVIDENCE (the layer never met the threat it was built for).
//   GUARDRAILS (all binding):
//     - median survival days >= control_median - 10
//     - national reach >= control_count - 2 (of 16)
//     - no new death mode: player:cause key in armed absent from control
//       counts only at n>=3
//     - villager (non-scholar) combat deaths <= control + 2
//     - anti-tile-shifting: total bearer combat-family deaths (all tiles,
//       BC.censusDeaths denominator) <= control + 2 — the lever must SAVE
//       bearers, not relocate their deaths to wild tiles.
//   Horizon: 180d death-aware (dead villages stop, <=10d tail). Why: the raid
//     pathology is a national-hold phenomenon; national reaches ~day 60-90.
//   Seeds: 11/22/33/44/55/66/77/88 x {leadfeast, belongfeast} = 16 runs/side.
//     PILOT: these 16/side ARE the pilot; confirm (12-16 seeds) only on GO.
//   Policies: control = raw leadfeast/belongfeast (the bearercombat substrate,
//     unlayered); armed = + raidassess (RAIDASSESS=1). Identical seeds.
//     Own control in the same sweep (baseline drift #247 — never inherit).
//   FEASTSCALE_R13=1 asserted up front in proof AND sweep (the #312 lesson).
// Metric binding (§14): a miss is NO-GO, never re-scored mid-run. Metric
// doubts go under "metric review" in the evidence file and apply to the NEXT
// run.
//
// Modes:
//   SMOKE=1      15d x {leadfeast, belongfeast} x {control, armed}: runs, no
//                crash, layer counters present on the armed side.
//   DETGATE=1    D1 gate determinism (60d x2); D2 instrument ON vs OFF;
//                D3 wrapper-gate-OFF vs raw base byte-identical (gate-off
//                delegation proof in-sim).
//   AA=1         one seed per side x2 (A/A determinism, both sides).
//   default      the 16-run/side pilot -> evidence/2026-10-15/perseed-raidassess/,
//                evidence/2026-10-15/sim-raidassess-runs.json,
//                evidence/2026-10-15/telemetry-raidassess/.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-raidassess-20261015.js            (control)
//      FEASTSCALE_R13=1 RAIDASSESS=1 node scripts/sweep-raidassess-20261015.js (armed)
//      SMOKE=1 FEASTSCALE_R13=1 RAIDASSESS=1 node scripts/sweep-raidassess-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-raidassess-20261015.js
//      AA=1 FEASTSCALE_R13=1 RAIDASSESS=1 node scripts/sweep-raidassess-20261015.js
//      SEEDS=11,22 POLICIES=leadfeast DAYS=30 OUT=/tmp/x.json \
//        PERSEED_DIR=/tmp/px TELE_DIR=/tmp/tx FEASTSCALE_R13=1 RAIDASSESS=1 node scripts/sweep-raidassess-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const TW = require('./tworung-lib-20261015');
const RB = require('./readinessbind-lib');
const HL = require('./holdloss-lib-20261015');
const SC = require('./succhain-lib-20261015');
const BC = require('./bearercombat-lib-20261015');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('RAIDASSESS FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

const { leadfeast, belongfeast } = require('./policies/feastscale');
const WP = require('./policies/winpursuit');
const POLICY_REGISTRY = {
  leadfeast, belongfeast,
  'leadfeast-winpursuit': WP.leadpursuit,
};
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`RAIDASSESS FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}
if ((process.env.POLICIES || '').indexOf('winpursuit') !== -1 && process.env.WINPURSUIT !== '1') {
  console.error('RAIDASSESS FATAL: POLICIES selects winpursuit but WINPURSUIT!=1 (the layer would be gate-off — a silent no-op).');
  process.exit(2);
}


const ARMED = process.env.RAIDASSESS === '1';
// Graceful degradation (kill-protocol): if the layer was deleted per the kill
// protocol, armed mode fails LOUDLY instead of measuring the wrong thing;
// control mode is unaffected.
let RA = null;
try { RA = require('./policies/raidassess'); }
catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  if (ARMED) {
    console.error('FATAL: RAIDASSESS=1 requested but scripts/policies/raidassess.js is absent (killed arm). Refusing to measure the baseline as armed.');
    process.exit(2);
  }
  console.error('info: raidassess layer absent — control mode only.');
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|snap|raid|treeline|arena|contest|won\b/i;
const WIN_BEAT_RE = /say it plainly: you won/i;

function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 3000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
}

// ---------------------------------------------------------------------------
// Combat-session instrumentation (ALL hooks are read-only — they observe and
// stash into t, never write game state).
// ---------------------------------------------------------------------------

// opponentsOf(fighters): the non-player, non-villager fighters (monsters +
// alien-player hostiles), with mdef wave/name resolved.
function opponentsOf(fighters) {
  const out = [];
  for (const x of (fighters || [])) {
    if (!x) continue;
    if (x.kind === 'player' || x.kind === 'villager') continue;
    const md = x.mdef || {};
    out.push({
      id: md.id || x.monsterId || x.id || '?',
      name: md.name || x.name || '?',
      wave: md.wave != null ? md.wave : null,
      veteran: !!(x.veteran || x.veteranVariant),
      alien: !!(x.alienPid || x.kind === 'alien'),
    });
  }
  return out;
}

function tileClassNow(Game) {
  try {
    const st = Game.state || {};
    if (st.activeContest || st.arenaContest) return 'arena-contest';
    if (typeof Game.playerAtHaven === 'function' && Game.playerAtHaven()) return 'haven';
    return 'wild';
  } catch (e) { return 'unknown'; }
}

function hookFights(Game, t) {
  t.tbSessions = [];
  t.liveTB = null;
  t.lastTB = null;

  const origStart = Game.startCombat ? Game.startCombat.bind(Game) : null;
  if (origStart) {
    Game.startCombat = function (mid) {
      // pre-fight snapshot (read-only): entry HP + armor P at fight start.
      let pre = null;
      try {
        pre = {
          hp: (Game.state.scholar || {}).health,
          maxHp: (typeof Game.maxHealth === 'function') ? Game.maxHealth() : null,
          armorP: (typeof Game.armorBonus === 'function') ? Game.armorBonus() : null,
          tile: tileClassNow(Game),
          day: gday(Game),
        };
      } catch (e) {}
      const r = origStart(mid);
      try {
        const f = Game.tbfight;
        if (f && !f.over && t.liveTB == null) {
          const mons = opponentsOf(f.fighters);
          const ses = {
            seq: t.tbSessions.length, day: pre ? pre.day : 0,
            entryHp: pre ? pre.hp : null, entryMaxHp: pre ? pre.maxHp : null,
            entryArmorP: pre ? pre.armorP : null, tileAtStart: pre ? pre.tile : null,
            monsters: mons, hitsTaken: 0, dmgTaken: 0, result: null,
            veteran: mons.some(m => m.veteran),
            counterKnown: null,
          };
          try {
            ses.counterKnown = (mons.length && typeof Game.monsterCounterKnown === 'function')
              ? !!Game.monsterCounterKnown(mons[0].id) : null;
          } catch (e) { ses.counterKnown = null; }
          t.tbSessions.push(ses);
          t.liveTB = ses;
        }
      } catch (e) {}
      return r;
    };
  }

  // tbDamage returns the ACTUAL damage applied (HONESTY, break-it 2026-10-09).
  const origDmg = Game.tbDamage ? Game.tbDamage.bind(Game) : null;
  if (origDmg) {
    Game.tbDamage = function (targetKey, dmg, src, skey, opts) {
      const r = origDmg(targetKey, dmg, src, skey, opts);
      try {
        if (t.liveTB && (targetKey === 'p' || targetKey === 'player') && r > 0) {
          t.liveTB.hitsTaken++;
          t.liveTB.dmgTaken += r;
        }
      } catch (e) {}
      return r;
    };
  }

  const origEnd = Game.tbEnd ? Game.tbEnd.bind(Game) : null;
  if (origEnd) {
    Game.tbEnd = function (result) {
      const r = origEnd(result);
      // NOTE: playerDeath('combat') fires INSIDE tbEnd('lost') via the
      // registerDeath path below, i.e. BEFORE this close — so a TB death
      // still sees t.liveTB as the open session.
      try { if (t.liveTB) { t.liveTB.result = result; t.lastTB = t.liveTB; t.liveTB = null; } } catch (e) {}
      return r;
    };
  }
}

// hookHunt: the hunt death sites name the animal in the cause
// ('the ' + animal.name). Stash the last one so the death hook can key on it
// exactly instead of guessing from the cause string.
function hookHunt(Game, t) {
  t.lastHunt = null;
  const orig = Game.encScholarDeathGate ? Game.encScholarDeathGate.bind(Game) : null;
  if (orig) {
    Game.encScholarDeathGate = function (cause) {
      try { t.lastHunt = { cause: String(cause || ''), day: gday(Game) }; } catch (e) {}
      return orig(cause);
    };
  }
}

// hookPlayerDeath: playerDeath strips the gear pack BEFORE registerDeath runs,
// so armor P at death is unreadable by then. Capture it read-only here.
function hookPlayerDeath(Game, t) {
  t.lastPlayerDeath = null;
  const orig = Game.playerDeath ? Game.playerDeath.bind(Game) : null;
  if (orig) {
    Game.playerDeath = function (cause) {
      try {
        t.lastPlayerDeath = {
          cause: String(cause || ''),
          armorP: (typeof Game.armorBonus === 'function') ? Game.armorBonus() : null,
          hp: (Game.state.scholar || {}).health,
        };
      } catch (e) {}
      return orig(cause);
    };
  }
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 500) {
          const cause = String(o.cause || '?');
          const st = Game.state || {};
          const inContest = !!(st.activeContest || st.arenaContest);
          const tile = tileClassNow(Game);

          // fight type: contest first (an arena TB death carries cause
          // 'combat' but the contest state is the truth).
          let fightType = 'unknown';
          if (cause === 'contest' || cause === 'the arena') fightType = 'contest';
          else if (inContest) fightType = 'contest';
          else if (cause === 'the expedition') fightType = 'expedition';
          else if (t.lastHunt && t.lastHunt.cause === cause) fightType = 'hunt';
          else if (cause === 'injuries') fightType = 'field-damage';
          else if (t.liveTB) fightType = 'turn-based';

          // killer: the open TB session (still open at death time) is the
          // authority; the raw tbfight is the fallback.
          let ses = null, mons = [];
          if (t.liveTB) { ses = t.liveTB; mons = ses.monsters || []; }
          else if (Game.tbfight) { mons = opponentsOf(Game.tbfight.fighters); }

          const killerWave = mons.length && mons[0].wave != null ? mons[0].wave : null;
          const killerName = mons.length ? mons[0].name : null;
          let killerClass = 'unknown';
          if (killerWave != null) killerClass = 'w' + killerWave;
          else if (fightType === 'contest') killerClass = 'contest-opponent';
          else if (fightType === 'hunt') killerClass = 'prey';
          else if (fightType === 'expedition') killerClass = 'expedition';

          let contestTrail = null;
          if (inContest || fightType === 'contest') {
            try {
              const ac = st.activeContest || st.arenaContest || {};
              contestTrail = JSON.stringify({
                challengeId: ac.challengeId || ac.id || null,
                kind: ac.kind || null,
                monsterId: ac.monsterId || null,
              }).slice(0, 200);
            } catch (e) {}
          }

          const pd = t.lastPlayerDeath;
          const ctx = {
            fightType, tileClass: tile,
            killerWave, killerClass, killerName,
            nOpponents: mons.length,
            opponentWaves: mons.map(m => m.wave),
            armorPAtDeath: (!!o.player && pd) ? pd.armorP : null,
            session: ses ? {
              seq: ses.seq, day: ses.day, tileAtStart: ses.tileAtStart,
              entryHp: ses.entryHp, entryMaxHp: ses.entryMaxHp,
              entryArmorP: ses.entryArmorP, counterKnown: ses.counterKnown,
              hitsTaken: ses.hitsTaken, dmgTaken: ses.dmgTaken,
              result: ses.result, veteran: ses.veteran,
              monsters: ses.monsters,
            } : null,
            trail: contestTrail || (fightType === 'unknown' ? ('cause=' + cause.slice(0, 60)) : null),
          };
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: cause.slice(0, 80),
            player: !!o.player,   // the r17 deathattr bearer-death flag
            ctx,
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, pid, days, opts) {
  opts = opts || {};
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  // DETGATE D3 (opts.wrapOnly): apply the WRAPPER with the env gate OFF —
  // must be byte-identical to the raw base (gate-off delegation proof).
  const wrap = ARMED || opts.wrapOnly === true;
  const layered = (wrap && RA) ? RA.withRaidAssess(Object.assign({}, base)) : Object.assign({}, base);
  const { Game } = await loadGame({ seed, mode: 'raidassess-' + pid + (wrap ? '-armed' : '') });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  if (opts.instrument !== false) {
    attachBeats(Game, t);
    hookFights(Game, t);
    hookHunt(Game, t);
    hookPlayerDeath(Game, t);
    attachDeaths(Game, t);
  }
  const hashes = [];
  const scaleRows = [];
  const foodRows = [];
  const standingRows = [];
  const waveUnlockDays = { 4: null, 5: null };
  let lastWave = 1;
  let nSamples = 0;

  const policy = Object.assign({}, layered);
  const origDaily = layered.daily;
  policy.daily = (G, ctx) => {
    try { t.ctx = ctx; } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      hashes.push(RB.trajectoryHash(G));
      const fr = fc.dailyRow(G); foodRows.push(fr);
      const srw = sr.scaleRow(G); scaleRows.push(srw);
      const st = TW.standingSample(G);
      standingRows.push({ day: st.day, unlockedWave: st.unlockedWave, rank: st.rank, gated: st.gated, tableSeat: st.tableSeat });
      if (st.unlockedWave > lastWave) {
        for (let w = lastWave + 1; w <= st.unlockedWave; w++) {
          if (w === 4 || w === 5) waveUnlockDays[w] = st.day;
        }
        lastWave = st.unlockedWave;
      }
      nSamples++;
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 1 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}

  const rec = {
    seed, policy: pid, days: daysRan, endReason: result.endReason,
    scaleRows, foodRows, standingRows, waveUnlockDays,
    deaths: t.deaths || [], beats: t.beats || [],
    tbSessions: t.tbSessions || [],
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
  };
  // WIN BEAT (the succhain lesson): endReason regexes lie about the table —
  // the engine's win beat is the authority.
  const won = (t.beats || []).some(b => WIN_BEAT_RE.test(String(b.text || '')));
  const chains = SC.attributeChains(rec);
  const loss = HL.nationalLoss(rec);
  loss.waveUnlockDays = waveUnlockDays;

  const national = !!chains.window;
  const cen = national ? BC.census(rec) : null;

  // PRIMARY (pre-registered): w1 x haven x turn-based bearer deaths in the run.
  const w1havenTB = rec.deaths.filter(d =>
    SC.isBearerDeath(d) && d.ctx &&
    d.ctx.fightType === 'turn-based' && d.ctx.tileClass === 'haven' &&
    d.ctx.killerClass === 'w1').length;
  // Anti-tile-shifting guardrail: ALL bearer combat-family deaths in the run
  // (BC.censusDeaths denominator — combat|monster family + hunt blind spot).
  const nBearerCombat = BC.censusDeaths(rec).length;
  // Villager (non-scholar) combat deaths: the #246 roster-level wall.
  const nVillagerCombat = rec.deaths.filter(d => {
    if (d.player) return false;
    try { const f = HL.classifyDeathFamily(d.cause); return f.family === 'combat' || f.family === 'monster'; }
    catch (e) { return false; }
  }).length;
  // Layer telemetry (the layer's own ctx counters; null on the control side).
  const lc = (t.ctx) || {};
  const raTele = {
    raAssessed: lc.raAssessed || 0, raDeclined: lc.raDeclined || 0,
    raFought: lc.raFought || 0, raDisengaged: lc.raDisengaged || 0,
    raPushes: lc.raPushes || 0, raPushBlocked: lc.raPushBlocked || 0,
    raNoExit: lc.raNoExit || 0, raReturned: lc.raReturned || 0,
    raAlienAssessed: lc.raAlienAssessed || 0, raAlienDeclined: lc.raAlienDeclined || 0,
    raFirstDetail: lc.raFirstDetail || null,
  };
  const row = {
    seed, policy: pid, armed: ARMED ? 1 : 0, days: daysRan, endReason: result.endReason, trajHash, nSamples,
    national, natFirstDay: chains.window ? chains.window.firstDay : null,
    nChains: chains.nChains,
    nBearerDeaths: rec.deaths.filter(d => SC.isBearerDeath(d)).length,
    nW1HavenTB: w1havenTB,
    nBearerCombat,
    nVillagerCombat,
    nCensusDeaths: cen ? cen.nDeaths : 0,
    attribShare: cen ? cen.attribShare : null,
    topKillerClass: cen ? cen.topKillerClass : null,
    lossMode: loss.reached ? loss.lossMode : 'n/a',
    won: !!won, table: tableSeat !== 'none', tableSeat, maxWave,
    survivalDays: daysRan, exiled: rec.exiledEver,
    nTBsessions: (t.tbSessions || []).length,
    ra: raTele,
  };
  return { row, rec, chains, loss, census: cen };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  const c1 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  const c2 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  chk('D1 gate determinism (11/leadfeast/60d x2, instrument OFF)', c1.row.trajHash, c2.row.trajHash);
  const i1 = await oneRun(33, 'belongfeast', 60, { instrument: true });
  const i2 = await oneRun(33, 'belongfeast', 60, { instrument: false });
  chk('D2 instrument ON vs OFF byte-identical (33/belongfeast/60d)', i1.row.trajHash, i2.row.trajHash);
  const w1 = await oneRun(44, 'leadfeast', 60, { instrument: false, wrapOnly: true });
  const w2 = await oneRun(44, 'leadfeast', 60, { instrument: false });
  chk('D3 wrapper-gate-OFF vs raw base byte-identical (44/leadfeast/60d)', w1.row.trajHash, w2.row.trajHash);
  if (w1.row.ra.raAssessed !== 0 || w2.row.ra.raAssessed !== 0) {
    fail++; console.log('  FAIL D3 layer counters must be zero on both gate-off sides');
  } else console.log('  PASS D3 layer counters zero on both gate-off sides');
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log(`SMOKE: 15d x {leadfeast, belongfeast} (${ARMED ? 'ARMED' : 'control'})`);
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    const { row, rec } = await oneRun(11, pid, 15);
    // the r17 deathattr wiring check: the player flag FIELD must be present
    // on every death record (a death in 15d is luck, not a gate).
    const flagWired = rec.deaths.every(d => typeof d.player === 'boolean');
    const bearerNoFlag = rec.deaths.filter(d => SC.isBearerDeath(d) && d.player !== true);
    const ok = row.nSamples >= 10 && row.days === 15 && rec.scaleRows.length >= 10 && rec.foodRows.length >= 10 &&
      flagWired && bearerNoFlag.length === 0;
    const raKeys = ['raAssessed', 'raDeclined', 'raFought', 'raDisengaged'];
    const raWired = raKeys.every(k => typeof row.ra[k] === 'number');
    const raOk = !ARMED || raWired;
    if (!raWired) { fail++; console.log(`  FAIL ${pid} — layer telemetry missing ra keys`); }
    if (ok && raOk) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, beats=${rec.beats.length}, deaths=${rec.deaths.length} (player-flag wired, tbSessions=${row.nTBsessions}, ra=${JSON.stringify(row.ra)})`);
    else if (ok) { fail++; console.log(`  FAIL ${pid} — ra telemetry not wired on armed side`); }
    else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} scaleRows=${rec.scaleRows.length} foodRows=${rec.foodRows.length} flagWired=${flagWired} bearerNoFlag=${bearerNoFlag.length}`); }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function aa() {
  console.log(`AA: A/A determinism, both sides (${ARMED ? 'ARMED' : 'control'})`);
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    const a1 = await oneRun(44, pid, 60, { instrument: false });
    const a2 = await oneRun(44, pid, 60, { instrument: false });
    if (a1.row.trajHash === a2.row.trajHash) console.log(`  PASS ${pid} 44/60d x2 identical`);
    else { fail++; console.log(`  FAIL ${pid} 44/60d hashes differ`); }
  }
  if (fail) { console.error('AA FAILED'); process.exit(1); }
  console.log('AA GREEN');
}

function summarize(rows) {
  const sum = (f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
  const med = (xs) => { const a = xs.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
  const raSum = (k) => sum(r => (r.ra || {})[k]);
  // new death-mode check: player:cause keys present in armed, absent in control
  return {
    n: rows.length,
    national: sum(r => r.national ? 1 : 0),
    table: sum(r => r.table ? 1 : 0),
    wins: sum(r => r.won ? 1 : 0),
    wave4: sum(r => r.maxWave >= 4 ? 1 : 0),
    wave5: sum(r => r.maxWave >= 5 ? 1 : 0),
    medianSurv: med(rows.map(r => r.days)),
    maxSurv: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    exiled: sum(r => r.exiled ? 1 : 0),
    nW1HavenTB: sum(r => r.nW1HavenTB),
    nBearerCombat: sum(r => r.nBearerCombat),
    nVillagerCombat: sum(r => r.nVillagerCombat),
    raAssessed: raSum('raAssessed'), raDeclined: raSum('raDeclined'),
    raFought: raSum('raFought'), raDisengaged: raSum('raDisengaged'),
    raPushes: raSum('raPushes'), raPushBlocked: raSum('raPushBlocked'),
    raReturned: raSum('raReturned'), raNoExit: raSum('raNoExit'),
    raAlienAssessed: raSum('raAlienAssessed'), raAlienDeclined: raSum('raAlienDeclined'),
    deathModes: (() => {
      const m = {};
      for (const r of rows) for (const d of (r._deathModes || [])) m[d] = (m[d] || 0) + 1;
      return m;
    })(),
  };
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const side = ARMED ? 'armed' : 'control';
  const out = process.env.OUT || `evidence/2026-10-15/sim-raidassess-${side}.json`;
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-raidassess';
  const teleDir = process.env.TELE_DIR || 'evidence/2026-10-15/telemetry-raidassess';
  fs.mkdirSync(perseedDir, { recursive: true });
  fs.mkdirSync(teleDir, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      console.log(`-- ${pid} seed ${seed} [${side}]`);
      const { row, rec, chains, loss, census } = await oneRun(seed, pid, days);
      // stash player:cause keys for the new-death-mode guardrail
      row._deathModes = rec.deaths.filter(d => d.player).map(d => 'player:' + String(d.cause || '?').slice(0, 60));
      rows.push(row);
      const pname = `${pid}-s${seed}-${side}`;
      const narratives = census ? census.deaths.map(a => BC.deathNarrative(rec, a)) : [];
      fs.writeFileSync(path.join(perseedDir, pname + '.json'),
        JSON.stringify({ seed, policy: pid, side, window: chains.window, census, narratives, lossMode: loss.lossMode,
          primary: row.nW1HavenTB, ra: row.ra }, null, 1));
      // full record (deaths w/ ctx, beats, TB sessions, daily rows) for sense-reading + audit
      fs.writeFileSync(path.join(perseedDir, pname + '-full.json'),
        JSON.stringify({ seed, policy: pid, side, daysRan: row.days, endReason: row.endReason, won: row.won,
          primary: row.nW1HavenTB, ra: row.ra,
          bearerDeaths: SC.bearerDeaths(rec), outsideWindow: chains.outsideWindow,
          deaths: rec.deaths, tbSessions: rec.tbSessions, beats: rec.beats.slice(-400),
          scaleRows: rec.scaleRows.map(r => ({ day: r.day, rank: r.rank, exiled: r.exiled, links: r.links })),
          foodRows: rec.foodRows, standingRows: rec.standingRows, breaks: rec.breaks }));
      // coordinator telemetry record (booleans as 0/1)
      fs.writeFileSync(path.join(teleDir, pname + '.json'),
        JSON.stringify({ run: 'raidassess', side, seed, policy: pid,
          national: row.national ? 1 : 0, table: row.table ? 1 : 0,
          wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0 }));
      console.log(`   d=${row.days} ${row.endReason} national=${row.national} w1havenTB=${row.nW1HavenTB} attrib=${row.attribShare == null ? 'n/a' : (100 * row.attribShare).toFixed(0) + '%'} topKiller=${row.topKillerClass || 'n/a'} table=${row.table} w=${row.maxWave} ra=${row.ra.raAssessed}/${row.ra.raDeclined}/${row.ra.raDisengaged}`);
    }
  }
  const summary = summarize(rows);
  fs.writeFileSync(out, JSON.stringify({ side, rows, summary }, null, 1));
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
  console.log('SUMMARY ' + side + ': ' + JSON.stringify(summary));
}

if (require.main === module) {
  (async () => {
    if (process.env.SMOKE === '1') return smoke();
    if (process.env.DETGATE === '1') return detgate();
    if (process.env.AA === '1') return aa();
    return runSweep();
  })().catch(e => { console.error('RAIDASSESS FATAL:', e && e.stack || e); process.exit(1); });
} else {
  module.exports = { oneRun, hookFights, hookHunt, hookPlayerDeath, attachDeaths, attachBeats, opponentsOf, tileClassNow };
}
