#!/usr/bin/env node
// scripts/sweep-tworung-20261015.js — TWO-RUNG BIND RE-MEASUREMENT + NATIONAL
// HOLD-DURATION diagnostic (sim-tworung2, 2026-10-15, scale-onramp axis).
//
// INSTRUMENT-ONLY: wraps each policy's daily hook with READ-ONLY samplers
// (food-coupling-20261013 + scale-repro-20261013 + tworung-lib-20261015 +
// a say/sysSay beat ring). Zero src/js changes, zero policy behavior
// changes. Trajectory-neutrality is PROVEN in
// scripts/test-tworung-20261015.js (instrument ON/OFF byte-identical 60d,
// seed 33 leadfeast; naive-probe RED shows the hash IS sensitive).
//
// Substrate (the scale-wall courtship road, per claim fleshout-a-20261015T0830Z):
//   FOURTHLINK=1      -> scripts/policies/fourthlink.js  (id 'fourthlink', courtship)
//   FEASTSCALE_R13=1  -> scripts/policies/feastscale.js  (ids 'leadfeast', 'belongfeast')
// 8 seeds (11/22/33/44/55/66/77/88), 180d death-aware, current tip.
// No before/after: this is a diagnostic sweep, one side only — the suite IS
// the current-tip baseline (CONTROL BASELINE DRIFT #247).
//
// Answers, per run:
//   - the wave-4 rung bin on the current tip: blood/faced-rung | scale-rung
//     | both | neither (best-ever progress; sub-attribution included), plus
//     waveUnlockReady(4/5) faced state and the faced deferral's bite
//   - the wave-5 non-unlock attribution: cap-hold | defer5-hold |
//     raw-shortfall | unlocked | unexplained
//   - national hold-duration + hold-loss attribution: holdDays, lossDay,
//     lossMode (link-break / village-death / tribute-collapse /
//     succession-exile / held-to-end / unattributed), with engine beats
//   - wall numbers every run: national / table / wins, wave 4-5 unlocks,
//     median survival, death-cause shares
//   - sense-test beats: say-lines around wave-4 unlock and national loss
//
// Env:
//   FOURTHLINK=1 FEASTSCALE_R13=1 node scripts/sweep-tworung-20261015.js
//   SMOKE=1 ...  — instrument-honesty gate (15d/policy, asserts named
//                   exports unwrap, samples collect, no policy-less runs)
//   SEEDS="11,22" POLICIES="leadfeast" DAYS=180 OUT=... PERSEED_DIR=...
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const TW = require('./tworung-lib-20261015');

