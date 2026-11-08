// probe-phase4-social-rates-20261108.js — OVE-55 / VILLAGER-BRAIN Phase 4 §8
// Measure-only social rates screen: person bond proposals, link raises, and
// conversations on the documented 16 matched screening seeds ×
// capable/maker/merchant/caregiver.
//
// No Game/runtime edits. No Muse policy/food/Loop B edits. Harness rule:
// one loadGame per process — driver spawns one child per (policy, seed).
//
// Rates count initiations, not response teles:
//   personProposal = person staged (scholar path) OR person accepted/refused
//                    with no prior staged for that pair (NPC↔NPC proposeBond)
//   linkRaise      = link staged
//   conversation   = successful startConvo (truthy return)
// Opportunity vs zero is sampled daily (warm pairs / talkable living /
// lore-eligible link raisers / bondScoreLog picks).
//
// Usage:
//   SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
//     POLICIES=capable,maker,merchant,caregiver DAYS=150 PAR=6 \
//     OUT=evidence/2026-11-08/phase4-social-rates-panel.json \
//     node scripts/probe-phase4-social-rates-20261108.js
//   POLICY=capable SEED=7 DAYS=150 node scripts/probe-phase4-social-rates-20261108.js --one
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const DEFAULT_SEEDS = '7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9';
const DEFAULT_POLICIES = 'capable,maker,merchant,caregiver';

function shaFull() {
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); }
  catch (e) { return 'unknown'; }
}
function sha12() { return shaFull().slice(0, 12); }

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function pairKey(a, b) {
  return a < b ? a + '|' + b : b + '|' + a;
}

