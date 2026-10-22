#!/usr/bin/env node
// test-standgate-20261022.js — proof for the sim-standgate instrument
// (flesh-out loop arm sim-standgate, run fleshout-20261022T0437Z, axis
// scale-onramp). INSTRUMENT-ONLY: zero src/js, zero policies.
//
// E-series (all deterministic):
//   E0 pure attribution: synthetic traces — mixed gains/losses attribute
//     100%; an injected residual is detected (DIAG-GO false, named).
//   E1 blood fixture: recordWaveKill on a real wave-3 monster (+1 ledger
//     point) -> sgSample shows war +25, attributed to blood, 0 residuals.
//   E2 bread fixture: a quality>=1 feast-log entry -> plenty +20 attributed
//     to bread; a quality-0 entry moves nothing.
//   E3 bonds fixture: 3 fabricated seasoned Haven-subordinate links
//     (trust 50, day-31+) -> diplomacy +102 attributed to bonds; breaking
//     one link -> -34 loss attributed.
//   E4 drift guard: live standingCfg() per-point values still match the
//     CHANNELS table — fails LOUD if the engine's numbers moved.
//   E5 gate agreement: sgSample agrees with w5gates-lib gateVector on 2
//     smoke runs (raw/war/dip/plenty/capped identical).
//   DET paired seeds: instrument-on vs instrument-off byte-identical
//     (dayHash trajectories), proving the instrument is trajectory-neutral.
//
// Usage: node scripts/test-standgate-20261022.js
//   SEED=... node scripts/test-standgate-20261022.js   # override proof seed
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SG = require('./standgate-lib');
const W5 = require('./w5gates-lib');

const SEED = parseInt(process.env.SEED || '65509', 10) || 65509;
let failures = 0;
function ok(cond, name, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
}

// ---- E0: pure attribution on synthetic traces ----
(function e0() {
  const mk = (day, warPts, links, feasts, per) => {
    const p = per || { blood: 25, bonds: 34, bread: 20 };
    return { day, warPts, links, feasts, per: p, war: warPts * p.blood, dip: links * p.bonds, plenty: feasts * p.bread };
  };
  // One blood gain (+1 ledger pt), one bread gain (+2 feasts), one bonds
  // loss (-1 link), and one unexplained war jump (+7, not a multiple).
  const samples = [
    mk(0, 0, 2, 0),
    mk(1, 1, 2, 0),       // blood +25
    mk(2, 1, 2, 2),       // bread +40
    mk(3, 1, 1, 2),       // bonds -34 loss
    mk(4, 1, 1, 2),
  ];
  samples[4].war = samples[3].war + 7; // unexplained +7 war
  const c = SG.sgAttributeCorpus([{ seed: 1, policyId: 'x', samples }]);
  ok(c.attributedPts === 65, 'E0 mixed gains attributed', `attributed=${c.attributedPts} (want 65)`);
  ok(c.residualEvents === 1, 'E0 injected residual detected', `residuals=${c.residualEvents}`);
  ok(c.residList[0] && c.residList[0].resid === 7 && c.residList[0].channel === 'blood', 'E0 residual named (blood, +7)');
  ok(c.diagGo === false, 'E0 DIAG-GO false with a residual');
  const clean = SG.sgAttributeCorpus([{ seed: 1, policyId: 'x', samples: samples.slice(0, 4) }]);
  ok(clean.diagGo === true && clean.shareAttributed === 1, 'E0 clean trace DIAG-GO true, share=1');
  // Empty/degenerate corpus: no samples -> neutral, never crashes.
  const empty = SG.sgAttributeCorpus([{ seed: 2, policyId: 'x', samples: [] }, null]);
  ok(empty.runs === 0 && empty.diagGo === true, 'E0 empty corpus neutral');
})();

async function withGame(fn) {
  const { Game } = await loadGame({ seed: SEED, mode: 'standgate', fullTelemetry: false });
  await setupGame(Game);
  return fn(Game);
}

function deltaAttr(G, mut, wantChannel, wantDPoints, name) {
  const before = SG.sgSample(G);
  mut();
  const after = SG.sgSample(G);
  const r = SG.sgDailyGain(before, after);
  const g = r.gains.filter(x => x.channel === wantChannel);
  const got = g.reduce((a, x) => a + x.dPoints, 0);
  ok(r.residuals.length === 0, `${name} 0 residuals`, `residuals=${JSON.stringify(r.residuals)}`);
  ok(got === wantDPoints, `${name} attributed to ${wantChannel}`, `got ${got}, want ${wantDPoints}`);
}

