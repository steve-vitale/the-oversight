#!/usr/bin/env node
// test-vetrestage.js — proof for scripts/policies/vetrestage.js
// (flesh-out loop, 2026-10-23, run fleshout-20261023T1215Z, arm
// sim-vetrestage, axis scale-onramp).
//
// RED->GREEN on the post-kill retention design + det-gates + D2.
// Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the non-seat long substrate — the autopsy corpus):
//   control = VS.substrateFor(base) = AD.armedFor(base) (armorydrive
//             stack, ARMORYDRIVE=1, VETRESTAGE unset)
//   armed   = VS.armedFor(base)      (withVetRestage OUTSIDE the same
//             stack, VETRESTAGE=1)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1. VETRESTAGE toggled
//   per gate.
//
// Gates:
//   E0 module shape (exports, vsOn, VS_WINDOW, normBase, substrateFor/
//      armedFor id tags).
//   E1 env-gate: vsOn reads VETRESTAGE exactly.
//   E2 DET: VETRESTAGE unset -> armedFor trajectories byte-identical to
//      substrateFor (2 seeds x 60d) — "VETRESTAGE-off reproduces
//      control" (via det-vetrestage.js subprocesses).
//   E3 synthetic RED->GREEN on the wrapper logic (fake base policy,
//      stubbed Game):
//      E3a vsBlooded: blooded found (w4 kill 3d ago); excluded: stale
//          kill (20d), wave-3-only kill, scholar, dead.
//      E3b blooded+hurting FIRES: shelterVillagers called, shield set,
//          trace shelter+shield, beats said once each.
//      E3c blooded+healthy: shield applied, NO shelter, NO heal check.
//      E3d triage: blooded at 60 HP with medic -> villagerHealCheck
//          called, health rises, trace 'heal'; without medic -> 'sitout'.
//      E3e gate off: base.daily called, zero verbs, zero trace, no shield.
//      E3f window lapse: shield cleared, shelter released, trace
//          unshield/release, beats deduped.
//      E3g chair: blooded vid becomes scholar -> shield cleared, shelter
//          released, trace 'chair'/'chair-release' (the mantlechain
//          guard: retention never funnels anyone toward the chair).
//      E3h muster active: no new shelter; no release of mine while the
//          muster owns the shelter state.
//      E3i expedition escort: setup installs the startExpedition wrap
//          (gate on only); a departing blooded vid gets a healthy
//          companion on the same expedition (same tx/ty, escortFor);
//          no eligible escort -> trace 'escort-none'; gate off -> no wrap.
//   E4 180d VETRESTAGE=1 run completes on the real stack +
//      deterministic re-run (D2), the sweep's exact config.
//   E5 real Game behavior: a real wave-4 kill injected into
//      state.waveKillLog for a real roster vid -> policy.daily sets the
//      shield and traces it (the policy reads real engine state).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 VETRESTAGE=1 node scripts/test-vetrestage.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'vetrestage.js'))) {
  console.error('RED: scripts/policies/vetrestage.js missing.');
  process.exit(1);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 required (pinned substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE', 'VETBENCH', 'SCHOLARDIST']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (process.env.ARMORYDRIVE !== '1') { console.error('GATE STOP: ARMORYDRIVE=1 required (the stack needs it).'); process.exit(2); }

const VS = require('./policies/vetrestage');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 600)); }
}
function setVS(on) { if (on) process.env.VETRESTAGE = '1'; else delete process.env.VETRESTAGE; }

// ---------- E0: module shape ----------
check('E0 exports', ['vsOn', 'vsBlooded', 'vsHealth', 'vsPickEscort', 'withVetRestage', 'normBase', 'substrateFor', 'armedFor'].every(k => typeof VS[k] === 'function'));
check('E0 window=14', VS.VS_WINDOW === 14);
check('E0 armedFor id tag', /vetrestage/.test(VS.armedFor('leadfeast').id));
check('E0 substrateFor control tag', !/vetrestage/.test(VS.substrateFor('leadfeast').id));

// ---------- E1: env gate ----------
setVS(true); check('E1 vsOn with VETRESTAGE=1', VS.vsOn() === true);
setVS(false); check('E1 vsOn without VETRESTAGE', VS.vsOn() === false);
process.env.VETRESTAGE = ''; check('E1 vsOn with empty string', VS.vsOn() === false);
setVS(true);