function install(Game) {
  const t = {
    bondTele: [],
    personInitiations: [],
    linkInitiations: [],
    conversations: [],
    daily: [],
    bondScorePicks: Object.create(null),
    instrumentErrors: [],
    wrapCounts: Object.create(null),
  };
  const orig = {};
  const pendingPersonStage = Object.create(null);
  let scoreLogCursor = 0;

  function err(where, e) {
    try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 140)); }
    catch (e2) {}
  }
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }

  function livingRoster() {
    const me = Game.villagerId;
    const roster = (((Game.state || {}).village || {}).roster || []).slice();
    const out = [];
    for (let i = 0; i < roster.length; i++) {
      const id = roster[i];
      if (!id || id === me) continue;
      let dead = false;
      try {
        const p = Game.getPerson ? Game.getPerson(id) : null;
        if (p && p.dead) dead = true;
      } catch (e) {}
      if (!dead) out.push(id);
    }
    return out;
  }

  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'bond_proposed' && data && typeof data === 'object') {
          count('bond_proposed');
          const kind = data.kind || 'person';
          const outcome = data.outcome || null;
          const initiator = data.initiator || null;
          const target = data.target || null;
          const day = dayOf(Game);
          const row = {
            day: day,
            kind: kind,
            outcome: outcome,
            initiator: initiator,
            target: target,
            chance: data.chance == null ? null : data.chance,
            reason: data.reason == null ? null : data.reason,
          };
          t.bondTele.push(row);

          if (kind === 'link' && outcome === 'staged') {
            t.linkInitiations.push(row);
          } else if (kind === 'person') {
            const pk = (initiator && target) ? pairKey(initiator, target) : null;
            if (outcome === 'staged') {
              if (pk) pendingPersonStage[pk] = day;
              t.personInitiations.push(Object.assign({ initiation: 'staged' }, row));
            } else if (outcome === 'accepted' || outcome === 'refused') {
              if (pk && pendingPersonStage[pk] != null) {
                delete pendingPersonStage[pk];
                // response to a prior scholar-staged proposal — not a new initiation
              } else {
                t.personInitiations.push(Object.assign({ initiation: 'npc_propose' }, row));
              }
            } else if (outcome === 'expired' && pk) {
              delete pendingPersonStage[pk];
            }
          }
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else {
    err('install.tele', new Error('missing'));
  }

  if (typeof Game.startConvo === 'function') {
    orig.startConvo = Game.startConvo;
    Game.startConvo = function (vid) {
      count('startConvo');
      let st = null;
      try { st = orig.startConvo.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        t.conversations.push({
          day: dayOf(Game),
          vid: vid || null,
          ok: !!st,
          active: !!(st && st.active),
        });
      } catch (e) { err('startConvo-row', e); }
      return st;
    };
  } else {
    err('install.startConvo', new Error('missing'));
  }

  function snapshot() {
    const snap = {
      day: dayOf(Game),
      living: 0,
      warmPairs: 0,
      talkable: 0,
      loreEligible: 0,
      bondScoreLogLen: 0,
      scorePickHist: Object.create(null),
      trustedAnyoneN: 0,
      maxTrust: 0,
    };
    const living = livingRoster();
    snap.living = living.length;
    snap.talkable = living.length;
    try {
      for (let i = 0; i < living.length; i++) {
        for (let j = i + 1; j < living.length; j++) {
          let drive = null;
          try { drive = Game.bondDriveLive && Game.bondDriveLive(living[i], living[j]); }
          catch (e) { drive = null; }
          if (drive && drive.live) snap.warmPairs++;
        }
        // lore-eligible link-raise opportunity (mirrors stageLinkRaise gates loosely)
        try {
          const lore = (Game.villageLoreOf && Game.villageLoreOf(living[i])) || {};
          const known = Object.keys(lore || {});
          let standing = 0;
          try {
            const w = Game.vgoalWeights && Game.vgoalWeights(living[i]);
            standing = (w && w.build_standing) || 0;
          } catch (e2) {}
          if (known.length && standing >= 1) snap.loreEligible++;
        } catch (e) {}
      }
    } catch (e) { err('snapshot.warm', e); }

    try {
      const log = (((Game.state || {}).village || {}).bondScoreLog) || [];
      snap.bondScoreLogLen = log.length;
      // Read-only cursor: bondScoreLog is capped (~200) and may splice from
      // the front — never clear/mutate it from the probe.
      if (scoreLogCursor > log.length) scoreLogCursor = 0;
      for (let i = scoreLogCursor; i < log.length; i++) {
        const pick = log[i] && log[i].pick;
        // bondScoreLogPush stores pick as a kind string (HOLD / PROPOSE_BOND /
        // RAISE_LINK), not a candidate object.
        const kind = pick == null ? '(null)'
          : (typeof pick === 'string' ? pick
            : (pick.kind ? String(pick.kind) : '(null)'));
        snap.scorePickHist[kind] = (snap.scorePickHist[kind] || 0) + 1;
        t.bondScorePicks[kind] = (t.bondScorePicks[kind] || 0) + 1;
      }
      scoreLogCursor = log.length;
    } catch (e) { err('snapshot.scoreLog', e); }

    try {
      if (typeof Game.personTrustCensus === 'function') {
        const c = Game.personTrustCensus();
        if (c) {
          snap.trustedAnyoneN = c.trustedAnyoneN || 0;
          snap.maxTrust = c.maxTrust || 0;
        }
      }
    } catch (e) { err('snapshot.census', e); }

    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) {
      try { Game[n] = orig[n]; } catch (e) {}
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

function summarizeSeed(row) {
  const person = row.personInitiations || [];
  const link = row.linkInitiations || [];
  const convos = row.conversations || [];
  const tele = row.bondTele || [];
  const daily = row.daily || [];

  const teleBy = Object.create(null);
  for (let i = 0; i < tele.length; i++) {
    const k = (tele[i].kind || '?') + '/' + (tele[i].outcome || '?');
    teleBy[k] = (teleBy[k] || 0) + 1;
  }

  let daysWarm = 0, daysTalkable = 0, daysLore = 0;
  let peakWarm = 0, peakTalkable = 0, peakLore = 0, peakTrust = 0;
  let warmPairDaySum = 0;
  for (let i = 0; i < daily.length; i++) {
    const d = daily[i];
    if ((d.warmPairs || 0) > 0) daysWarm++;
    if ((d.talkable || 0) > 0) daysTalkable++;
    if ((d.loreEligible || 0) > 0) daysLore++;
    if ((d.warmPairs || 0) > peakWarm) peakWarm = d.warmPairs;
    if ((d.talkable || 0) > peakTalkable) peakTalkable = d.talkable;
    if ((d.loreEligible || 0) > peakLore) peakLore = d.loreEligible;
    if ((d.maxTrust || 0) > peakTrust) peakTrust = d.maxTrust;
    warmPairDaySum += d.warmPairs || 0;
  }

  const convoOk = convos.filter(function (c) { return c.ok; }).length;
  const gameDays = row.gameDays || row.days || 0;
  const denom = gameDays > 0 ? gameDays : 1;

  return {
    seed: row.seed,
    policy: row.policy,
    daysRequested: row.daysRequested,
    gameDays: gameDays,
    endReason: row.endReason,
    won: !!row.won,
    over: !!row.over,
    personInitiations: person.length,
    linkInitiations: link.length,
    conversationsOk: convoOk,
    conversationsAttempted: convos.length,
    personPerDay: person.length / denom,
    linkPerDay: link.length / denom,
    convoPerDay: convoOk / denom,
    teleByOutcome: teleBy,
    bondTeleN: tele.length,
    daysWarmPairs: daysWarm,
    daysTalkable: daysTalkable,
    daysLoreEligible: daysLore,
    peakWarmPairs: peakWarm,
    peakTalkable: peakTalkable,
    peakLoreEligible: peakLore,
    peakMaxTrust: peakTrust,
    warmPairDaySum: warmPairDaySum,
    bondScorePicks: row.bondScorePicks || {},
    instrumentErrors: (row.instrumentErrors || []).length,
    wrapCounts: row.wrapCounts || {},
  };
}

function loadPolicy(policyId) {
  // Match sweep-compare / balance-panel: maker/merchant/caregiver live in
  // livelihood.js, not as standalone policy files.
  if (policyId === 'maker' || policyId === 'merchant' || policyId === 'caregiver') {
    const livelihoods = require(path.join(REPO, 'scripts', 'policies', 'livelihood'));
    if (!livelihoods[policyId]) throw new Error('livelihood policy missing: ' + policyId);
    return livelihoods[policyId];
  }
  try {
    const { POLICY_REGISTRY } = require(path.join(REPO, 'scripts', 'sweep-compare'));
    if (POLICY_REGISTRY && POLICY_REGISTRY[policyId]) return POLICY_REGISTRY[policyId];
  } catch (e) {}
  const policyMod = require(path.join(REPO, 'scripts', 'policies', policyId));
  const policy = policyMod[policyId] || policyMod.capable || policyMod.competent;
  if (!policy) throw new Error('policy missing: ' + policyId);
  return policy;
}

async function runOne() {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '150', 10) || 150;
  const policyId = process.env.POLICY || 'capable';
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const policy = loadPolicy(policyId);

  const { Game } = await loadGame({ seed: seed, mode: 'phase4-social-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const inst = install(Game);
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); }
      finally {
        try {
          const d = dayOf(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) {
          inst.t.instrumentErrors.push('daily-snap: ' + String(e.message).slice(0, 80));
        }
      }
    },
  });

  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, wrapped, { days: days, sampleEvery: 30 });
  });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}

  const out = {
    seed: seed,
    policy: policyId,
    daysRequested: days,
    days: result && result.days,
    gameDays: dayOf(Game),
    endReason: result && result.endReason,
    won: !!(Game && Game.won),
    over: !!(Game && Game.over),
    bondTele: inst.t.bondTele,
    personInitiations: inst.t.personInitiations,
    linkInitiations: inst.t.linkInitiations,
    conversations: inst.t.conversations,
    daily: inst.t.daily,
    bondScorePicks: inst.t.bondScorePicks,
    instrumentErrors: inst.t.instrumentErrors,
    wrapCounts: inst.t.wrapCounts,
    sha: shaFull(),
  };
  console.log(JSON.stringify(out));
}