const FOURTHLINK = process.env.FOURTHLINK === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
if (!FOURTHLINK || !R13) {
  console.error('TWORUNG FATAL: FOURTHLINK=1 and FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

// NAMED-EXPORT policy unwrap — the suite must never run policy-less.
const { fourthlink } = require('./policies/fourthlink');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICY_REGISTRY = { fourthlink, leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`TWORUNG FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

const BEAT_RE = /wave 4|mirror draft|wave 5|producers|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty/i;

function attachBeats(Game, t) {
  t.beats = [];
  // RING BUFFER (2026-10-15): the old 600-cap starved late windows — long
  // runs fill it with early raid/starving/tribute beats and wave-4/5 unlock
  // or national-loss beats at d100+ were dropped. Keep the last 4000.
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 400) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 60),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

// tribute arrears surge before a loss day (engine truth for 'tribute-collapse').
function arrearsSpike(daily, lossDay) {
  try {
    const win = (daily || []).filter(r => r.day >= lossDay - 7 && r.day <= lossDay && r.links);
    if (win.length < 2) return null;
    const sumArr = (r) => (r.links || []).reduce((t, l) => t + (l.arrears || 0), 0);
    const before = sumArr(win[0]), after = sumArr(win[win.length - 1]);
    if (after - before > 2000) return `home-link arrears ${Math.round(before)} -> ${Math.round(after)} kcal in the 7d before loss day ${lossDay}`;
    return null;
  } catch (e) { return null; }
}

function familyOf(cause) {
  let c = String(cause || '?').toLowerCase();
  c = c.replace(/^(player|villager|monster|person):/, '');
  if (/ad break|buffering|spool|chorus|gavel|redactor|callback|moderator|static|grief|counselor|paparazzo|heckler|understudy|landlord|inspiration|nostalgia|warranty|eater|congregation|strike|influencer|audit|reunion|suburb|eulogy|algorithm|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network/i.test(c)) return 'monster';
  return c.split(' ')[0].slice(0, 28) || '?';
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'tworung-' + pid });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const track = TW.newStandingTrack();
  const latches = { w4: null, w5: null };

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    // Sample AFTER the policy's own daily (the day's actions are reflected).
    // NOTE: never `return origDaily(...)` here — the early return skips the
    // sampler entirely (caught by the SMOKE gate, 2026-10-15).
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
    try {
      const s = TW.standingSample(G);
      TW.trackStanding(track, s);
      const uw = s.unlockedWave;
      if (uw >= 4 && !latches.w4) {
        latches.w4 = { day: s.day, sample: JSON.parse(JSON.stringify(s)) };
      }
      if (uw >= 5 && !latches.w5) {
        latches.w5 = { day: s.day, sample: JSON.parse(JSON.stringify(s)) };
      }
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;

  const row = Object.assign(
    { policy: pid, seed, days: daysRan, endReason: result.endReason },
    fc.finalize(Game, m, result),
    sr.finalizeScale(Game, m)
  );

  // ---- rung-bin attribution (best-ever progress) ----
  const bin4 = TW.rungBin4(track);
  const bin5 = TW.rungBin5(track);
  row.rungBin4 = bin4.bin; row.rungBin4Sub = bin4.sub;
  row.rungBin5 = bin5.bin; row.rungBin5Sub = bin5.sub;
  row.standingBest = {
    raw: track.bestRaw, rawDay: track.bestRawDay, war: track.bestWar, dip: track.bestDip,
    plenty: track.bestPlenty, warPts: track.bestWarPts, links: track.bestLinks, feasts: track.bestFeasts,
    faced3: track.bestFaced3, faced4: track.bestFaced4, peak: track.peak, maxWave: track.maxWave, n: track.n,
  };
  row.w4UnlockDay = latches.w4 ? latches.w4.day : null;
  row.w5UnlockDay = latches.w5 ? latches.w5.day : null;
  // the unlock-day gate state (the unlock DRIVER) — persisted, not just latched
  row.w4UnlockSample = latches.w4 ? latches.w4.sample : null;
  row.w5UnlockSample = latches.w5 ? latches.w5.sample : null;

  // ---- national hold-duration + loss attribution ----
  const daily = m.scale.daily || [];
  const exiledRow = daily.find(r => r.exiled);
  const hold = TW.nationalHold(daily, {
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    endReason: result.endReason, finalDay: daysRan,
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
    arrearsSpike: null, // computed after lossDay known
    // person/scholar death days for the succession-collapse mode
    deathDays: (t.deaths || []).map(d => ({ day: d.day, kind: d.kind, name: d.name, cause: d.cause })),
  });
  if (hold.reached && hold.lossDay != null) {
    const spike = arrearsSpike(daily, hold.lossDay);
    if (spike && hold.lossMode === 'unattributed') {
      hold.lossMode = 'tribute-collapse';
      hold.lossEvidence = [spike];
    }
  }
  row.nationalHold = hold;
  row.nationalFirstDay = hold.reached ? hold.firstDay : null;

  // national-scale tribute/proposals/tends (day >= nationalFirstDay)
  const nf = hold.reached ? hold.firstDay : null;
  if (nf != null) {
    row.tributePostNatK = +((m.scale.tributes || []).filter(x => x.day >= nf).reduce((tt, x) => tt + (x.kcal || 0), 0) / 1000).toFixed(1);
    row.proposalsPostNat = (m.scale.proposals || []).filter(x => x.day >= nf).length;
    row.tendsPostNat = (m.scale.tends || []).filter(x => x.day >= nf).length;
    row.linksSeasonedAtNat = (m.scale.daily || []).filter(r => r.day >= nf)
      .map(r => (r.links || []).filter(l => l.age >= 30 && l.trust >= 40).length);
    row.linksSeasonedAtNatMax = Math.max(0, ...row.linksSeasonedAtNat);
    delete row.linksSeasonedAtNat;
  }

  // ---- death-cause shares ----
  const shares = {}, fam = {};
  for (const d of t.deaths) {
    const k = (d.kind || '?') + ':' + (d.cause || '?').split(' ')[0].slice(0, 28);
    shares[k] = (shares[k] || 0) + 1;
    const f = (d.kind || '?') + ':' + familyOf(d.cause);
    fam[f] = (fam[f] || 0) + 1;
  }
  row.deathKinds = Object.entries(shares).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}=${v}`);
  row.deathFam = Object.entries(fam).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}=${v}`);
  row.nDeaths = t.deaths.length;
  row.peopleDeaths = t.deaths.filter(d => /person|villager|player/i.test(d.kind || '')).length;

  // ---- sense-test beats: around wave-4 unlock and national loss ----
  const near = (d, lo, hi) => d >= lo && d <= hi;
  const beatCtx = [];
  if (latches.w4) beatCtx.push({ ctx: 'w4-unlock', day: latches.w4.day, lo: latches.w4.day - 2, hi: latches.w4.day + 2 });
  if (latches.w5) beatCtx.push({ ctx: 'w5-unlock', day: latches.w5.day, lo: latches.w5.day - 2, hi: latches.w5.day + 2 });
  if (hold.reached && hold.lossDay != null) beatCtx.push({ ctx: 'national-loss', day: hold.lossDay, lo: hold.lossDay - 3, hi: hold.lossDay + 3 });
  if (hold.reached && hold.endState === 'held-to-end') beatCtx.push({ ctx: 'national-held-end', day: hold.lastNatDay, lo: hold.firstDay, hi: hold.lastNatDay });
  row.beatCtx = beatCtx;
  row.beats = {};
  for (const c of beatCtx) {
    row.beats[c.ctx] = (t.beats || []).filter(b => near(b.day, c.lo, c.hi)).slice(0, 40);
  }

  // trim heavy arrays from the persisted row
  delete row.dailyCurve;

  return { row, trackSamples: track.samples };
}

async function runSweep(opts) {
  opts = opts || {};
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'fourthlink,leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const smoke = !!process.env.SMOKE;
  const rows = [];
  for (const pid of policyIds) {
    for (const seed of seeds) {
      const sd = smoke ? 15 : days;
      const { row, trackSamples } = await oneRun(seed, pid, sd);
      rows.push(row);
      if (smoke) {
        if (!row.standingBest || row.standingBest.n < 10) {
          console.error(`SMOKE FAIL: ${pid} s${seed} collected ${row.standingBest && row.standingBest.n} standing samples — instrument not sampling.`);
          process.exit(3);
        }
      }
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} wave=${row.maxWave} ` +
        `w4unlock=${row.w4UnlockDay == null ? '-' : 'd' + row.w4UnlockDay} bin4=${row.rungBin4} ` +
        `nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay + ' hold' + (row.nationalHold.holdDays || 0) + 'd/' + (row.nationalHold.lossMode || '?')} ` +
        `rank=${row.rank} ppl=${row.peopleDeaths}`);
    }
  }
  return { rows };
}

