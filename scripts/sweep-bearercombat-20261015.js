#!/usr/bin/env node
// scripts/sweep-bearercombat-20261015.js — bearer combat-death census sweep
// (sim-bearercombat, 2026-10-15, scale-onramp axis).
//
// DIAGNOSTIC ARM, instrument-only: 8 seeds x {leadfeast, belongfeast},
// 180d death-aware, on the current tip (FEASTSCALE_R13=1 asserted up front,
// #312). On runs that reach national at least once, EVERY bearer combat
// death is attributed: killer wave (1-5), tile class (haven/wild/arena-
// contest), fight type (turn-based/contest/hunt/expedition/field-damage),
// entry HP + armor P at fight start, counter-known state, succession
// consequences (rank 7d after, days to next bearer death).
//
// The succhain instrument (evidence/2026-10-15/sim-succhain.md) found
// bearer-death chains are shallow (mean 1.22), 27/28 deaths combat, 22/23
// keep rank — succession-collapse is closed; the cascade is combat mortality.
// This census names WHERE/HOW the bearer dies in combat, so the next run knows
// which combat-mortality lever to pull.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — BINDING, written BEFORE sims):
//   Primary metric: attribution share of bearer combat deaths, GO >= 90%.
//     attributed = fightType + tileClass + killerClass all named (killerClass
//     = monster wave 1-5 or a named non-wave class: contest-opponent, prey,
//     expedition); 'unknown' in any slot counts AGAINST the bar.
//   Denominator: bearer deaths with family combat|monster (holdloss
//     classifyDeathFamily convention) on runs reaching national >= once.
//     Deaths on non-national runs are reported separately, never in the bar.
//   Horizon: 180d death-aware (dead villages stop, <=10d tail).
//   Substrate: 8 seeds (11/22/33/44/55/66/77/88) x {leadfeast, belongfeast}
//     unlayered, FEASTSCALE_R13=1 asserted up front in proof AND sweep.
//   Secondary: the single biggest killer class (wave x tile x fight-type) —
//     this names the combat-mortality lever for the next run.
//
// Modes:
//   SMOKE=1      15d x {leadfeast, belongfeast}: samples collect, no crash,
//                bearer deaths present, TB sessions hook live.
//   DETGATE=1    D1 gate determinism (60d x2 byte-identical); D2 instrument
//                ON vs OFF byte-identical 60d (every hook is read-only).
//   default      the 16-run suite -> evidence/2026-10-15/perseed-bearercombat/,
//                evidence/2026-10-15/sim-bearercombat-runs.json,
//                evidence/2026-10-15/telemetry-bearercombat/.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-bearercombat-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-bearercombat-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-bearercombat-20261015.js
//      SEEDS=11,22 POLICIES=leadfeast DAYS=30 OUT=/tmp/x.json \
//        PERSEED_DIR=/tmp/px TELE_DIR=/tmp/tx FEASTSCALE_R13=1 node scripts/sweep-bearercombat-20261015.js
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
  console.error('BEARERCOMBAT FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
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
    console.error(`BEARERCOMBAT FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}
if ((process.env.POLICIES || '').indexOf('winpursuit') !== -1 && process.env.WINPURSUIT !== '1') {
  console.error('BEARERCOMBAT FATAL: POLICIES selects winpursuit but WINPURSUIT!=1 (the layer would be gate-off — a silent no-op).');
  process.exit(2);
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
  const { Game } = await loadGame({ seed, mode: 'bearercombat-' + pid });
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

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
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

  const row = {
    seed, policy: pid, days: daysRan, endReason: result.endReason, trajHash, nSamples,
    national, natFirstDay: chains.window ? chains.window.firstDay : null,
    nChains: chains.nChains,
    nBearerDeaths: rec.deaths.filter(d => SC.isBearerDeath(d)).length,
    nCensusDeaths: cen ? cen.nDeaths : 0,
    attribShare: cen ? cen.attribShare : null,
    topKillerClass: cen ? cen.topKillerClass : null,
    lossMode: loss.reached ? loss.lossMode : 'n/a',
    won: !!won, table: tableSeat !== 'none', tableSeat, maxWave,
    survivalDays: daysRan, exiled: rec.exiledEver,
    nTBsessions: (t.tbSessions || []).length,
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
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log('SMOKE: 15d x {leadfeast, belongfeast}');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    const { row, rec } = await oneRun(11, pid, 15);
    // the r17 deathattr wiring check: the player flag FIELD must be present
    // on every death record (a death in 15d is luck, not a gate).
    const flagWired = rec.deaths.every(d => typeof d.player === 'boolean');
    const bearerNoFlag = rec.deaths.filter(d => SC.isBearerDeath(d) && d.player !== true);
    const ok = row.nSamples >= 10 && row.days === 15 && rec.scaleRows.length >= 10 && rec.foodRows.length >= 10 &&
      flagWired && bearerNoFlag.length === 0;
    if (ok) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, beats=${rec.beats.length}, deaths=${rec.deaths.length} (player-flag wired, tbSessions=${row.nTBsessions})`);
    else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} scaleRows=${rec.scaleRows.length} foodRows=${rec.foodRows.length} flagWired=${flagWired} bearerNoFlag=${bearerNoFlag.length}`); }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-bearercombat-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-bearercombat';
  const teleDir = process.env.TELE_DIR || 'evidence/2026-10-15/telemetry-bearercombat';
  fs.mkdirSync(perseedDir, { recursive: true });
  fs.mkdirSync(teleDir, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      console.log(`-- ${pid} seed ${seed}`);
      const { row, rec, chains, loss, census } = await oneRun(seed, pid, days);
      rows.push(row);
      const pname = `${pid}-s${seed}`;
      const narratives = census ? census.deaths.map(a => BC.deathNarrative(rec, a)) : [];
      fs.writeFileSync(path.join(perseedDir, pname + '.json'),
        JSON.stringify({ seed, policy: pid, window: chains.window, census, narratives, lossMode: loss.lossMode }, null, 1));
      // full record (deaths w/ ctx, beats, TB sessions, daily rows) for sense-reading + audit
      fs.writeFileSync(path.join(perseedDir, pname + '-full.json'),
        JSON.stringify({ seed, policy: pid, daysRan: row.days, endReason: row.endReason, won: row.won,
          bearerDeaths: SC.bearerDeaths(rec), outsideWindow: chains.outsideWindow,
          deaths: rec.deaths, tbSessions: rec.tbSessions, beats: rec.beats.slice(-400),
          scaleRows: rec.scaleRows.map(r => ({ day: r.day, rank: r.rank, exiled: r.exiled, links: r.links })),
          foodRows: rec.foodRows, standingRows: rec.standingRows, breaks: rec.breaks }));
      // coordinator telemetry record (booleans as 0/1)
      fs.writeFileSync(path.join(teleDir, pname + '.json'),
        JSON.stringify({ run: 'bearercombat', seed, policy: pid,
          national: row.national ? 1 : 0, table: row.table ? 1 : 0,
          wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0 }));
      console.log(`   d=${row.days} ${row.endReason} national=${row.national} censusDeaths=${row.nCensusDeaths} attrib=${row.attribShare == null ? 'n/a' : (100 * row.attribShare).toFixed(0) + '%'} topKiller=${row.topKillerClass || 'n/a'} table=${row.table} w=${row.maxWave}`);
    }
  }
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

if (require.main === module) {
  (async () => {
    if (process.env.SMOKE === '1') return smoke();
    if (process.env.DETGATE === '1') return detgate();
    return runSweep();
  })().catch(e => { console.error('BEARERCOMBAT FATAL:', e && e.stack || e); process.exit(1); });
} else {
  module.exports = { oneRun, hookFights, hookHunt, hookPlayerDeath, attachDeaths, attachBeats, opponentsOf, tileClassNow };
}
