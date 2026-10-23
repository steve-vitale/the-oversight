// diag-linkdissolve.js — instrumented link-history census for dissolution attribution
// (flesh-out loop arm sim-linkdissolve, axis scale-onramp, backlog #853,
//  run fleshout-20261023T1235Z). DIAG: instrument-side, ZERO src/js, ZERO
//  scripts/policies changes. Namespace linkdissolve-*.
//
// THE QUESTION (sim-links-diag named next, PHASE 1 DIAG-GO on formations):
// 8 dip-dissolution events (-102 steps) across the doorcensus-armor corpus
// show WHEN a polity dissolved but no link-level trace says WHICH link
// snapped or WHY. This census re-runs the doorcensus-armor substrate with a
// per-day link-history instrument: for every Haven-party link, per game
// day: trust trajectory + status + arrears + the link's own history tail
// (the engine's _linkNote log: drift/broken/succession/tribute/arrears/...),
// plus the per-day dip scalar and scale state.
//
// The analyzer (scripts/linkdissolve-analyze.js) then attributes each
// dissolution event to a NAMED channel:
//   trust-decay (trust below the 40 seasoned bar, no break)
//   break/<how> (breakLink: succession | revolt | released | walked | seceded | gambit | severed)
//   succession (chaos-driven: haircut/tribute-leverage/neglect near the funeral)
//   tribute-arrears (arrears spike + trust slide on short tribute)
//   other-named (any other named history kind — never anonymous)
//
// Substrate (pinned, FAIL LOUD — identical to diag-doorcensus-armor):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1. SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/
//   VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET (so the plain
//   seasoned bars apply: 30d + trust 40, conquered = season only).
// Legs: ARM=control -> AD.armedFor('leadfeast') + ARMORYDRIVE=1
//       ARM=armed   -> AV.armedFor('leadfeast') + ARMORYDRIVE=1 + ARMORVILLAGE=1
// Seeds: 65511-65522 (the census set; the dissolution events are the target).
// Horizon: 180d death-aware (runDays handles Game.over).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARM=control node scripts/diag-linkdissolve.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 ARM=armed node scripts/diag-linkdissolve.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));

function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (non-seat substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'SUCCPOLITY', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, plain bars).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'control';
  if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
  if (process.env.ARMORYDRIVE !== '1') { console.error('SWEEP STOP: ARMORYDRIVE=1 required on BOTH legs.'); process.exit(2); }
  if (ARM === 'armed' && process.env.ARMORVILLAGE !== '1') { console.error('SWEEP STOP: ARMORVILLAGE=1 required for ARM=armed.'); process.exit(2); }
  if (ARM === 'control' && ('ARMORVILLAGE' in process.env)) { console.error('SWEEP STOP: ARMORVILLAGE must be unset for ARM=control.'); process.exit(2); }
  return ARM;
}
// Lazily evaluated at main-entry (require-time would fire the guard for
// importers like the proof test, which sets no env).
let ARM = null;
function armOf() { if (ARM == null) ARM = checkEnv(); return ARM; }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518, 65519, 65520, 65521, 65522]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-linkdissolve');

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() { return armOf() === 'armed' ? AV.armedFor('leadfeast') : AD.armedFor('leadfeast'); }
function policyTag() { return 'leadfeast' + (armOf() === 'armed' ? '-armorydrive-armorvillage' : '-armorydrive'); }