// ---------- E2: DET — gate-off armed == control ----------
function detRun(seed, pol, arm, days, vsOn) {
  const env = Object.assign({}, process.env);
  if (vsOn) env.VETRESTAGE = '1'; else delete env.VETRESTAGE;
  const out = execSync(
    `node ${path.join(REPO, 'scripts', 'det-vetrestage.js')} ${seed} ${pol} ${arm} ${days}`,
    { cwd: REPO, env, encoding: 'utf8', timeout: 900000 });
  const m = out.trim().split(/\s+/);
  return { digest: m[0], days: parseInt(m[1], 10), vsLen: parseInt(m[2], 10) };
}
for (const [seed, pol] of [[65511, 'lead'], [65512, 'belong']]) {
  const c = detRun(seed, pol, 'control', 60, false);
  const g = detRun(seed, pol, 'armed', 60, false);
  check(`E2 det s${seed}/${pol}: gate-off armed == control`, c.digest === g.digest && c.vsLen === 0 && g.vsLen === 0,
    `control=${c.digest}/${c.vsLen} gateoff=${g.digest}/${g.vsLen}`);
}

// ---------- E3: synthetic RED->GREEN ----------
function stubGame(opts) {
  opts = opts || {};
  const v = {
    roster: opts.roster || [],
    health: Object.assign({}, opts.health),
    sheltered: Object.assign({}, opts.sheltered || {}),
    shielded: Object.assign({}, opts.shielded || {}),
    away: Object.assign({}, opts.away || {}),
    px: 4, py: 4,
  };
  if (opts.muster) v.shelterMustered = { since: opts.day || 100, threat: 'test' };
  const said = [];
  const calls = { shelter: [], release: [], healCheck: [] };
  const G = {
    villagerId: opts.scholar || 's1',
    state: { village: v, scholar: { day: opts.day || 100 }, waveKillLog: opts.waveKillLog || [] },
    data: { monsters: [], items: [] },
    _dead: opts.dead || {},
    vpOf(vid) { return this._dead[vid] ? { dead: true } : { dead: false }; },
    displayName(vid) { return ((opts.names || {})[vid]) || vid; },
    say(s) { said.push(s); },
    isSheltered(vid) { return !!v.sheltered[vid]; },
    shelterVillagers(vids, o) {
      let n = 0;
      for (const vid of (vids || [])) {
        if (!(v.roster || []).includes(vid)) continue;
        if (vid === this.villagerId) continue;
        if (v.sheltered[vid]) continue;
        v.sheltered[vid] = { since: this.state.scholar.day, reason: (o || {}).reason || 'threat' };
        calls.shelter.push(vid); n++;
      }
      return n;
    },
    releaseShelter(vids) {
      let n = 0;
      for (const vid of (vids || Object.keys(v.sheltered))) {
        if (v.sheltered[vid]) { delete v.sheltered[vid]; calls.release.push(vid); n++; }
      }
      return n;
    },
    villagerHealCheck(vid, first) {
      calls.healCheck.push(vid);
      const cur = (v.health[vid] === undefined) ? 100 : v.health[vid];
      if (cur >= 70) return false;
      if (opts.medic) { v.health[vid] = Math.min(100, cur + 25); return false; }
      return true;
    },
    agencyState() { return this._agency || (this._agency = { exped: {} }); },
    npcNode() { return { nx: 4, ny: 4 }; },
    npcSetNode() {},
    startExpedition(vid, hx, hy) {
      v.away[vid] = { nx: hx + 1, ny: hy, purpose: 'expedition', sinceDay: this.state.scholar.day, sincePart: 0, duration: 10 };
      const a = this.agencyState();
      a.exped[vid] = { tx: hx + 1, ty: hy, dist: 1, legs: 0, sinceDay: this.state.scholar.day, sincePart: 0, duration: 10, finds: [], encounters: [] };
    },
    _said: said, _calls: calls,
  };
  return G;
}
function killLog(by, w, d) { return [{ d, mid: 'm_test', w, by, via: 'strike', trick: null }]; }
const fakeBase = { daily(G, ctx) { ctx.baseDailyCalls = (ctx.baseDailyCalls || 0) + 1; } };
function wrapped() { return VS.withVetRestage(fakeBase, 'test-vr', 'test'); }
function traceActions(ctx) { return (ctx.vsTrace || []).map(t => t.action); }

