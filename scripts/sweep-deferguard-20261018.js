#!/usr/bin/env node
// scripts/sweep-deferguard-20261018.js — sim-deferguard pilot sweep
// (flesh-out loop arm sim-deferguard, 2026-10-18, scale-onramp axis;
// defercensus2b's named next: veteran SURVIVAL through the release window).
//
// QUESTION: does the deferguard expedition guard (hold qualifying veterans
// out of the scholar's expedition party during the wave-4 deferral window)
// engage, and does it move wave-4 unlocks vs the (b)-readiness control on
// identical seeds?
//
// SUBSTRATE (defercensus2b (b) readiness, exact composition + env):
//   policy: withDeferguard(withVetrel(withReposition(TF.leadfeast/belongfeast)))
//   env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SEATDRIVE=0
//        VETREL=1 REPOSITION=1 NODEWITNESS=1 (+ WINPURSUIT=1 WINDEFER=1 set
//        in-process — the windefer wrapper is NOT composed on this
//        substrate, so the env is inert; matches the 2b corpus composition
//        exactly).
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: (b)-readiness as above, DEFERGUARD unset
//   armed:   + DEFERGUARD=1 (the expedition guard)
// The pipeline runs identically on both arms — the only difference is the
// guard layer.
//
// PRE-REGISTRATION (written before the pilot — see
// evidence/2026-10-18/sim-deferguard.md):
//   ENGAGEMENT GATE (binding): the layer must fire (>=1 veteran held off a
//     field channel: dgDismissals>=1 or dgInviteBlocks>=1 during the window)
//     in >= 4/16 armed runs. Miss -> KILL at pilot (delete the layer
//     zero-trace), land instruments + evidence.
//   PRIMARY (STEP 2 confirm, pending coordinator relay): wave-4 unlocks
//     (maxWave>=4) armed-control >= +3/16.
//   GUARDRAILS: median survival >= control-10d (per policy pair);
//     national >= control-2; starvation deaths <= control+1; no new death
//     mode (n>=3, kind-filtered person deaths only).
//   Seeds: 8 fresh (54101-54108 — verified filename-unused in evidence/).
//   Horizon: 180d death-aware.
//
// Usage:
//   SEEDS="54101,54102,54103,54104,54105,54106,54107,54108" DAYS=180 \
//   OUT=evidence/2026-10-18/sweep-deferguard.json \
//   PERSEED=evidence/2026-10-18/perseed-deferguard \
//   node scripts/sweep-deferguard-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const DG = require('./policies/deferguard');

const SEEDS = (process.env.SEEDS || '54101,54102,54103,54104,54105,54106,54107,54108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || 'evidence/2026-10-18/sweep-deferguard.json';
const PERSEED = process.env.PERSEED || 'evidence/2026-10-18/perseed-deferguard';

function baseEnv(armed) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
  process.env.SEATDRIVE = '0';
  process.env.VETREL = '1';
  process.env.REPOSITION = '1';
  process.env.NODEWITNESS = '1';
  process.env.WINPURSUIT = '1'; // inert on this substrate (wrapper not composed) — matches 2b corpus
  process.env.WINDEFER = '1';   // inert on this substrate (wrapper not composed) — matches 2b corpus
  if (armed) process.env.DEFERGUARD = '1'; else delete process.env.DEFERGUARD;
}

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function readinessRow(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    return {
      ready: !!r.ready, armored: r.armored | 0, armed: r.armed | 0,
      tricks: r.tricks | 0, veterans: r.veterans | 0,
      short: (r.short || []).join('|') || 'NONE',
      maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    };
  } catch (e) { return { err: String(e && e.message).slice(0, 60) }; }
}

function installDeathCapture(Game) {
  const recs = [];
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          recs.push({
            day: dayOf(Game),
            who: data && data.who,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
          });
        }
      } catch (e) {}
      return r;
    };
  } catch (e) {}
  return recs;
}
function personDeaths(recs) {
  const seen = {};
  const out = [];
  for (const t of recs) {
    if (!t) continue;
    const kind = t.kind;
    const isPerson = t.player || kind === 'person' || kind === 'villager' || kind === 'scholar' || kind == null;
    if (!isPerson) continue;
    const key = [t.who, t.day, t.cause].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ who: t.who, day: t.day | 0, cause: t.cause || 'unknown' });
  }
  return out;
}

function controlPolicy(tag) {
  const base = tag === 'lead' ? TF.leadfeast : TF.belongfeast;
  const rp = RP.withReposition(base, `${tag}-rp`, `${tag} + reposition (REPOSITION=1)`);
  return VR.withVetrel(rp, `${tag}-vetrel-rp`, `${tag} + reposition + VETREL (readiness substrate)`);
}
function armedPolicy(tag) {
  return DG.withDeferguard(controlPolicy(tag), `${tag}-deferguard`,
    `${tag} + readiness + DEFERGUARD veteran expedition guard (DEFERGUARD=1)`);
}

