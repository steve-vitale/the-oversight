#!/usr/bin/env node
// test-nowinwindow-20261021.js — proof for the sim-nowinwindow no-win layer
// (arm sim-nowinwindow, axis scale-onramp, backlog #748's named next).
//
// E0 shape: nowinwindow.js exports (layerOn, withNoWin, armedFor); armedFor
//   composes withNoWin OUTSIDE VCE.armedFor; layerOn reads NOWINWINDOW.
// E1 det-gate: NOWINWINDOW unset -> NW.armedFor trajectories byte-identical
//   to VCE.armedFor (the vgearconfirm substrate) on the same seeds, 2
//   policies x 60d, with a noinstr-vs-noinstr stability pre-check.
// E2 RED->GREEN on scripted stubs: (RED) the inner stack's sit proceeds when
//   the layer is off; (GREEN) with NOWINWINDOW=1 every Game.tableTakeSeat
//   call during the inner daily is refused ({ok:false}), the refusal is
//   counted on ctx, and Game.tableTakeSeat is restored afterwards — even
//   when the inner daily throws.
// E3 read-only static scans: the NEW policy source has zero RNG draws, zero
//   Game.state writes, and its only Game.<x> assignment is the
//   tableTakeSeat wrap/restore inside daily; the NEW instrument source has
//   zero RNG draws, zero Game.state writes, and its only Game.<x>
//   assignment is the install-time Game.sleep wrap (inherited from r3).
// E4: a real 60d run through the REAL nowinwindow sweep completes with zero
//   instrument errors and a populated window trace.
// D2: the real sweep re-run is byte-identical (deterministic per-seed JSON).
// Any gate failure = FAIL LOUDLY, no sweep.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        VGEAR=1 KILLDISC=1 NOWINWINDOW=1 node scripts/test-nowinwindow-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] != null) { console.error(`STOP: ${k} must be unset.`); process.exit(2); }
}
// NOTE: NOWINWINDOW is intentionally NOT asserted here — E1 needs it unset
// (deleted in-process for the det-gate section, restored after); E2 toggles
// it per-case; E4/D2 pass it explicitly to the sweep subprocess env.

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const NW = require(path.join(REPO, 'scripts', 'policies', 'nowinwindow'));
const WI = require(path.join(REPO, 'scripts', 'nowinwindow-instrument-20261021'));

const WIN_FIELDS = ['day', 'uw', 'prevUw', 'unlocked', 'raw', 'capped', 'peakRaw', 'peakCapped',
  'r4', 'r5', 'w4faced', 'w5faced', 'veterans5', 'living', 'dead', 'rosterUnknown', 'scholarAlive',
  'rank', 'maxRank', 'invite', 'inviteReady', 'inviteSeat', 'exiled'];

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'nowinwindow-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function freshT() {
  return { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [], firstInviteDay: null };
}