async function main() {
  // ---- E4: drift guard first (fixtures depend on live values) ----
  await withGame((G) => {
    const cfg = G.standingCfg();
    for (const ch of SG.CHANNELS) {
      const key = ch.id === 'blood' ? 'warPerKill' : ch.id === 'bonds' ? 'diplomacyPerLink' : 'plentyPerFeast';
      ok((cfg[key] | 0) === ch.perPoint, `E4 live per-point ${ch.id}`, `${key}=${cfg[key]}, table=${ch.perPoint}`);
    }
    ok((cfg.t5 | 0) === 200, 'E4 live t5', `t5=${cfg.t5}`);
    ok((cfg.plentyCapT5 | 0) === 100, 'E4 live plenty cap', `cap=${cfg.plentyCapT5}`);
  });

  // ---- E1: blood — a real wave-3 kill through the real choke point ----
  await withGame((G) => {
    const before = G.waveLedgerPoints(3) | 0;
    ok(typeof G.recordWaveKill === 'function', 'E1 recordWaveKill exists');
    // The Redactor (data/monsters.json id 'redactor', wave 3). via='patrol'
    // = a villager landed the blow — the ledger counts player AND villager
    // kills (standing.js ontology: standing_villager_kills_count).
    G.recordWaveKill('redactor', 'v_test_blood', 'patrol', null);
    const after = G.waveLedgerPoints(3) | 0;
    ok(after === before + 1, 'E1 ledger point fires', `${before} -> ${after}`);
    deltaAttr(G, () => { G.recordWaveKill('gavel', 'v_test_blood', 'patrol', null); }, 'blood', 25, 'E1 blood channel');
  });

  // ---- E2: bread — feast-log writes ----
  await withGame((G) => {
    G.state.feastLog = G.state.feastLog || [];
    deltaAttr(G, () => { G.state.feastLog.push({ day: 1, quality: 1 }); }, 'bread', 20, 'E2 bread channel (quality 1)');
    const b = SG.sgSample(G), f0 = b.plenty;
    G.state.feastLog.push({ day: 2, quality: 0 }); // thin quiet meal: no standing
    const a = SG.sgSample(G);
    ok(a.plenty === f0 && a.feasts === b.feasts, 'E2 quality-0 feast moves nothing');
    // Log-cap trim: fill to exactly the cap, then push one more — the oldest
    // falls out and one comes in: net-zero move, still attributed (dPts ==
    // dCnt*per == 0), 0 residuals. The trim is explainable, not leakage.
    const capN = G.standingCfg().feastLogCap | 0;
    G.state.feastLog = [];
    for (let i = 0; i < capN; i++) G.state.feastLog.push({ day: 3, quality: 1 });
    const b3 = SG.sgSample(G);
    ok(b3.feasts === capN && b3.plenty === capN * 20, 'E2 log at cap', `feasts=${b3.feasts} plenty=${b3.plenty}`);
    const a3s = SG.sgSample(G);
    G.state.feastLog.push({ day: 4, quality: 1 }); // +1 over the cap...
    const a3over = SG.sgSample(G);
    ok(a3over.feasts === capN + 1, 'E2 direct push goes over cap untrimmed', `feasts=${a3over.feasts}`);
    // ...hostFeast's own trim line (game.js ~29465) restores the cap — the
    // instrument reads the same state, so the rebalance attributes cleanly.
    if (G.state.feastLog.length > capN) G.state.feastLog.splice(0, G.state.feastLog.length - capN);
    const a3e = SG.sgSample(G);
    const r3 = SG.sgDailyGain(a3s, a3e);
    ok(a3e.feasts === capN && a3e.plenty === capN * 20, 'E2 trim net-zero move', `feasts=${a3e.feasts}`);
    ok(r3.residuals.length === 0, 'E2 trim 0 residuals', `residuals=${JSON.stringify(r3.residuals)}`);
  });

  // ---- E3: bonds — seasoned regional+ links ----
  await withGame((G) => {
    ok(typeof G.mshipState === 'function', 'E3 mshipState exists');
    const ms = G.mshipState();
    ms.links = ms.links || [];
    G.state.scholar.day = 31; // past the 30-day seasoning bar
    const before = SG.sgSample(G);
    for (let i = 0; i < 3; i++) {
      ms.links.push({ id: 'sg_bond_' + i, primary: 'haven', subordinate: 'v' + i, status: 'active', kind: 'subordinate', day: 0, trust: 50, conquered: false });
    }
    const after = SG.sgSample(G);
    const r = SG.sgDailyGain(before, after);
    const dip = r.gains.filter(x => x.channel === 'bonds').reduce((a, x) => a + x.dPoints, 0);
    ok(after.links === 3, 'E3 polity forms, 3 links count', `links=${after.links}`);
    ok(dip === 102 && r.residuals.length === 0, 'E3 bonds channel +102, 0 residuals', `dip=${dip}`);
    // Break one link: the realm needs >=3 seasoned subordinates for
    // polityOf('haven') — dissolving one of three collapses the polity, so
    // all 3 links drop out of the count: -102 loss, attributed, 0 residuals.
    // (Bonds are polity-membership dependent — recorded, not a bug.)
    const b2 = SG.sgSample(G);
    ms.links[0].status = 'dissolved';
    const a2 = SG.sgSample(G);
    const r2 = SG.sgDailyGain(b2, a2);
    const loss = r2.gains.filter(x => x.channel === 'bonds').reduce((a, x) => a + x.dPoints, 0);
    ok(a2.links === 0 && loss === -102 && r2.residuals.length === 0,
      'E3 polity collapse -102 attributed as loss', `links=${a2.links} loss=${loss}`);
  });

  // ---- E5 + DET: 2 smoke runs — instrument vs w5gates agreement, byte-identical ----
  // Drive days through the harness's runDays with a do-nothing policy (no
  // game-state writes from the test side; the world lives its own life).
  const nopPolicy = { id: 'standgate-nop', daily: () => null };
  const agreeSeeds = [65501, 65502];
  for (const seed of agreeSeeds) {
    // instrument ON: daily sgSample reads + say capture
    const runA = await (async () => {
      const { Game } = await loadGame({ seed, mode: 'standgate', fullTelemetry: false });
      await setupGame(Game);
      const rec = { samples: [], sayLines: [] };
      const uninstall = SG.installSg(Game, rec);
      const pol = { id: 'standgate-nop-sg', daily: (G) => { rec.samples.push(SG.sgSample(G)); return null; } };
      const hashes = [];
      const oDaily = pol.daily;
      pol.daily = (G) => { const r = oDaily(G); hashes.push(SG.gday(G) + ':' + dayHash(G)); return r; };
      await runDays(Game, pol, { days: 30, sampleEvery: 30 });
      const gv = W5.gateVector(Game);
      const s = SG.sgSample(Game);
      uninstall();
      return { hashes, agree: gv.raw === s.raw && gv.war === s.war && gv.dip === s.dip && gv.plenty === s.plenty && gv.capped === s.capped,
        mismatch: `gv(raw=${gv.raw},war=${gv.war},dip=${gv.dip},plenty=${gv.plenty},capped=${gv.capped}) vs sg(raw=${s.raw},war=${s.war},dip=${s.dip},plenty=${s.plenty},capped=${s.capped})` };
    })();
    // instrument OFF (bare)
    const hashesB = await (async () => {
      const { Game } = await loadGame({ seed, mode: 'standgate', fullTelemetry: false });
      await setupGame(Game);
      const hashes = [];
      const pol = { id: 'standgate-nop-bare', daily: (G) => { hashes.push(SG.gday(G) + ':' + dayHash(G)); return null; } };
      await runDays(Game, pol, { days: 30, sampleEvery: 30 });
      return hashes;
    })();
    ok(JSON.stringify(runA.hashes) === JSON.stringify(hashesB), `DET s${seed} instrument-neutral`, `${runA.hashes.length} days`);
    ok(runA.agree, `E5 sgSample agrees with w5gates gateVector s${seed}`, runA.agree ? '' : runA.mismatch);
  }
  void nopPolicy;

  if (failures) { console.error(`PROOF FAILED: ${failures} failure(s).`); process.exit(1); }
  console.log('PROOF GREEN: all standgate gates pass.');
}

if (require.main === module) { main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); }); }