// snapshotLinks(Game): the link-history instrument. Per game day, one row per
// Haven-party link in the graph (active AND broken — broken links stay in the
// graph with status 'broken' and carry their break reason in the history
// tail). History tails recorded only when they grow (dedupe on histN).
function snapshotLinks(Game, state) {
  state = state || { prevHistN: {}, lastDay: 0 };
  const rows = [];
  let links = [];
  try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) { links = []; }
  for (const l of links) {
    try {
      const id = l.id || l.linkId || null;
      let role = 'other', other = null;
      if (l.primary === 'haven') { role = 'primary'; other = l.subordinate; }
      else if (l.subordinate === 'haven') { role = 'subordinate'; other = l.primary; }
      else if (l.a === 'haven' || l.b === 'haven') { role = 'peer'; other = (l.a === 'haven' ? l.b : l.a); }
      else continue; // not Haven's link — never scores dip, not this census
      let ovName = null;
      try { ovName = (typeof Game._ovName === 'function') ? Game._ovName(other) : String(other); } catch (e) { ovName = String(other); }
      const hist = l.history || [];
      const hn = hist.length;
      const key = String(id) + '|' + String(other);
      const grew = hn !== (state.prevHistN[key] | 0);
      state.prevHistN[key] = hn;
      const row = {
        id, other: String(other), ovName, kind: l.kind || 'subordinate', role,
        trust: (l.trust | 0), status: l.status || 'active',
        formedDay: (l.day | 0), conquered: !!l.conquered,
        arrears: (l.arrears | 0), tributeWk: (l.tributeKcalPerWeek | 0),
        histN: hn,
      };
      if (grew) {
        row.histTail = hist.slice(-6).map(h => ({ d: (h.day | 0), k: String(h.kind || ''), n: String(h.note || '').slice(0, 160) }));
      }
      rows.push(row);
    } catch (e) { /* one bad link never kills the census */ }
  }
  let dip = null, dipLinks = null, rank = null;
  try { const st = Game.villageStanding ? Game.villageStanding() : null; if (st) { dip = st.diplomacy | 0; dipLinks = st.links | 0; } } catch (e) {}
  try { rank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) {}
  let nationalLive = null;
  try { nationalLive = !!(((Game.state || {}).nationalLive)); } catch (e) {}
  return { links: rows, dip, dipLinks, rank, nationalLive };
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const arm = armOf();
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'linkdissolve', fullTelemetry: false });
  await setupGame(Game);
  const snap = { prevHistN: {}, lastDay: 0 };
  const days = {}; // gameDay -> snapshot (last write per day wins)
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      let r;
      try { r = policy.daily(Gm, ctx); } finally {
        try {
          const s = snapshotLinks(Gm, snap);
          days[gday(Gm)] = s;
        } catch (e) { /* snapshot never kills the run */ }
      }
      return r;
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let gameDays = 0;
  try { gameDays = (Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}

  const out = {
    seed, arm, policyId: policyTag(),
    instrument: 'diag-linkdissolve v1 (per-day link-history census: trust/status/arrears + link history tails)',
    substrate: arm === 'armed'
      ? 'AV.armedFor(leadfeast) — non-seat long substrate + ARMORYDRIVE=1 + ARMORVILLAGE=1'
      : 'AD.armedFor(leadfeast) — non-seat long substrate + ARMORYDRIVE=1 (census-armed re-baseline)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1' + (arm === 'armed' ? ' ARMORVILLAGE=1' : ''),
    anchorCommit: ANCHOR,
    days, // keyed by game day
    nDays: Object.keys(days).length,
    gameDays, endReason: result.endReason,
  };
  const dir = path.join(EVID, arm);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `s${seed}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 1) + '\n');
  // hash-after-write: the write-denial class is real — read back and parse.
  const back = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (back.seed !== seed || back.nDays < 1) throw new Error(`write-denial on s${seed}: readback mismatch`);
  return out;
}

async function runPhase(label, seeds) {
  const arm = armOf();
  const rows = [];
  console.log(`linkdissolve ${label}: arm=${arm} seeds=${seeds.join(',')}`);
  for (const seed of seeds) {
    const t0 = process.hrtime.bigint(); // Date.now is frozen by the harness; hrtime is monotonic
    try {
      const r = await oneRun(seed);
      rows.push(r);
      console.log(`done ${r.policyId} s${seed}: end=${r.endReason} gameDays=${r.gameDays} nDays=${r.nDays} (${(Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1)}s)`);
    } catch (e) {
      console.error(`ERROR ${arm} s${seed}: ${e && e.message}`);
      rows.push({ seed, arm, error: String(e && e.message) });
    }
  }
  return rows;
}

module.exports = { checkEnv, policyFor, policyTag, snapshotLinks, ANCHOR };

if (require.main === module) {
  (async () => {
    const arm = armOf();
    const rows = await runPhase('census', SEEDS);
    const ok = rows.filter(r => !r.error);
    fs.writeFileSync(path.join(EVID, `corpus-summary-${arm}.json`),
      JSON.stringify({
        arm, anchor: ANCHOR, n: ok.length, errors: rows.length - ok.length,
        runs: rows.map(r => ({ seed: r.seed, policyId: r.policyId, gameDays: r.gameDays || 0, nDays: r.nDays || 0, end: r.endReason || null })),
      }, null, 1) + '\n');
    console.log(`census done: n=${ok.length} errors=${rows.length - ok.length}`);
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