(async () => {
  console.log('== E0 shape: the no-win layer ==');
  {
    check('exports layerOn/withNoWin/armedFor',
      typeof NW.layerOn === 'function' && typeof NW.withNoWin === 'function' && typeof NW.armedFor === 'function');
    check('layerOn reads NOWINWINDOW', (() => {
      const had = process.env.NOWINWINDOW;
      process.env.NOWINWINDOW = '1';
      const on = NW.layerOn() === true;
      delete process.env.NOWINWINDOW;
      const off = NW.layerOn() === false;
      if (had != null) process.env.NOWINWINDOW = had;
      return on && off;
    })());
    const inner = VCE.armedFor('leadfeast');
    const outer = NW.withNoWin(inner, 'test-id', 'test desc');
    check('withNoWin passes id/desc through', outer.id === 'test-id' && outer.desc === 'test desc');
    check('withNoWin preserves base fns', Object.keys(inner).every(k => k in outer || k === 'id' || k === 'desc' || k === 'daily'));
    const a = NW.armedFor('leadfeast');
    check('armedFor ids', a.id === 'lead-nowinwindow', 'got ' + a.id);
    const b = NW.armedFor('belongfeast');
    check('armedFor belong id', b.id === 'belong-nowinwindow', 'got ' + b.id);
    let threw = false;
    try { NW.armedFor('nope'); } catch (e) { threw = true; }
    check('armedFor rejects unknown base', threw);
  }

  console.log('== E1 det-gate: NOWINWINDOW unset -> byte-identical to the vgearconfirm substrate ==');
  const savedNW = process.env.NOWINWINDOW;
  delete process.env.NOWINWINDOW;
  try {
    async function traj(seed, pid, mkPol) {
      const pol = mkPol(pid);
      const Game = await newGame(seed);
      const hs = [];
      const wrapped = Object.assign({}, pol, {
        daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
      });
      await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
      return hs.join('\n');
    }
    let green = 0, total = 0;
    for (const pid of ['leadfeast', 'belongfeast']) {
      let judged = false;
      for (const seed of [65301, 65302, 65303, 65304]) {
        if (judged) break;
        const a = await traj(seed, pid, (p) => NW.armedFor(p));
        const b = await traj(seed, pid, (p) => NW.armedFor(p));
        if (a !== b) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE — skipped`); continue; }
        total++;
        const c = await traj(seed, pid, (p) => VCE.armedFor(p));
        const same = c === a;
        if (same) green++;
        check(`det ${pid} s${seed}: layer-off identical to vgearconfirm substrate`, same, same ? '' : 'DIVERGED');
        judged = true;
      }
      if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 flaky');
    }
    check('E1 det-gate all green', green === total && total > 0, `${green}/${total}`);
  } finally {
    if (savedNW != null) process.env.NOWINWINDOW = savedNW;
  }

  console.log('== E2 RED->GREEN: the seat is refused ==');
  {
    // A stub Game where the table invitation is pending and ready, and the
    // engine sit would succeed. The inner policy plays seatdrive's role: it
    // calls Game.tableTakeSeat() once per daily.
    function stubGame() {
      const calls = { sit: 0 };
      const Game = {
        state: { scholar: { day: 95 } },
        tableTakeSeat() { calls.sit++; return { ok: true, msg: '' }; },
        tablePreview() { return { ready: true, seat: 'lesser' }; },
        _calls: calls,
      };
      return Game;
    }
    const innerPol = {
      id: 'inner-stub', desc: 'stub',
      daily(Game, ctx) {
        const pv = Game.tablePreview();
        if (pv && pv.ready) {
          const r = Game.tableTakeSeat();
          if (r && r.ok) ctx.stubSat = (ctx.stubSat | 0) + 1;
        }
        return null;
      },
    };
    // RED: layer off -> the sit proceeds (the stub records it).
    {
      delete process.env.NOWINWINDOW;
      const Game = stubGame();
      const origSit = Game.tableTakeSeat;
      const pol = NW.withNoWin(innerPol, 't', 't');
      const ctx = {};
      pol.daily(Game, ctx);
      check('RED layer-off: sit proceeds', Game._calls.sit === 1 && ctx.stubSat === 1,
        `sit=${Game._calls.sit} sat=${ctx.stubSat}`);
      check('RED layer-off: verb untouched', Game.tableTakeSeat === origSit);
    }
    // GREEN: layer on -> the sit is refused, counted, verb restored.
    {
      process.env.NOWINWINDOW = '1';
      const Game = stubGame();
      const origSit = Game.tableTakeSeat;
      const pol = NW.withNoWin(innerPol, 't', 't');
      const ctx = {};
      const ret = pol.daily(Game, ctx);
      check('GREEN layer-on: engine sit never called', Game._calls.sit === 0, `sit=${Game._calls.sit}`);
      check('GREEN layer-on: refusal counted', ctx.nwSeatRefusals === 1, `refusals=${ctx.nwSeatRefusals}`);
      check('GREEN layer-on: first-refusal day', ctx.nwFirstRefusalDay === 95, `day=${ctx.nwFirstRefusalDay}`);
      check('GREEN layer-on: verb restored', Game.tableTakeSeat === origSit);
      check('GREEN layer-on: no sit recorded downstream', !ctx.stubSat, `sat=${ctx.stubSat}`);
      void ret;
    }
    // GREEN: restore holds even when the inner daily throws.
    {
      process.env.NOWINWINDOW = '1';
      const Game = stubGame();
      const origSit = Game.tableTakeSeat;
      const boom = NW.withNoWin({
        daily() { Game.tableTakeSeat(); throw new Error('inner boom'); },
      }, 't', 't');
      let threw = false;
      try { boom.daily(Game, {}); } catch (e) { threw = /inner boom/.test(e.message); }
      check('GREEN throw path: inner error propagates', threw);
      check('GREEN throw path: verb restored', Game.tableTakeSeat === origSit);
      check('GREEN throw path: refusal counted before throw', Game._calls.sit === 0, `sit=${Game._calls.sit}`);
    }
    if (savedNW != null) process.env.NOWINWINDOW = savedNW; else delete process.env.NOWINWINDOW;
  }

  console.log('== E3 read-only static scans ==');
  {
    const polSrc = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'nowinwindow.js'), 'utf8');
    check('policy: no Math.random', !/Math\.random/.test(polSrc));
    check('policy: no __policyRandom', !/__policyRandom/.test(polSrc));
    check('policy: no Game.state writes', !/Game\.state\s*(\.\w+)*\s*=[^=]/.test(polSrc), 'assignment found');
    const assigns = (polSrc.match(/Game\.tableTakeSeat\s*=/g) || []).length;
    check('policy: exactly 2 tableTakeSeat assignments (wrap+restore)', assigns === 2, `found ${assigns}`);
    check('policy: restore in finally', /finally\s*\{[^}]*Game\.tableTakeSeat\s*=\s*orig/.test(polSrc));
    const ctxAssigns = polSrc.match(/ctx\.\w+\s*=/g) || [];
    check('policy: ctx writes are only the nw counters',
      ctxAssigns.length > 0 && ctxAssigns.every(a => /ctx\.nw(SeatRefusals|FirstRefusalDay)\s*=/.test(a)),
      JSON.stringify(ctxAssigns));
    const insSrc = fs.readFileSync(path.join(REPO, 'scripts', 'nowinwindow-instrument-20261021.js'), 'utf8');
    const insCode = insSrc.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
    check('instrument: no Math.random', !/Math\.random/.test(insCode));
    check('instrument: no Date.now', !/Date\.now/.test(insCode));
    check('instrument: no Game.state writes', !/Game\.state\s*(\.\w+)*\s*=[^=]/.test(insCode), 'assignment found');
    const sleepAssigns = (insCode.match(/Game\.sleep\s*=/g) || []).length;
    check('instrument: only install-time Game.sleep wrap', sleepAssigns === 2, `found ${sleepAssigns}`);
  }

  console.log('== E4: real 60d run through the REAL nowinwindow sweep ==');
  const EVID1 = '/tmp/nowinwindow-proof-evid1';
  const EVID2 = '/tmp/nowinwindow-proof-evid2';
  function runSweep(evid) {
    const env = Object.assign({}, process.env, {
      FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
      SEATDRIVE: '1', VGEAR: '1', KILLDISC: '1', NOWINWINDOW: '1',
      SEEDS: '65301', POLICIES: 'leadfeast', DAYS: '60', EVID: evid,
    });
    delete env.SUCCGRACE; delete env.RAIDDENSITY; delete env.NODEWITNESS; delete env.FULLSEAT;
    execFileSync('node', [path.join(REPO, 'scripts', 'nowinwindow-sweep-20261021.js')],
      { env, cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    return JSON.parse(fs.readFileSync(path.join(evid, 'leadfeast', 's65301.json'), 'utf8'));
  }
  let j1 = null;
  {
    const t0 = Date.now();
    j1 = runSweep(EVID1);
    console.log(`  .. real sweep 60d completed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    check('E4 per-seed JSON written', !!j1 && j1.seed === 65301);
    check('E4 zero instrumentErrors', (j1.instrumentErrors || []).length === 0,
      JSON.stringify((j1.instrumentErrors || []).slice(0, 3)));
    check('E4 window trace populated', (j1.window || []).length > 0, `n=${(j1.window || []).length}`);
    check('E4 window fields complete (incl invite/exiled)',
      (j1.window || []).every(w => WIN_FIELDS.every(f => f in w)), 'field missing');
    check('E4 firstInviteDay present-or-null', j1.firstInviteDay == null || Number.isFinite(j1.firstInviteDay),
      `firstInviteDay=${j1.firstInviteDay}`);
    check('E4 no win under NOWINWINDOW=1', j1.won === 0, `won=${j1.won}`);
    check('E4 winTrack null', j1.winTrack == null, JSON.stringify(j1.winTrack));
  }

  console.log('== D2: deterministic re-run byte-identical ==');
  {
    const j2 = runSweep(EVID2);
    const s1 = fs.readFileSync(path.join(EVID1, 'leadfeast', 's65301.json'), 'utf8');
    const s2 = fs.readFileSync(path.join(EVID2, 'leadfeast', 's65301.json'), 'utf8');
    check('D2 re-run byte-identical', s1 === s2,
      s1 === s2 ? '' : `byte lengths ${s1.length} vs ${s2.length}`);
    void j2;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH: ' + (e && e.stack || e)); process.exit(2); });
