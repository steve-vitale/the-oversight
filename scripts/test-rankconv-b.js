#!/usr/bin/env node
// test-rankconv-b.js — DIAG recorder for sim-rankconv-b (backlog #1493).
// Standing-to-rank conversion under competent play. MEASUREMENT ONLY:
// this script reads game state; it changes no src/js, no policy defaults,
// no game defaults. It never feeds a roster/list into a villager decision
// (PERCEPTION LAW): every field below is a read of already-recorded state.
//
// Usage (one seed per child process — harness rule, never two harnesses
// in one process):
//   node scripts/test-rankconv-b.js <seed> <out-json>
//   node scripts/test-rankconv-b.js --check   (fixture classification tests, no harness)
// Refuses to overwrite an existing output file (freshness guard).
'use strict';
const fs = require('fs');
const path = require('path');

function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

// classifyGate(snap): pure classification from RECORDED gate fields only.
// snap: { rank, linksActive, linksSeasoned, polityShape, networkLive,
//   regionalPending, pendingAccord, accordUnanswered, scaleRefused,
//   pendingNational, everHadLink }
// Returns { blocker, evidence } where evidence names the recorded fields.
function classifyGate(s) {
  if (s.rank && s.rank !== 'village') return { blocker: 'NOT-BLOCKED', evidence: ['rank=' + s.rank] };
  if (!s.everHadLink && !s.regionalPending && !s.pendingAccord) {
    return { blocker: 'NO-LINK', evidence: ['linksActive=0', 'everHadLink=false', 'regionalPending=null', 'pendingAccord=null', 'networkLive=' + !!s.networkLive] };
  }
  if (s.regionalPending || s.pendingAccord) {
    return { blocker: 'DAWN-PENDING', evidence: ['regionalPending=' + JSON.stringify(s.regionalPending), 'pendingAccord=' + JSON.stringify(s.pendingAccord), 'accordUnanswered=' + !!s.accordUnanswered, 'networkLive=' + !!s.networkLive] };
  }
  if (s.accordUnanswered && !s.everHadLink) {
    return { blocker: 'DAWN-PENDING', evidence: ['accordUnanswered=true', 'linksActive=0', 'networkLive=' + !!s.networkLive] };
  }
  if (!s.polityShape) {
    return { blocker: 'UNSEASONED-REALM', evidence: ['linksActive=' + s.linksActive, 'linksSeasoned=' + s.linksSeasoned, 'polityShape=null', 'networkLive=' + !!s.networkLive] };
  }
  // A polity exists but rank is still village: dawn should already have
  // fired (polity needs 30d seasoned links; dawn needs any 21d bond).
  return { blocker: 'OTHER', evidence: ['polityShape=' + s.polityShape, 'networkLive=' + !!s.networkLive, 'pendingNational=' + JSON.stringify(s.pendingNational), 'scaleRefused=' + !!s.scaleRefused] };
}