// E3a: vsBlooded classification
{
  const G = stubGame({
    day: 100, scholar: 's1',
    roster: ['s1', 'a', 'b', 'c', 'd1'],
    waveKillLog: [
      ...killLog('a', 4, 97),   // blooded: w4 kill 3d ago
      ...killLog('b', 4, 80),   // stale: 20d ago
      ...killLog('c', 3, 98),   // wave-3 only
      ...killLog('s1', 4, 99),  // scholar excluded
      ...killLog('d1', 4, 99),  // dead excluded
    ],
    dead: { d1: true },
  });
  const bl = VS.vsBlooded(G);
  check('E3a vsBlooded finds the blooded', bl.length === 1 && bl[0].vid === 'a' && bl[0].killDay === 97,
    JSON.stringify(bl));
}

// E3b: blooded + hurting FIRES
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a', 'b'], health: { a: 50, b: 100 }, waveKillLog: killLog('a', 4, 97) });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx);
  check('E3b shelter verb fired', G._calls.shelter.length === 1 && G._calls.shelter[0] === 'a');
  check('E3b shield set', !!G.state.village.shielded.a);
  const ta = traceActions(ctx);
  check('E3b trace shelter+shield', ta.includes('shelter') && ta.includes('shield'), ta.join(','));
  check('E3b base daily ran', ctx.baseDailyCalls === 1);
  check('E3b beats said once', G._said.filter(s => s.includes('🛡️')).length === 1 && G._said.filter(s => s.includes('🚪')).length === 1,
    G._said.join(' | ').slice(0, 300));
  check('E3b counters', ctx.vsShelters === 1 && ctx.vsShielded === 1);
}

// E3c: blooded + healthy: shield, no shelter, no heal check
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 100 }, waveKillLog: killLog('a', 4, 97) });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx);
  check('E3c shield applied', !!G.state.village.shielded.a && traceActions(ctx).includes('shield'));
  check('E3c no shelter when healthy', G._calls.shelter.length === 0);
  check('E3c no heal check at full HP', G._calls.healCheck.length === 0);
}

// E3d: triage — medic heals, no medic sits out
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 60 }, waveKillLog: killLog('a', 4, 97), medic: true });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx);
  check('E3d heal check called', G._calls.healCheck.includes('a'));
  check('E3d health rose', G.state.village.health.a === 85, String(G.state.village.health.a));
  check('E3d trace heal', traceActions(ctx).includes('heal'));
  const G2 = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 60 }, waveKillLog: killLog('a', 4, 97) });
  const ctx2 = {};
  p.daily(G2, ctx2);
  check('E3d sitout without medic', traceActions(ctx2).includes('sitout'));
}

// E3e: gate off = pure delegation
{
  setVS(false);
  const G = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 50 }, waveKillLog: killLog('a', 4, 97) });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx);
  check('E3e gate off: base ran', ctx.baseDailyCalls === 1);
  check('E3e gate off: no verbs', G._calls.shelter.length === 0 && G._calls.healCheck.length === 0);
  check('E3e gate off: no shield, no trace', !G.state.village.shielded.a && !(ctx.vsTrace || []).length);
  setVS(true);
}

// E3f: window lapse releases
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 50 }, waveKillLog: killLog('a', 4, 97), medic: true });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx);
  check('E3f day1 sheltered+shielded', !!G.state.village.sheltered.a && !!G.state.village.shielded.a);
  G.state.scholar.day = 120; // kill now 23d old — window lapsed
  G.state.village.health.a = 100;
  p.daily(G, ctx);
  check('E3f lapse: shield cleared', !G.state.village.shielded.a);
  check('E3f lapse: shelter released', !G.state.village.sheltered.a && G._calls.release.includes('a'));
  const ta = traceActions(ctx);
  check('E3f lapse: trace unshield/release', ta.includes('unshield') && ta.includes('release'), ta.join(','));
}

// E3g: the chair — blooded vid becomes scholar
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 50 }, waveKillLog: killLog('a', 4, 97), medic: true });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx);
  check('E3g day1 protected', !!G.state.village.shielded.a);
  G.villagerId = 'a'; // the mantle moved to the blooded vid
  p.daily(G, ctx);
  check('E3g chair: shield cleared', !G.state.village.shielded.a);
  check('E3g chair: shelter released', !G.state.village.sheltered.a);
  const ta = traceActions(ctx);
  check('E3g chair: trace chair/chair-release', ta.includes('unshield') && ta.includes('chair-release'), ta.join(','));
  check('E3g chair: scholar never sheltered', !G._calls.shelter.includes('s1'));
}