function parseList(env, fallback) {
  return String(env || fallback).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

function runDriver() {
  const seeds = parseList(process.env.SEEDS, DEFAULT_SEEDS).map(function (s) {
    return parseInt(s, 10);
  }).filter(Number.isFinite);
  const policies = parseList(process.env.POLICIES, DEFAULT_POLICIES);
  const days = process.env.DAYS || '150';
  const par = Math.max(1, Math.min(16, parseInt(process.env.PAR || '6', 10) || 6));
  const outPath = process.env.OUT || null;
  const sha = shaFull();
  const jobs = [];
  for (let p = 0; p < policies.length; p++) {
    for (let s = 0; s < seeds.length; s++) {
      jobs.push({ policy: policies[p], seed: seeds[s] });
    }
  }

  const rows = [];
  const summaries = [];
  let next = 0;
  let failed = 0;

  function spawnOne(job) {
    return new Promise(function (resolve) {
      const child = spawn(process.execPath, [__filename, '--one'], {
        cwd: REPO,
        env: Object.assign({}, process.env, {
          SEED: String(job.seed),
          DAYS: String(days),
          POLICY: job.policy,
        }),
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', function (x) { stdout += x; });
      child.stderr.on('data', function (x) { stderr += x; });
      const timer = setTimeout(function () {
        try { child.kill('SIGKILL'); } catch (e) {}
      }, 600000);
      child.on('close', function (status) {
        clearTimeout(timer);
        if (status !== 0) {
          failed++;
          const errRow = {
            seed: job.seed, policy: job.policy, error: 'child_failed',
            status: status, stderr: String(stderr || '').slice(0, 400),
          };
          console.error(JSON.stringify(errRow));
          resolve(null);
          return;
        }
        const lines = String(stdout || '').trim().split('\n').filter(Boolean);
        let row = null;
        try { row = JSON.parse(lines[lines.length - 1]); }
        catch (e) {
          failed++;
          console.error(JSON.stringify({
            seed: job.seed, policy: job.policy, error: 'bad_json',
            stdout: String(stdout || '').slice(0, 200),
          }));
          resolve(null);
          return;
        }
        resolve(row);
      });
    });
  }

  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const row = await spawnOne(job);
      if (!row) continue;
      rows.push(row);
      const s = summarizeSeed(row);
      summaries.push(s);
      process.stderr.write(JSON.stringify(s) + '\n');
    }
  }

  return Promise.all(Array.from({ length: par }, worker)).then(function () {
    summaries.sort(function (a, b) {
      return String(a.policy).localeCompare(String(b.policy)) || (a.seed - b.seed);
    });

    const byPolicy = Object.create(null);
    for (let i = 0; i < policies.length; i++) {
      byPolicy[policies[i]] = {
        n: 0, personInitiations: 0, linkInitiations: 0, conversationsOk: 0,
        conversationsAttempted: 0, gameDays: 0, won: 0,
        seedsWithPerson: 0, seedsWithLink: 0, seedsWithConvo: 0,
        seedsWithWarmOpportunity: 0, seedsWithTalkOpportunity: 0,
        seedsWithLoreOpportunity: 0,
        seedsPersonZeroDespiteWarm: 0, seedsLinkZeroDespiteLore: 0,
        seedsConvoZeroDespiteTalkable: 0,
        teleByOutcome: Object.create(null),
        bondScorePicks: Object.create(null),
        instrumentErrors: 0,
      };
    }

    for (let i = 0; i < summaries.length; i++) {
      const s = summaries[i];
      const a = byPolicy[s.policy];
      if (!a) continue;
      a.n++;
      a.personInitiations += s.personInitiations;
      a.linkInitiations += s.linkInitiations;
      a.conversationsOk += s.conversationsOk;
      a.conversationsAttempted += s.conversationsAttempted;
      a.gameDays += s.gameDays;
      if (s.won) a.won++;
      if (s.personInitiations > 0) a.seedsWithPerson++;
      if (s.linkInitiations > 0) a.seedsWithLink++;
      if (s.conversationsOk > 0) a.seedsWithConvo++;
      if (s.daysWarmPairs > 0) a.seedsWithWarmOpportunity++;
      if (s.daysTalkable > 0) a.seedsWithTalkOpportunity++;
      if (s.daysLoreEligible > 0) a.seedsWithLoreOpportunity++;
      if (s.personInitiations === 0 && s.daysWarmPairs > 0) a.seedsPersonZeroDespiteWarm++;
      if (s.linkInitiations === 0 && s.daysLoreEligible > 0) a.seedsLinkZeroDespiteLore++;
      if (s.conversationsOk === 0 && s.daysTalkable > 0) a.seedsConvoZeroDespiteTalkable++;
      a.instrumentErrors += s.instrumentErrors || 0;
      const tb = s.teleByOutcome || {};
      Object.keys(tb).forEach(function (k) {
        a.teleByOutcome[k] = (a.teleByOutcome[k] || 0) + tb[k];
      });
      const bp = s.bondScorePicks || {};
      Object.keys(bp).forEach(function (k) {
        a.bondScorePicks[k] = (a.bondScorePicks[k] || 0) + bp[k];
      });
    }

    for (const p of Object.keys(byPolicy)) {
      const a = byPolicy[p];
      a.personPerDay = a.gameDays > 0 ? a.personInitiations / a.gameDays : null;
      a.linkPerDay = a.gameDays > 0 ? a.linkInitiations / a.gameDays : null;
      a.convoPerDay = a.gameDays > 0 ? a.conversationsOk / a.gameDays : null;
      a.personPerRun = a.n > 0 ? a.personInitiations / a.n : null;
      a.linkPerRun = a.n > 0 ? a.linkInitiations / a.n : null;
      a.convoPerRun = a.n > 0 ? a.conversationsOk / a.n : null;
    }

    const pooled = {
      n: summaries.length,
      personInitiations: 0, linkInitiations: 0, conversationsOk: 0, gameDays: 0,
    };
    for (const p of Object.keys(byPolicy)) {
      pooled.personInitiations += byPolicy[p].personInitiations;
      pooled.linkInitiations += byPolicy[p].linkInitiations;
      pooled.conversationsOk += byPolicy[p].conversationsOk;
      pooled.gameDays += byPolicy[p].gameDays;
    }
    pooled.personPerDay = pooled.gameDays > 0 ? pooled.personInitiations / pooled.gameDays : null;
    pooled.linkPerDay = pooled.gameDays > 0 ? pooled.linkInitiations / pooled.gameDays : null;
    pooled.convoPerDay = pooled.gameDays > 0 ? pooled.conversationsOk / pooled.gameDays : null;

    // Opportunity vs zero language — never call a zero a defect without opportunity.
    const opportunityNotes = [];
    for (const p of Object.keys(byPolicy)) {
      const a = byPolicy[p];
      if (a.seedsPersonZeroDespiteWarm > 0) {
        opportunityNotes.push(p + ': ' + a.seedsPersonZeroDespiteWarm +
          '/' + a.n + ' seeds had warm-pair days but 0 person initiations (opportunity open; initiation still lottery/scorer)');
      }
      if (a.personInitiations === 0 && a.seedsWithWarmOpportunity === 0) {
        opportunityNotes.push(p + ': 0 person initiations AND 0 warm-pair opportunity days — zero with closed warmth opportunity');
      }
      if (a.seedsLinkZeroDespiteLore > 0) {
        opportunityNotes.push(p + ': ' + a.seedsLinkZeroDespiteLore +
          '/' + a.n + ' seeds had lore+standing opportunity but 0 link stages');
      }
      if (a.linkInitiations === 0 && a.seedsWithLoreOpportunity === 0) {
        opportunityNotes.push(p + ': 0 link stages AND 0 lore-eligible opportunity days — zero with closed link opportunity (or unknown)');
      }
      if (a.seedsConvoZeroDespiteTalkable > 0) {
        opportunityNotes.push(p + ': ' + a.seedsConvoZeroDespiteTalkable +
          '/' + a.n + ' seeds had talkable living NPCs but 0 successful startConvo');
      }
    }

    const panel = {
      probe: 'phase4-social-rates-20261108',
      task: 'OVE-55',
      tipSha: sha,
      tipSha12: sha.slice(0, 12),
      note: 'Includes #41 bond/link dawn candidates (OVE-51). companionScore (OVE-54) and fighterState (OVE-52) still in flight — remeasure after those land if Phase 4 residual claims need them.',
      method: {
        seeds: seeds,
        policies: policies,
        days: parseInt(days, 10),
        par: par,
        initiationRules: {
          person: 'staged OR npc propose accepted/refused without prior staged for pair',
          link: 'kind=link outcome=staged',
          conversation: 'startConvo truthy return',
        },
        opportunity: {
          warmPairs: 'daily count of living NPC pairs with bondDriveLive.live',
          talkable: 'daily living roster NPCs (not bearer)',
          loreEligible: 'living NPC with village lore keys and build_standing weight >= 1',
        },
      },
      pooled: pooled,
      byPolicy: byPolicy,
      perCase: summaries,
      opportunityNotes: opportunityNotes,
      failedJobs: failed,
      generatedAt: new Date().toISOString(),
    };

    const text = JSON.stringify(panel, null, 2) + '\n';
    if (outPath) {
      fs.mkdirSync(path.dirname(path.resolve(REPO, outPath)), { recursive: true });
      fs.writeFileSync(path.resolve(REPO, outPath), text);
      console.error('Wrote ' + outPath);
    }
    console.log(text);
    if (failed) process.exitCode = 1;
  });
}

if (process.argv.indexOf('--one') !== -1) {
  runOne().catch(function (e) {
    console.error(e && e.stack || e);
    process.exit(1);
  });
} else {
  runDriver().catch(function (e) {
    console.error(e && e.stack || e);
    process.exit(1);
  });
}
