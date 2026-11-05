// xp-gear-panel-20261105.js — XP / synergy / gear / healer-road panel driver.
// Single-seed. Usage:
//   SEED=7 node scripts/xp-gear-panel-20261105.js > evidence/2026-11-05/xp-gear-panel-before/xp-gear-7.stdout.json 2> evidence/2026-11-05/xp-gear-panel-before/xp-gear-7.stderr.log
// Pre-registration: evidence/2026-11-05/xp-gear-prereg.md
// Policy: capable (the competent bot). Horizon: 120 days (default DAYS env).
// POLICY env overrides the policy (e.g. POLICY=competent DAYS=42 for the
// r104 establishment-window check — same seeds/policy/horizon as r104).
// Observer-side wrappers ONLY (fieldFight, villagerHealCheck, noteCareRescue,
// _triageRun, creditDeed, creditSynergy) — pure recording, no game-behavior
// change, same driver in both arms. Output: JSON record to stdout; narrative
// to stderr.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '7', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const POLICY = process.env.POLICY || 'capable';
const EVID_DIR = path.join(ROOT, 'evidence', '2026-11-05');
const H = require(path.join(ROOT, 'scripts/sim-harness'));
const { runComparison, POLICY_REGISTRY: registry } = require(path.join(ROOT, 'scripts/sweep-compare'));
const E = (...a) => console.error(...a);