function summarize(rows) {
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const runs = rows.length;
  const nonUnlock4 = rows.filter(r => r.w4UnlockDay == null);
  const BINS = ['blood/faced-rung', 'scale-rung', 'both', 'neither'];
  const binCounts = {};
  for (const r of nonUnlock4) binCounts[r.rungBin4] = (binCounts[r.rungBin4] || 0) + 1;
  // attributed = lands in a named bin with a real (non-anomaly) sub
  const attributed4 = nonUnlock4.filter(r => BINS.includes(r.rungBin4) && !/^unexplained/.test(r.rungBin4Sub || ''));
  const nonUnlock5 = rows.filter(r => r.w4UnlockDay != null && r.w5UnlockDay == null);
  const bin5Counts = {};
  for (const r of nonUnlock5) bin5Counts[r.rungBin5] = (bin5Counts[r.rungBin5] || 0) + 1;
  const natRuns = rows.filter(r => r.nationalHold && r.nationalHold.reached);
  const holdDays = natRuns.map(r => r.nationalHold.holdDays || 0);
  const lossModes = {};
  for (const r of natRuns) lossModes[r.nationalHold.lossMode] = (lossModes[r.nationalHold.lossMode] || 0) + 1;
  return {
    runs,
    national: natRuns.length,
    table: agg(r => r.table),
    wins: agg(r => r.won),
    w4Unlocks: agg(r => r.w4UnlockDay != null ? 1 : 0),
    w5Unlocks: agg(r => r.w5UnlockDay != null ? 1 : 0),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(0, ...rows.map(r => r.days)),
    peopleDeaths: agg(r => r.peopleDeaths || 0),
    starveDays: agg(r => r.starveDays || 0),
    vests: agg(r => r.vests),
    // rung-bin attribution (the PRIMARY diagnostic)
    wave4NonUnlocks: nonUnlock4.length,
    rungBin4Counts: binCounts,
    rungBin4Coverage: nonUnlock4.length ? +(attributed4.length / nonUnlock4.length).toFixed(3) : 1,
    wave5NonUnlocks: nonUnlock5.length,
    rungBin5Counts: bin5Counts,
    // national hold-duration
    nationalHoldDays: holdDays,
    nationalHoldMed: med(holdDays),
    nationalLossModes: lossModes,
    // faced-deferral bite
    deferralBite: rows.map(r => ({ policy: r.policy, seed: r.seed, w4: r.w4UnlockDay, faced3: r.standingBest.faced3, raw: r.standingBest.raw, bin4: r.rungBin4 })),
  };
}

