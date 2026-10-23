#!/usr/bin/env node
// sense2-feastdisc-confirm-20261022.js — SENSE-TESTING LAW probe v2 for the
// sim-feastdiscipline CONFIRM.
//
// v1 (sense-feastdisc-confirm-20261022.js) DIVERGED from the corpus setup
// (its d139 mantle event did not match the corpus's d146 bearer), so its
// narration was of a different timeline. This v2 mirrors the sweep's
// oneRun EXACTLY (KD instrument + feast census + startCombat wrap +
// policy daily wrap + FD.resetTele + sampleEvery 30 + 180d) and ADDS ONLY
// the read-only Game.say wrap. Determinism is verified by re-running the
// corpus config and diffing the kill rows against the corpus JSON.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 FEASTDISC=1 \
//        SEED=66119 BASE=belongfeast DSTART=138 DEND=152 \
//        node scripts/sense2-feastdisc-confirm-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'FEASTDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }

const SEED = parseInt(process.env.SEED || '66119', 10);
const BASE = process.env.BASE || 'belongfeast';
const DSTART = parseInt(process.env.DSTART || '1', 10);
const DEND = parseInt(process.env.DEND || '152', 10);
const NAMEF = process.env.NAMEF || '';

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'feastdiscipline'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

function waveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 0;
  } catch (e) { return 0; }
}

(async () => {
  const policy = FD.disciplinedFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'feastdisc-confirm-sense2', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Feast-staging census (same as the sweep).
  const uninstallFeast = (() => {
    const oHost = Game.hostFeast ? Game.hostFeast.bind(Game) : null;
    const oGrant = Game.grantFeastBuff ? Game.grantFeastBuff.bind(Game) : null;
    if (oHost) Game.hostFeast = function (...a) { return oHost(...a); };
    if (oGrant) Game.grantFeastBuff = function (...a) { return oGrant(...a); };
    return () => { try { if (oHost) Game.hostFeast = oHost; } catch (e) {} try { if (oGrant) Game.grantFeastBuff = oGrant; } catch (e) {} };
  })();

  // startCombat wrap (same as the sweep, minus recording).
  const fightFeasted = [];
  let uninstallFeasted = null;
  try {
    const oSC = Game.startCombat ? Game.startCombat.bind(Game) : null;
    if (oSC) {
      Game.startCombat = function (...a) {
        const r = oSC(...a);
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const mid = a[0] || (Game.pendingMonsterId || 'bulldozer');
            let feasted = false;
            try { feasted = !!(Game.feastedActive && Game.feastedActive()); } catch (e) {}
            fightFeasted.push({ day: ((Game.state || {}).scholar || {}).day || 0, mid, wave: waveOf(Game, mid), feasted });
          }
        } catch (e) {}
        return r;
      };
      uninstallFeasted = () => { try { Game.startCombat = oSC; } catch (e) {} };
    }
  } catch (e) {}

  // Bearer-by-day (same as the sweep).
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  // READ-ONLY say wrap (the only addition vs the sweep).
  const lines = [];
  const osay = Game.say.bind(Game);
  const rx = new RegExp(NAMEF || 'FEAST|feast|veteran|falls|kill', 'i');
  Game.say = function (x) {
    try {
      const d = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      const s = String(x).replace(/\s+/g, ' ');
      if (rx.test(s)) lines.push(`[d${d}] ${s.slice(0, 500)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };

  FD.resetTele();
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, wrappedPolicy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallFeasted) uninstallFeasted(); } catch (e) {}
  try { uninstallFeast(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}

  // Verify against the corpus: the d146 congregation kill must match.
  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  const w4killRows = [];
  for (const k of (t.kills || [])) {
    if ((k.wave | 0) !== 4) continue;
    const d = k.dmg || {};
    const sD = Math.round(d.scholar || 0), cD = Math.round(d.companion || 0), oD = Math.round(d.other || 0);
    const tot = sD + cD + oD;
    const nonScholarShare = tot > 0 ? (cD + oD) / tot : 0;
    const bearerAtKill = bearerByDay[k.day] != null ? bearerByDay[k.day] : scholarVid;
    const killTimeVillager = k.by && k.by !== bearerAtKill && k.by !== 'player';
    w4killRows.push({ day: k.day, mid: k.mid, by: k.by, killTimeVillager: !!killTimeVillager, bearerAtKill, nonScholarShare: Math.round(nonScholarShare * 100) / 100, dmgMaj: nonScholarShare >= 0.5 });
  }
  console.log('VERIFY-KILLROWS: ' + JSON.stringify(w4killRows.filter(k => k.dmgMaj && k.killTimeVillager)));
  console.log('VERIFY-BEARER-d146: ' + (bearerByDay[146] || scholarVid));
  for (const l of lines) {
    const m = /^\[d(\d+)\]/.exec(l);
    if (m && +m[1] >= DSTART && +m[1] <= DEND) console.log(l);
  }
})().catch(e => { console.error('SENSE2 FATAL', e); process.exit(1); });