async function main() {
  const base = registry[POLICY];
  if (!base) throw new Error('Unknown policy ' + POLICY);
  let G = null;
  const fights = [], healChecks = [], careRescues = [], triages = [], deedCredits = [], synergyCredits = [];
  const samples = [];
  let combat42 = null;
  const dayOf = () => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const livingIds = () => { try { return ((G.state.village || {}).roster || []).filter(id => { const p = G.vpOf && G.vpOf(id); return p && !p.dead; }); } catch (e) { return []; } };

  function sample() {
    try {
      const s = G.state.scholar, v = G.state.village || {};
      const living = livingIds();
      const xpByTrack = { combat: 0, field: 0, social: 0, craft: 0, strange: 0 };
      let thresholds = 0; const perTrack = { combat: 0, field: 0, social: 0, craft: 0, strange: 0 };
      let abilitiesHeld = 0; const distinct = new Set();
      const th = (G.trackThresholds ? G.trackThresholds('player') : [18, 48, 96, 192, 384]);
      const lvl = xp => { let l = 0; for (const t of th) if ((xp || 0) >= t) l++; return l; };
      // player
      const pt = (s.tracks || {});
      for (const t of Object.keys(xpByTrack)) { xpByTrack[t] += (pt[t] || {}).xp || 0; if (lvl((pt[t] || {}).xp || 0) >= 1) { thresholds++; perTrack[t]++; } }
      for (const a of (s.abilities || [])) { abilitiesHeld++; if (a && a.id) distinct.add(a.id); }
      // villagers
      for (const vid of living) {
        const x = (v.npcXp || {})[vid];
        if (x) for (const t of Object.keys(xpByTrack)) { xpByTrack[t] += x[t] || 0; if (lvl(x[t] || 0) >= 1) { thresholds++; perTrack[t]++; } }
        for (const a of ((v.npcAbilities || {})[vid] || [])) { abilitiesHeld++; if (a) distinct.add(typeof a === 'string' ? a : (a.id || String(a))); }
      }
      // recognized classes: player + villagers (npcGodpath: {vid:{path,subclass,lapsed}})
      let healers = 0; const classes = [];
      const pg = s.godpath;
      if (pg && pg.path && !pg.lapsed) { classes.push('player:' + pg.path + '/' + pg.subclass); if (pg.path === 'caregiver' && pg.subclass === 'healer') healers++; }
      for (const [vid, rec] of Object.entries(v.npcGodpath || {})) {
        if (!rec || !rec.path || rec.lapsed) continue;
        classes.push(vid + ':' + rec.path + '/' + rec.subclass);
        if (rec.path === 'caregiver' && rec.subclass === 'healer') healers++;
      }
      samples.push({ day: s.day || 0, living: living.length, xpByTrack, thresholds, perTrack,
        abilitiesHeld, distinctAbilities: distinct.size, healers, classes });
      // COMBAT-42 SNAPSHOT (r104 follow-up, 2026-11-05): first sample at
      // day >= 42 — raw npcXp combat per living villager, the SAME raw-store
      // read r104 used (state.village.npcXp; a villager with no record yet
      // reads 0 — same blind spot r104 had, so the numbers compare). The
      // bearer reads 0 here by design (their XP lives in scholar.tracks).
      if (!combat42 && (s.day || 0) >= 42) {
        const perVillager = {};
        let maxCombat = 0, crossed18 = 0;
        for (const vid of living) {
          const c = (((v.npcXp || {})[vid] || {}).combat) || 0;
          perVillager[vid] = c;
          if (c > maxCombat) maxCombat = c;
          if (c >= 18) crossed18++;
        }
        combat42 = { day: s.day || 0, living: living.length, maxCombat, crossed18, perVillager };
      }
    } catch (e) { /* sampling must never break the run */ }
  }

  function installWrappers(g) {
    // fieldFight: record every fight (wave, rounds, outcome, damage, fired abilities)
    const origFF = g.fieldFight && g.fieldFight.bind(g);
    if (origFF) g.fieldFight = function (vid, mdef, m, opts) {
      const rec = origFF(vid, mdef, m, opts);
      try {
        fights.push({ day: dayOf(), vid, wave: (mdef && mdef.wave) || null,
          monster: (mdef && mdef.id) || null, outcome: rec && rec.outcome, rounds: rec && rec.rounds,
          vTaken: rec && rec.vTaken, mDealt: rec && rec.mDealt, vHpLeft: rec && rec.vHpLeft,
          ffFired: (rec && rec.ffFired) || [], allyVid: rec && rec.allyVid || null });
      } catch (e) {}
      return rec;
    };
    // villagerHealCheck: record healer + patient HP before/after
    const origHC = g.villagerHealCheck && g.villagerHealCheck.bind(g);
    if (origHC) g.villagerHealCheck = function (vid, first, opts) {
      const before = (() => { try { return ((g.state.village.health || {})[vid] ?? null); } catch (e) { return null; } })();
      const r = origHC(vid, first, opts);
      try {
        healChecks.push({ day: dayOf(), vid, before,
          after: ((g.state.village.health || {})[vid] ?? null), ok: !!r });
      } catch (e) {}
      return r;
    };
    // noteCareRescue: record saves (the care_survived shape)
    const origCR = g.noteCareRescue && g.noteCareRescue.bind(g);
    if (origCR) g.noteCareRescue = function (actor, patient, before, after, maxHp, via, scene) {
      try { careRescues.push({ day: dayOf(), actor, patient, before, after, via, scene }); } catch (e) {}
      return origCR(actor, patient, before, after, maxHp, via, scene);
    };
    // _triageRun: record triage tents
    const origTR = g._triageRun && g._triageRun.bind(g);
    if (origTR) g._triageRun = function (mode, rel) {
      const r = origTR(mode, rel);
      try { triages.push({ day: dayOf(), mode, result: r }); } catch (e) {}
      return r;
    };
    // creditSynergy: record every synergy bonus (the wild fire rate owed
    // from the v1 run note — the v1 driver wrapped creditDeed but not this)
    const origCS = g.creditSynergy && g.creditSynergy.bind(g);
    if (origCS) g.creditSynergy = function (who, synergyId) {
      const r = origCS(who, synergyId);
      try { synergyCredits.push({ day: dayOf(), who, synergy: synergyId, granted: r }); } catch (e) {}
      return r;
    };
    // creditDeed: record EVERY deed credit (who, deed, track) — the XP feed itself
    const origCD = g.creditDeed && g.creditDeed.bind(g);
    if (origCD) g.creditDeed = function (who, deedId, trackOverride) {
      const r = origCD(who, deedId, trackOverride);
      try {
        const T = g.trackData ? g.trackData() : null;
        const d = T && T.deeds && T.deeds[deedId];
        deedCredits.push({ day: dayOf(), who, deed: deedId, track: trackOverride || (d && d.track) || null, n: (d && d.n) || 1, credited: r });
      } catch (e) {}
      return r;
    };
  }

  registry[POLICY] = Object.assign({}, base, {
    setup(g, ctx) { G = g; installWrappers(g); if (base.setup) return base.setup(g, ctx); },
    daily(g, ctx) { const r = base.daily && base.daily(g, ctx); sample(); return r; },
  });
  let report;
  try {
    report = await H.quietLog(() => runComparison({ seeds: [SEED], policies: [POLICY], days: DAYS, origin: 'Columbus, Ohio' }));
  } finally { registry[POLICY] = base; }
  if (report.exclusions && report.exclusions.length) {
    console.log(JSON.stringify({ seed: SEED, excluded: true, selection: report.exclusions[0].selection }, null, 1));
    return;
  }
  const row = report.runs[0];
  sample();
  // end census
  const s = G.state.scholar, v = G.state.village || {};
  const living = livingIds();
  const npcXp = {}, npcAbilities = {}, npcSkills = {}, npcGodpath = {};
  for (const vid of living) {
    if (v.npcXp && v.npcXp[vid]) npcXp[vid] = v.npcXp[vid];
    if (v.npcAbilities && v.npcAbilities[vid]) npcAbilities[vid] = v.npcAbilities[vid];
    if (v.npcSkills && v.npcSkills[vid]) npcSkills[vid] = v.npcSkills[vid];
    if (v.npcGodpath && v.npcGodpath[vid]) npcGodpath[vid] = v.npcGodpath[vid];
  }
  const waveKills = ((G.state.waveKillLog || []).slice());
  const tele = (G.state.telemetry || []).filter(e => e && ['track_level', 'class_recognized', 'godpath_deed', 'godpath_lifeline'].includes(e.kind || e.t || e.type));
  const rec = { seed: SEED, days: DAYS, policy: POLICY, gameDays: row.gameDays, endReason: row.endReason,
    won: row.won, waveReach: row.waveReach, national: row.national, table: row.table,
    entered: row.entered, deaths: row.deaths, samples, combat42, fights, healChecks, careRescues,
    triages, deedCredits, synergyCredits, teleEvents: tele.slice(-200),
    endCensus: { living: living.length, playerTracks: s.tracks || {}, playerAbilities: (s.abilities || []).map(a => a && a.id),
      playerGodpath: s.godpath || null, npcXp, npcAbilities, npcSkills, npcGodpath,
      waveKills, } };
  console.log(JSON.stringify(rec, null, 1));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
