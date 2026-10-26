#!/usr/bin/env node
// probe-eggroad-calldiag-20261026.js — eggroad call diagnostic (NOT part
// of the pre-registered 8-seed pilot; a follow-up that names the pilot's
// binding-gate mechanism).
//
// Question: when the pilot's musters stall at 0-11 blades vs gates of
// 10/12, WHY? Each link at call time either answers (quota blades) or
// refuses (trust < 25, opinion < -10, arrears, no free fighters) — the
// reason is said aloud, but the pilot didn't capture say-lines. This
// probe captures them, plus a link snapshot at each call and the titan
// fight outcomes (state.titans.outcomes: fought -> slain/fled).
//
// Substrate: identical to the pilot (r53 stack, greedy OFF, sit-gate,
// r42 titan drive) via the pilot module's exports.
// Env: FULLSEAT=1 VETCOMMIT=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1.
// Usage: FULLSEAT=1 VETCOMMIT=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 node scripts/probe-eggroad-calldiag-20261026.js
// Output: evidence/2026-10-26/perseed-eggroad-calldiag/<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const P = require('./probe-eggroad-a-20261026');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [88111, 88112]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-eggroad-calldiag');
const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const stripHtml = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const TITAN_RE = /CALL GOES OUT|REFUSES|answers!|no free fighters|No one is free|No one sits|WAR COUNCIL|muster is hungry|stand down|THE NETWORK|network/i;

function linkSnapshot(G) {
  const out = [];
  try {
    const links = (G.hierarchyState ? G.hierarchyState() : []).filter(l => l && l.status === 'active');
    for (const l of links) {
      let other = null;
      try { other = G._linkOther ? G._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary); } catch (e) {}
      let roster = 0, adults = 0, opinion = null;
      try {
        const ov = G._otherVillage ? G._otherVillage(other) : null;
        if (ov) {
          roster = (ov.roster || []).length;
          adults = (ov.roster || []).filter(r => r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0)).length;
          opinion = ov.opinion;
        }
      } catch (e) {}
      out.push({ other, kind: l.kind, trust: l.trust || 0, opinion, arrears: l.arrears || 0, roster, adults });
    }
  } catch (e) { out.push({ err: String(e && e.message || e).slice(0, 120) }); }
  return out;
}

async function runSeed(seed, days) {
  const sayLines = [];
  const callSnaps = [];
  const fightStarts = [];
  const ctx = {};
  const { Game } = await loadGame({ seed, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  const oSay = Game.say.bind(Game);
  Game.say = function (l) {
    try {
      const s = stripHtml(l).slice(0, 300);
      if (TITAN_RE.test(s)) sayLines.push({ day: day(Game), text: s });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const origCall = Game.soundTitanCall ? Game.soundTitanCall.bind(Game) : null;
  if (origCall) {
    Game.soundTitanCall = function (tid) {
      try { callSnaps.push({ day: day(Game), tid, links: linkSnapshot(Game) }); } catch (e) {}
      return origCall.apply(this, arguments);
    };
  }
  const origCombat = Game.startCombat ? Game.startCombat.bind(Game) : null;
  if (origCombat) {
    Game.startCombat = function (mid) {
      try {
        const defs = (Game.data && Game.data.titans) || {};
        if (mid && defs[mid]) {
          const st = (Game.state || {}).titans || {};
          const muster = (st.musters || {})[mid];
          fightStarts.push({ day: day(Game), tid: mid, allies: muster ? (muster.allies || []).length : null, haven: muster ? (muster.haven || []).length : null });
        }
      } catch (e) {}
      return origCombat.apply(this, arguments);
    };
  }
  const origTakeSeat = Game.tableTakeSeat ? Game.tableTakeSeat.bind(Game) : null;
  if (origTakeSeat) {
    Game.tableTakeSeat = function () {
      if (!P.sitAllowed(Game)) return { ok: false, msg: '' };
      return origTakeSeat.apply(this, arguments);
    };
  }
  const policy = P.eggroadPolicy();
  const oDaily = policy.daily.bind(policy);
  policy.daily = (G, c) => { oDaily(G, c); Object.assign(ctx, c); };
  await quietLog(async () => { await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  const census = P.eggroadCensus(Game, { titanDrive: ctx._eggk || null });
  let outcomes = null;
  try { outcomes = ((Game.state || {}).titans || {}).outcomes || []; } catch (e) {}
  const m = { seed, census, sayLines, callSnaps, fightStarts, outcomes };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, seed + '.json'), JSON.stringify(m, null, 1));
  console.log(`diag seed ${seed}: calls=${callSnaps.length} fights=${fightStarts.length} outcomes=${JSON.stringify(outcomes)}`);
  return m;
}

async function main() {
  for (const k of ['FULLSEAT', 'VETCOMMIT', 'ARMORYDRIVE', 'CAPABLE_VETGUARD']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
  }
  if (process.env.CAPABLE_GREEDY === '1') { console.error('SWEEP STOP: CAPABLE_GREEDY must be UNSET.'); process.exit(2); }
  for (const s of SEEDS) await runSeed(s, DAYS);
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