if (require.main === module) {
  (async () => {
    // hrtime, not Date.now: the harness runs a deterministic clock.
    const t0 = process.hrtime.bigint();
    const rep = await runSweep({});
    const s = summarize(rep.rows);
    const el = Number(process.hrtime.bigint() - t0) / 1e9;
    console.log(`\n=== tworung (${el.toFixed(0)}s) === runs=${s.runs}`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} wins ${s.wins}/${s.runs} w4 ${s.w4Unlocks}/${s.runs} w5 ${s.w5Unlocks}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays}`);
    console.log(`rung-bin4 (${s.wave4NonUnlocks} non-unlocks): ${JSON.stringify(s.rungBin4Counts)} coverage=${s.rungBin4Coverage}`);
    console.log(`rung-bin5 (${s.wave5NonUnlocks} w4-unlocked non-w5): ${JSON.stringify(s.rungBin5Counts)}`);
    console.log(`national hold-days: [${s.nationalHoldDays.join(',')}] med=${s.nationalHoldMed} lossModes=${JSON.stringify(s.nationalLossModes)}`);
    console.log(`peopleDeaths ${s.peopleDeaths} starveDays ${s.starveDays} vests ${s.vests}`);
    const out = process.env.OUT;
    if (out) {
      fs.writeFileSync(out, JSON.stringify({ summary: s, rows: rep.rows }, null, 1));
      console.error('wrote ' + out);
    }
    const psd = process.env.PERSEED_DIR;
    if (psd) {
      fs.mkdirSync(psd, { recursive: true });
      for (const r of rep.rows) {
        fs.writeFileSync(path.join(psd, `${r.policy}-s${r.seed}.json`), JSON.stringify(r, null, 1));
      }
      console.error('wrote per-seed to ' + psd);
    }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep, summarize, oneRun };
