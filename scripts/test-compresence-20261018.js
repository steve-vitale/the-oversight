#!/usr/bin/env node
// test-compresence-20261018.js — proof for the compresence instrument
// (sim-compresence, 2026-10-18, axis scale-onramp).
//
// (a) PRESENCE-CHANNEL FIXTURES: attributeChannel on synthetic fight
//     histories — all six channels (a-f) plus the party-in-radius anomaly.
// (b) DET-GATE: COMPRESENCE instrument installed vs not — byte-identical
//     60d trajectories (stable-seed pre-check, dayHash; mirrors the
//     killdisc proof's det-gate).
// (c) SMOKE: both policies record presence on live runs (wave-3 fight
//     fixture under each policy; zero instrument errors).
// (d) ATTRIBUTION COMPLETENESS: on the real sweep
//     (evidence/2026-10-18/perseed-compresence/) every wave-3 killing fight
//     carries a channel in a-f plus mechanism evidence. Skips cleanly
//     (INFO-SKIP, exit 0) if the sweep hasn't run yet.
//
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//      WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (the pre-seat substrate).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const CP = require(path.join(REPO, 'scripts', 'compresence-instrument-20261018'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }
if (!CP.instrumentOn() && process.env.COMPRESENCE !== '1') {
  console.error('NOTE: COMPRESENCE=1 not set — (a) fixtures still run; (b)/(c) need it. Setting is required for the full proof.');
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function newGame(seed, mode) {
  const { Game } = await loadGame({ seed, mode: mode || 'compresence-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function w3mid(Game) {
  const m = ((Game.data || {}).monsters || []).find(x => x && (x.wave | 0) === 3);
  return m ? m.id : null;
}

(async () => {
  console.log('== (a) PRESENCE-CHANNEL FIXTURES (pure) ==');
  const mkJoiner = (vid, name, dist, dmg) => ({
    vid, name, ai: 'brave', weapon: 3, armor: 0,
    grid: { mx: 4, my: 4 }, distToMonsters: { m0: dist }, hp: 100, maxHp: 100, fled: false,
  });
  const mkKill = (vidDists, dmgByVid) => ({
    killedMonster: { key: 'm0', mid: 'redactor', grid: { mx: 5, my: 5 } },
    joinerDists: vidDists || {}, dmg: { byVid: dmgByVid || {} },
  });
  {
    // (a) present-in-range
    const start = { joiners: [mkJoiner('v1', 'Nora', 1)], rosterSize: 3, partyVids: [], nonjoiners: [] };
    const r = CP.attributeChannel(start, mkKill({ v1: 1 }, { v1: 142 }));
    check('fixture (a) present-in-range', r.channel === 'a', JSON.stringify(r.channel));
    check('fixture (a) names AI mode + damage', r.evidence.joiners[0].ai === 'brave' && r.evidence.joiners[0].dmg === 142, JSON.stringify(r.evidence.joiners[0]));
  }
  {
    // (a) via fight-start dist when kill-time missing
    const start = { joiners: [mkJoiner('v1', 'Nora', 0)], rosterSize: 3, partyVids: [], nonjoiners: [] };
    const r = CP.attributeChannel(start, { killedMonster: { key: 'm0' }, joinerDists: {}, dmg: { byVid: {} } });
    check('fixture (a) via fight-start dist fallback', r.channel === 'a', JSON.stringify(r.channel));
  }
  {
    // (b) present-but-far
    const start = { joiners: [mkJoiner('v1', 'Nora', 5), mkJoiner('v2', 'Ugur', 3)], rosterSize: 4, partyVids: [], nonjoiners: [] };
    const r = CP.attributeChannel(start, mkKill({ v1: 5, v2: 3 }, {}));
    check('fixture (b) present-far', r.channel === 'b', JSON.stringify(r.channel));
    check('fixture (b) lists both joiners', (r.evidence.joiners || []).length === 2, '');
  }
  {
    // (c) party-not-in-fight + where evidence + anomaly probe
    const start = {
      joiners: [], rosterSize: 4, partyVids: ['v2'],
      nonjoiners: [
        { vid: 'v2', name: 'Kai', inParty: true, sameNode: false, node: { nx: 5, ny: 4 }, gridDist: null, atHavenNode: false, side: null, sideMatch: null },
        { vid: 'v3', name: 'Mei', inParty: false, sameNode: false, node: { nx: 3, ny: 4 }, gridDist: null, atHavenNode: false, side: null, sideMatch: null },
      ],
    };
    const r = CP.attributeChannel(start, mkKill({}, {}));
    check('fixture (c) party-not-in-fight', r.channel === 'c', JSON.stringify(r.channel));
    check('fixture (c) where-evidence names node', r.evidence.party[0].node.nx === 5, JSON.stringify(r.evidence.party[0]));
    check('fixture (c) anomaly probe empty (party far)', (r.evidence.partyInRadiusNotJoined || []).length === 0, '');
  }
  {
    // (c) anomaly: party member within join radius who did not join
    const start = {
      joiners: [], rosterSize: 4, partyVids: ['v2'],
      nonjoiners: [
        { vid: 'v2', name: 'Kai', inParty: true, sameNode: true, node: { nx: 4, ny: 4 }, gridDist: 2, atHavenNode: true, side: 'outside', sideMatch: true },
      ],
    };
    const r = CP.attributeChannel(start, mkKill({}, {}));
    check('fixture (c) anomaly flags in-radius non-joiner', r.channel === 'c' && (r.evidence.partyInRadiusNotJoined || []).length === 1, JSON.stringify(r.evidence.partyInRadiusNotJoined));
  }
  {
    // (d) all-dead
    const start = { joiners: [], rosterSize: 0, partyVids: [], nonjoiners: [], rosterStart: 12 };
    const r = CP.attributeChannel(start, mkKill({}, {}));
    check('fixture (d) all-dead', r.channel === 'd' && r.evidence.rosterStart === 12, JSON.stringify(r));
  }
  {
    // (e) elsewhere
    const start = {
      joiners: [], rosterSize: 3, partyVids: [],
      nonjoiners: [
        { vid: 'v2', name: 'Kai', inParty: false, sameNode: false, node: { nx: 6, ny: 4 }, gridDist: null, atHavenNode: false, side: null, sideMatch: null },
        { vid: 'v3', name: 'Mei', inParty: false, sameNode: false, node: { nx: 2, ny: 5 }, gridDist: null, atHavenNode: false, side: null, sideMatch: null },
      ],
      scholar: { node: { nx: 4, ny: 4 }, atHaven: true },
    };
    const r = CP.attributeChannel(start, mkKill({}, {}));
    check('fixture (e) elsewhere', r.channel === 'e', JSON.stringify(r.channel));
    check('fixture (e) node distribution recorded', r.evidence.nodeDist && r.evidence.nodeDist['6,4'] === 1, JSON.stringify(r.evidence.nodeDist));
  }
  {
    // (f) solo-by-rule: companions on the node but beyond the radius
    const start = {
      joiners: [], rosterSize: 2, partyVids: [],
      nonjoiners: [
        { vid: 'v2', name: 'Kai', inParty: false, sameNode: true, node: { nx: 4, ny: 4 }, gridDist: 6, atHavenNode: true, side: 'inside', sideMatch: false },
        { vid: 'v3', name: 'Mei', inParty: false, sameNode: true, node: { nx: 4, ny: 4 }, gridDist: 7, atHavenNode: true, side: 'outside', sideMatch: true },
      ],
    };
    const r = CP.attributeChannel(start, mkKill({}, {}));
    check('fixture (f) solo-by-rule', r.channel === 'f', JSON.stringify(r.channel));
    check('fixture (f) nearest recorded', (r.evidence.nearest || []).length === 2 && r.evidence.nearest[0].gridDist === 6, JSON.stringify(r.evidence.nearest));
  }

  console.log('== (b) DET-GATE: instrument installed vs not — 60d trajectory ==');
  async function traj(seed, pid, useInstr) {
    const pol = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const G = await newGame(seed);
    const t = { fights: [], kills: [], engagements: [], census: [], dmg: {}, fieldFights: [], instrumentErrors: [] };
    let uninstall = null;
    if (useInstr) uninstall = CP.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let gateGreen = 0, gateTotal = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    let judged = false;
    for (const seed of [94031, 94032, 94033, 94034]) {
      if (judged) break;
      const a = await traj(seed, pid, false);
      const b = await traj(seed, pid, false);
      if (a.hashes !== b.hashes) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE — seed skipped`); continue; }
      gateTotal++;
      const c = await traj(seed, pid, true);
      const same = c.hashes === a.hashes;
      if (same) gateGreen++;
      check(`det ${pid} s${seed} trajectory identical (stable seed)`, same, same ? '' : 'trajectories diverged');
      check(`det ${pid} s${seed} zero instrument errors`, c.t.instrumentErrors.length === 0, JSON.stringify(c.t.instrumentErrors.slice(0, 3)));
      judged = true;
    }
    if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 seeds flaky');
  }
  check('det-gate all green', gateGreen === gateTotal && gateTotal > 0, `${gateGreen}/${gateTotal}`);

  console.log('== (c) SMOKE: presence recording on live wave-3 fights ==');
  for (const pid of ['leadfeast', 'belongfeast']) {
    const Game = await newGame(94040 + (pid === 'leadfeast' ? 0 : 1));
    const mid = w3mid(Game);
    check(`smoke ${pid}: wave-3 monster exists`, !!mid, '');
    const sid = Game.villagerId;
    const roster = (((Game.state || {}).village || {}).roster || []).filter(v => v && v !== sid);
    // Park two villagers next to the scholar (join radius) and one far away.
    try {
      const vv = Game.state.village || (Game.state.village = {});
      vv.positions = vv.positions || {};
      const s = Game.state.scholar || {};
      const smx = s.mx != null ? s.mx : 4, smy = s.my != null ? s.my : 4;
      if (roster[0]) vv.positions[roster[0]] = { mx: smx, my: smy };
      if (roster[1]) vv.positions[roster[1]] = { mx: Math.min(8, smx + 2), my: smy };
      if (roster[2]) vv.positions[roster[2]] = { mx: Math.max(0, smx - 5), my: Math.min(8, smy + 5) };
      // Make sure all three are on the scholar's node.
      vv.nodePos = vv.nodePos || {};
      const hx = vv.px == null ? 4 : vv.px, hy = vv.py == null ? 4 : vv.py;
      const sn = (Game.map && Game.map.px != null) ? { nx: Game.map.px, ny: Game.map.py } : { nx: hx, ny: hy };
      for (const rid of roster.slice(0, 3)) vv.nodePos[rid] = { nx: sn.nx, ny: sn.ny };
    } catch (e) {}
    const t = { fights: [], kills: [], engagements: [], census: [], dmg: {}, fieldFights: [], instrumentErrors: [] };
    t.rosterStart = roster.length;
    const uninstall = CP.install(Game, t);
    try { Game.startCombat(mid); } catch (e) { check(`smoke ${pid}: startCombat runs`, false, String(e && e.message)); }
    const f = Game.tbfight;
    check(`smoke ${pid}: fight started`, !!f, '');
    const snap = t.fights[t.fights.length - 1];
    check(`smoke ${pid}: fight-start snapshot recorded`, !!snap && snap.fightId === (f && f.id), `fights=${t.fights.length}`);
    if (snap) {
      check(`smoke ${pid}: scholar node/grid recorded`, !!(snap.scholar && snap.scholar.node), JSON.stringify(snap.scholar));
      check(`smoke ${pid}: near villagers joined (<=4 rule)`, snap.joiners.length >= 1, `joiners=${snap.joiners.length}`);
      check(`smoke ${pid}: AI modes recorded`, snap.joiners.every(j => j.ai), JSON.stringify(snap.joiners.map(j => j.ai)));
      check(`smoke ${pid}: nonjoiners carry where-data`, snap.nonjoiners.length > 0 && snap.nonjoiners.every(n => n.node && ('sameNode' in n)), `nonjoiners=${snap.nonjoiners.length}`);
      // Kill one monster through the engine path if possible, else direct.
      const mkey = (f.fighters.find(x => x.kind === 'monster') || {}).key;
      if (mkey) {
        try {
          const mf = Game.tbFighter(mkey);
          if (mf) { mf.hp = 1; Game.tbDamage(mkey, 9999, 'you', null, { quiet: true }); }
        } catch (e) {}
        Game.recordWaveKill(mid, sid, 'player', null);
        const k = t.kills[t.kills.length - 1];
        check(`smoke ${pid}: kill attributed a channel`, !!k && /^[abcdef]$/.test(k.channel), `channel=${k && k.channel}`);
        check(`smoke ${pid}: kill carries damage table`, !!(k && k.dmg), '');
      }
    }
    check(`smoke ${pid}: zero instrument errors`, t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors.slice(0, 3)));
    try { uninstall(); } catch (e) {}
  }

  console.log('== (d) ATTRIBUTION COMPLETENESS on the real sweep ==');
  const EVID = path.join(REPO, 'evidence', '2026-10-18', 'perseed-compresence');
  if (!fs.existsSync(EVID)) {
    console.log('  INFO-SKIP: no perseed-compresence dir yet — run the sweep, then re-run this test.');
  } else {
    const files = fs.readdirSync(EVID).filter(x => x.endsWith('.json') && !x.startsWith('_'));
    if (!files.length) {
      console.log('  INFO-SKIP: perseed-compresence empty — run the sweep, then re-run this test.');
    } else {
    let kills = 0, attributed = 0, withEvidence = 0;
    const chanCounts = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, x: 0 };
    for (const fn of files) {
      let row = null;
      try { row = JSON.parse(fs.readFileSync(path.join(EVID, fn), 'utf8')); } catch (e) { continue; }
      for (const k of (row.kills || [])) {
        kills++;
        if (/^[abcdef]$/.test(k.channel)) attributed++;
        if (k.channelNote && k.channelEvidence) withEvidence++;
        if (k.channel in chanCounts) chanCounts[k.channel]++;
      }
    }
    check('completeness: files present', files.length > 0, `files=${files.length}`);
    check('completeness: every wave-3 kill attributed a-f', attributed === kills && kills > 0, `${attributed}/${kills}`);
    check('completeness: every attributed kill has mechanism evidence', withEvidence === kills && kills > 0, `${withEvidence}/${kills}`);
    console.log('  channel counts: ' + JSON.stringify(chanCounts));
    }
  }

  console.log(`\nRESULT: ${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e && e.stack || e); process.exit(2); });