function runCheck() {
  const cases = [
    [{ rank: 'village', everHadLink: false, regionalPending: null, pendingAccord: null, networkLive: false }, 'NO-LINK'],
    [{ rank: 'village', everHadLink: true, regionalPending: { linkId: 1 }, pendingAccord: null, networkLive: false }, 'DAWN-PENDING'],
    [{ rank: 'village', everHadLink: true, regionalPending: null, pendingAccord: { linkId: 1 }, networkLive: false, accordUnanswered: false }, 'DAWN-PENDING'],
    [{ rank: 'village', everHadLink: true, regionalPending: null, pendingAccord: null, linksActive: 2, linksSeasoned: 1, polityShape: null, networkLive: false }, 'UNSEASONED-REALM'],
    [{ rank: 'regional', everHadLink: true, networkLive: true }, 'NOT-BLOCKED'],
    [{ rank: 'village', everHadLink: true, regionalPending: null, pendingAccord: null, linksActive: 3, linksSeasoned: 3, polityShape: 'lead', networkLive: false, pendingNational: null, scaleRefused: false }, 'OTHER'],
    [{ rank: 'village', everHadLink: false, regionalPending: null, pendingAccord: null, networkLive: false, accordUnanswered: true }, 'NO-LINK'],
  ];
  let fail = 0;
  for (const [snap, want] of cases) {
    const got = classifyGate(snap).blocker;
    const ok = got === want;
    if (!ok) fail++;
    console.log((ok ? 'PASS' : 'FAIL') + ' classify -> ' + got + ' (want ' + want + ') snap=' + JSON.stringify(snap));
  }
  if (fail) { console.error('CHECK FAILED: ' + fail + ' case(s)'); process.exit(1); }
  console.log('CHECK GREEN: ' + cases.length + '/' + cases.length + ' classification fixtures');
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--check') return runCheck();
  const seed = parseInt(args[0], 10);
  const out = args[1];
  if (!Number.isFinite(seed) || !out) {
    console.error('usage: node scripts/test-rankconv-b.js <seed> <out-json>  OR  --check');
    process.exit(2);
  }
  if (fs.existsSync(out)) {
    console.error('REFUSING to overwrite existing output (freshness guard): ' + out);
    process.exit(3);
  }
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { Game, manifest } = await loadGame({ seed, mode: 'rankconv-competent', fullTelemetry: false });
  await setupGame(Game);

  // ---- read-only gate snapshot (never writes, never rolls RNG) ----
  function gateSnapshot() {
    const day = safe(() => Game.state.scholar.day || 0, 0);
    const standing = safe(() => Game.villageStanding(), null);
    const gated = safe(() => Game.villageStandingTotal(), null);
    const links = safe(() => Game.hierarchyState() || [], []);
    const linkRows = links.map((l) => {
      const other = safe(() => Game._linkOther(l, 'haven'), null);
      return {
        id: l.id, kind: l.kind || null, primary: l.primary || null, subordinate: l.subordinate || null,
        a: l.a || null, b: l.b || null, other: other, status: l.status, formedDay: l.day || 0,
        ageDays: day - (l.day || 0), trust: l.trust || 0, conquered: !!l.conquered,
        seasonedPolity: safe(() => Game._linkSeasoned(l, !!l.conquered, true), false),
        seasonedStanding: safe(() => Game._linkSeasoned(l, !!l.conquered), false),
        regionalPlus: safe(() => Game._linkRegionalPlus(l), false),
      };
    });
    const polity = (fn) => safe(() => { const p = Game[fn] ? Game[fn](fn === 'polityOf' ? 'haven' : undefined) : null; return p ? { primary: p.primary, villages: p.villages, size: p.size, led: !!p.led, shape: p.shape } : null; }, null);
    // polityOf needs an explicit arg; the helpers above take none.
    const polHaven = safe(() => { const p = Game.polityOf('haven'); return p ? { primary: p.primary, villages: p.villages, size: p.size, led: !!p.led, shape: p.shape } : null; }, null);
    const polBelong = safe(() => { const p = Game._belongPolity(); return p ? { primary: p.primary, villages: p.villages, size: p.size, led: !!p.led, shape: p.shape } : null; }, null);
    const polCov = safe(() => { const p = Game._covenantPolity(); return p ? { primary: p.primary, villages: p.villages, size: p.size, led: !!p.led, shape: p.shape } : null; }, null);
    const polTrade = safe(() => { const p = Game._tradePolity(); return p ? { primary: p.primary, villages: p.villages, size: p.size, led: !!p.led, shape: p.shape } : null; }, null);
    const havenPol = safe(() => { const p = Game._havenPolity(); return p ? { primary: p.primary, villages: p.villages, size: p.size, led: !!p.led, shape: p.shape } : null; }, null);
    void polity;
    return {
      day, rank: safe(() => Game.scaleRank(), 'village'),
      standing: standing, gatedTotal: gated,
      standingLine: safe(() => Game.standingLine(), null),
      links: linkRows,
      linksActive: linkRows.filter((l) => l.status === 'active').length,
      linksSeasoned: linkRows.filter((l) => l.status === 'active' && l.seasonedPolity).length,
      linksRegionalPlus: linkRows.filter((l) => l.status === 'active' && l.regionalPlus).length,
      polityHaven: polHaven, polityBelong: polBelong, polityCovenant: polCov, polityTrade: polTrade, havenPolity: havenPol,
      networkLive: safe(() => !!Game.state.networkLive, false),
      networkLiveDay: safe(() => Game.state.networkLiveDay || null, null),
      nationalLive: safe(() => !!Game.state.nationalLive, false),
      globalLive: safe(() => !!Game.state.globalLive, false),
      regionalPending: safe(() => Game.state._regionalPending || null, null),
      pendingAccord: safe(() => Game.state.pendingAccord || null, null),
      accordUnanswered: safe(() => !!Game.state.accordUnanswered, false),
      pendingNational: safe(() => Game.state.pendingNational || null, null),
      scaleRefused: safe(() => !!Game.state.scaleRefused, false),
      foreignPolities: safe(() => (Game.state.foreignPolities || []).map((f) => ({ primary: f.primary, subs: (f.subs || []).length })), []),
      otherVillages: safe(() => (Game.state.otherVillages || []).map((v) => ({ id: v.id, known: safe(() => Game.knowsVillage(v), null) })), []),
    };
  }

  // Daily recorder: wraps competent.daily, records AFTER the day's play.
  // Read-only: no Game writes, no RNG, no policy-behavior change.
  const trajectory = [];
  const seenDays = new Set();
  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      const snap = gateSnapshot();
      if (!seenDays.has(snap.day)) {
        seenDays.add(snap.day);
        trajectory.push({
          day: snap.day, rank: snap.rank,
          standingTotal: snap.standing ? snap.standing.total : null,
          war: snap.standing ? snap.standing.war : null,
          diplomacy: snap.standing ? snap.standing.diplomacy : null,
          plenty: snap.standing ? snap.standing.plenty : null,
          warPts: snap.standing ? snap.standing.warPts : null,
          standingLinks: snap.standing ? snap.standing.links : null,
          standingFeasts: snap.standing ? snap.standing.feasts : null,
          gatedTotal: snap.gatedTotal,
          linksActive: snap.linksActive, linksSeasoned: snap.linksSeasoned,
          linksRegionalPlus: snap.linksRegionalPlus,
          polityShape: snap.havenPolity ? snap.havenPolity.shape : null,
          networkLive: snap.networkLive, pendingRegional: !!snap.regionalPending,
          pendingNational: !!snap.pendingNational,
        });
      }
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days: 180, manifest, sampleEvery: 10 });
  const end = gateSnapshot();
  const everHadLink = trajectory.some((t) => t.linksActive > 0) || end.linksActive > 0;
  const classification = classifyGate({
    rank: end.rank, everHadLink,
    regionalPending: end.regionalPending, pendingAccord: end.pendingAccord,
    accordUnanswered: end.accordUnanswered, linksActive: end.linksActive,
    linksSeasoned: end.linksSeasoned, polityShape: end.havenPolity ? end.havenPolity.shape : null,
    networkLive: end.networkLive, pendingNational: end.pendingNational, scaleRefused: end.scaleRefused,
  });
  // Policy-origin inter-village verbs from the harness pacing stream.
  const verbCounts = {};
  for (const row of (result.pacing && result.pacing.perDay) || []) {
    for (const [k, n] of Object.entries(row.acts || {})) {
      if (!k.startsWith('policy:')) continue;
      const verb = k.split(':')[1];
      if (['proposeLink', 'proposeTrade', 'proposeCovenant', 'answerAccord', 'answerNationalChoice', 'answerGlobalChoice', 'tendLink', 'payTribute'].includes(verb)) {
        verbCounts[verb] = (verbCounts[verb] || 0) + n;
      }
    }
  }
  const deaths = {};
  for (const d of (result.samples.deaths || [])) {
    const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
  }
  // Final roster (people, not counters): occupation/profile/abilities.
  const roster = safe(() => {
    const v = Game.state.village || {}, a = v.agency || {};
    return (v.roster || []).map((vid) => {
      const p = (Game.data.villagers || []).find((x) => x.id === vid) || (Game.data.background_survivors || []).find((x) => x.id === vid);
      return { vid: String(vid).slice(0, 16), occ: p && (p.occupationId || p.formerOccupation) || '?', profile: (a.profiles && a.profiles[vid]) || '?', abilities: ((v.npcAbilities && v.npcAbilities[vid]) || []).slice(), dead: !!(p && p.dead) };
    });
  }, []);
  const row = {
    lever: 'sim-rankconv-b', policy: 'competent', seed,
    commit: result.manifest && result.manifest.commit,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    maxArc: safe(() => (Game.progState ? Game.progState().arc : null), null),
    tableWaiting: safe(() => !!(Game.progState ? Game.progState().tableWaiting : false), false),
    tableEntered: safe(() => !!(Game.progState ? Game.progState().tableDone : false), false),
    endRank: end.rank, endStanding: end.standing, endGatedTotal: end.gatedTotal,
    standingLine: end.standingLine,
    endGate: end, trajectory, classification, everHadLink, verbCounts,
    deaths, roster, ms: result.ms,
    scaleSamples: result.samples.scale, standingSamples: result.samples.standing,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(row, null, 1));
  console.log(`[rankconv seed ${seed}] days=${row.days} end=${row.endReason} rank=${row.endRank} standing=${row.endStanding ? row.endStanding.total : null} links=${end.linksActive} polity=${row.endGate.havenPolity ? row.endGate.havenPolity.shape : null} blocker=${classification.blocker} -> ${out}`);
}

if (require.main === module) {
  main().catch((e) => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
}
module.exports = { classifyGate };