async function runOne(tag, armed, seed, days) {
  baseEnv(armed);
  const policy = armed ? armedPolicy(tag) : controlPolicy(tag);
  const { Game } = await loadGame({ seed, mode: 'deferguard-' + policy.id });
  await setupGame(Game);
  const deathRecs = installDeathCapture(Game);
  const trace = [];
  const snap = {};
  const origDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      const d = dayOf(G);
      if (d % 15 === 0 || d === 1) {
        try { trace.push(Object.assign({ d }, readinessRow(G))); } catch (e) {}
      }
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try {
        for (const k of ['dgDismissals', 'dgInviteBlocks', 'dgWindowDays', '_dgWindowOpened',
                         'vetHunts', 'vetHuntFights', 'vetYields']) {
          if (ctx[k] != null) snap[k] = ctx[k];
        }
      } catch (e) {}
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days }));
  const final = readinessRow(Game);
  const log = Game.state.waveKillLog || [];
  const vetIds = {};
  for (const e of log) if (e && (e.w | 0) >= 3 && e.by) vetIds[e.by] = true;
  const deaths = personDeaths(deathRecs);
  const starveDeaths = deaths.filter(d => /starv/i.test(d.cause)).length;
  const vetDeaths = deaths.filter(d => vetIds[d.who]).length;
  let national = 0, table = 0;
  try {
    const sr = Game.scaleRank ? Game.scaleRank() : '';
    national = /national|global/.test(sr) ? 1 : 0;
  } catch (e) {}
  try { table = Game.tableReached && Game.tableReached() ? 1 : 0; } catch (e) {}
  const end = (() => {
    try {
      if (Game.over) return Game.villageLost ? 'village-lost' : 'ended';
      return 'survived';
    } catch (e) { return 'unknown'; }
  })();
  // engagement: a veteran held off a field channel during the window
  const dgDis = (snap.dgDismissals || []).length | 0;
  const dgBlk = snap.dgInviteBlocks | 0;
  return {
    seed, policy: tag, armed: !!armed,
    days: dayOf(Game), end, national, table,
    maxWave: final.maxWave, w4unlock: (final.maxWave | 0) >= 4 ? 1 : 0,
    finalReadiness: final,
    deaths: deaths.length, starveDeaths, vetDeaths,
    deathCauses: deaths.reduce((m, d) => { m[d.cause] = (m[d.cause] || 0) + 1; return m; }, {}),
    dgEngaged: (dgDis > 0 || dgBlk > 0) ? 1 : 0,
    dgDismissals: dgDis, dgInviteBlocks: dgBlk,
    dgWindowDays: snap.dgWindowDays | 0, dgWindowOpened: snap._dgWindowOpened || null,
    dgDismissalDays: (snap.dgDismissals || []).map(x => x.day),
    vetHunts: snap.vetHunts | 0, vetHuntFights: snap.vetHuntFights | 0, vetYields: snap.vetYields | 0,
    trace,
  };
}

async function main() {
  fs.mkdirSync(PERSEED, { recursive: true });
  const rows = [];
  for (const seed of SEEDS) {
    for (const tag of ['lead', 'belong']) {
      for (const [armed, armKey] of [[false, 'control'], [true, 'armed']]) {
        console.log(`run seed=${seed} policy=${tag} arm=${armKey} ...`);
        let row;
        try {
          row = await runOne(tag, armed, seed, DAYS);
        } catch (e) {
          console.error(`  ERROR seed=${seed} ${tag}/${armKey}:`, String(e && e.message).slice(0, 200));
          row = { seed, policy: tag, armed, error: String(e && e.message).slice(0, 200) };
        }
        row.armKey = armKey;
        row.policyBase = tag;
        rows.push(row);
        fs.writeFileSync(path.join(PERSEED, `${tag}-${armKey}-s${seed}.json`), JSON.stringify(row));
      }
    }
  }
  fs.writeFileSync(OUT, JSON.stringify({ seeds: SEEDS, days: DAYS, rows }, null, 1));
  // summary to stdout
  const pairs = rows.filter(r => !r.error);
  const armed = pairs.filter(r => r.armed), ctrl = pairs.filter(r => !r.armed);
  const sum = (a, k) => a.reduce((t, r) => t + (r[k] | 0), 0);
  const med = (a, k) => { const v = a.map(r => r[k] | 0).sort((x, y) => x - y); return v.length ? v[Math.floor(v.length / 2)] : 0; };
  console.log('--- pilot summary ---');
  console.log(`pairs complete: ${armed.length} armed / ${ctrl.length} control`);
  console.log(`engagement (armed runs with a veteran held off): ${sum(armed, 'dgEngaged')}/${armed.length} (gate >= 4/16)`);
  console.log(`w4 unlocks: armed ${sum(armed, 'w4unlock')} / control ${sum(ctrl, 'w4unlock')}`);
  console.log(`national: armed ${sum(armed, 'national')} / control ${sum(ctrl, 'national')}`);
  console.log(`median survival: armed ${med(armed, 'days')}d / control ${med(ctrl, 'days')}d`);
  console.log(`vet deaths: armed ${sum(armed, 'vetDeaths')} / control ${sum(ctrl, 'vetDeaths')}`);
  console.log(`starvation deaths: armed ${sum(armed, 'starveDeaths')} / control ${sum(ctrl, 'starveDeaths')}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