// E3h: muster active — no new shelter, no release of mine
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 50 }, waveKillLog: killLog('a', 4, 97), medic: true });
  const p = wrapped(); const ctx = {};
  p.daily(G, ctx); // day1: sheltered by the layer
  check('E3h day1 sheltered', !!G.state.village.sheltered.a);
  G.state.village.shelterMustered = { since: 101, threat: 'test' };
  G.state.village.health.a = 100;
  G.state.scholar.day = 101;
  const relBefore = G._calls.release.length;
  p.daily(G, ctx); // muster active: release deferred
  check('E3h muster: release deferred', G._calls.release.length === relBefore && !!G.state.village.sheltered.a);
  const G2 = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 50 }, waveKillLog: killLog('a', 4, 97), muster: true });
  const ctx2 = {};
  p.daily(G2, ctx2); // muster active from the start: no new shelter
  check('E3h muster: no new shelter', G2._calls.shelter.length === 0);
}

// E3i: expedition escort
{
  setVS(true);
  const G = stubGame({ day: 100, roster: ['s1', 'a', 'b', 'c'], health: { a: 100, b: 100, c: 100 }, waveKillLog: killLog('a', 4, 97) });
  const p = wrapped(); const ctx = {};
  p.setup(G, ctx);
  check('E3i wrap installed when on', !!G.__vsExpeditionWrapped);
  G.startExpedition('a', 4, 4, true);
  const v = G.state.village, a = G.agencyState();
  check('E3i blooded departed', !!(v.away.a && v.away.a.purpose === 'expedition'));
  check('E3i escort departed', !!(v.away.b && v.away.b.purpose === 'expedition'), JSON.stringify(Object.keys(v.away)));
  check('E3i escort same expedition', !!(a.exped.b && a.exped.b.tx === a.exped.a.tx && a.exped.b.ty === a.exped.a.ty && a.exped.b.escortFor === 'a'),
    JSON.stringify(a.exped.b));
  check('E3i escort trace+beat', traceActions(ctx).includes('escort') && G._said.some(s => s.includes('🎒')));
  // no eligible escort -> escort-none
  const G2 = stubGame({ day: 100, roster: ['s1', 'a'], health: { a: 100 }, waveKillLog: killLog('a', 4, 97) });
  const p2 = wrapped(); const ctx2 = {};
  p2.setup(G2, ctx2);
  G2.startExpedition('a', 4, 4, true);
  check('E3i escort-none traced', traceActions(ctx2).includes('escort-none'));
  // gate off -> no wrap
  setVS(false);
  const G3 = stubGame({ day: 100, roster: ['s1', 'a', 'b'], health: { a: 100, b: 100 }, waveKillLog: killLog('a', 4, 97) });
  const p3 = wrapped(); const ctx3 = {};
  const before = G3.startExpedition;
  p3.setup(G3, ctx3);
  check('E3i gate off: no wrap', G3.startExpedition === before && !G3.__vsExpeditionWrapped);
  setVS(true);
}

// ---------- E4: real-stack 180d + D2 ----------
{
  const r1 = detRun(65511, 'lead', 'armed', 180, true);
  const r2 = detRun(65511, 'lead', 'armed', 180, true);
  check('E4 180d armed completes', r1.days > 0, JSON.stringify(r1));
  check('E4 D2 deterministic re-run', r1.digest === r2.digest, `${r1.digest} vs ${r2.digest}`);
}

// ---------- E5: real Game behavior ----------
{
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  (async () => {
    const { Game } = await loadGame({ seed: 65511, mode: 'vetrestage-e5', fullTelemetry: false });
    await setupGame(Game);
    const v = Game.state.village || {};
    const scholar = Game.villagerId;
    const cand = (v.roster || []).find(id => id !== scholar && !(v.away && v.away[id]));
    if (!cand) { check('E5 real-Game blooded vid found', false, 'no candidate'); return; }
    const day = (((Game.state || {}).scholar || {}).day | 0) || 1;
    Game.state.waveKillLog = Game.state.waveKillLog || [];
    Game.state.waveKillLog.push({ d: day, mid: 'm_test', w: 4, by: cand, via: 'strike', trick: null });
    const pol = VS.armedFor('leadfeast');
    const ctx = {};
    await quietLog(async () => { if (pol.setup) pol.setup(Game, ctx); pol.daily(Game, ctx); });
    check('E5 real-Game shield set', !!((Game.state.village || {}).shielded || {})[cand]);
    check('E5 real-Game trace', (ctx.vsTrace || []).some(t => t.vid === cand && t.action === 'shield'));
  })().then(() => {
    console.log(`\nvetrestage proof: ${pass} PASS, ${fail} FAIL`);
    process.exit(fail ? 1 : 0);
  }).catch(e => { console.error('E5 FAILED:', (e && e.stack) || e); process.exit(1); });
}
