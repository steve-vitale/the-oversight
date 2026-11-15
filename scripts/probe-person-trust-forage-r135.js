// probe-person-trust-forage-r135.js — errand-level trace for the r129 FORAGE question.
// Same panel as scripts/person-trust-panel-20261108.js (seed 84101, 30d,
// competent policy) but logs EVERY objPick: day, villager, kind, target.
// Lets the r135 run name the one lost FORAGE errand (baseline 2, fixed code 1)
// and the mechanism behind it, instead of arguing from aggregate counts.
//
// Usage: node scripts/probe-person-trust-forage-r135.js <out-trace-jsonl>
// Prints the aggregate JSON row (same shape as the panel) as the last line.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));

const OUT = process.argv[2] || path.join(REPO, 'probe-forage-trace.jsonl');

(async () => {
  const seed = 84101;
  const days = 30;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const kinds = {};
  const trace = [];
  const orig = Game.objPick;
  if (typeof orig === 'function') {
    Game.objPick = function (vid, hx, hy) {
      const o = orig.apply(this, arguments);
      try {
        const kind = (o && o.kind) || '?';
        kinds[kind] = (kinds[kind] || 0) + 1;
        let name = String(vid);
        try { const p = Game.getPerson(vid); if (p && p.name) name = p.name; } catch (e) {}
        let day = 0;
        try { day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}
        trace.push({ day, vid: String(vid), name, kind, tx: (o && o.tx) ?? null, ty: (o && o.ty) ?? null, hx, hy });
      } catch (e) {}
      return o;
    };
  }
  const policy = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  // Death capture: log every death tele with the game day (runDays wraps
  // Game.tele too, but this wrapper is installed first so it sees them all).
  const deaths = [];
  const origTele = Game.tele;
  if (typeof origTele === 'function') {
    Game.tele = function (type, data) {
      try {
        if (type === 'death') {
          let day = 0;
          try { day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}
          deaths.push({ day, kind: data && data.kind, who: data && data.who, cause: data && data.cause });
        }
      } catch (e) {}
      return origTele.apply(this, arguments);
    };
  }
  await runDays(Game, policy, { days, quiet: true });

  let maxTrust = 0, entries = 0, trustedOpen = 0;
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    const p = Game.getPerson(vid);
    const t = (p && p.trust) || {};
    for (const k of Object.keys(t)) {
      entries++;
      if ((t[k] || 0) > maxTrust) maxTrust = t[k];
    }
    try { if (Game.vgoalGate(vid, 'bonds') > 0) trustedOpen++; } catch (e) {}
  }
  try {
    if (typeof Game.personTrustCensus === 'function') {
      const c = Game.personTrustCensus();
      if (c && typeof c.maxTrust === 'number') {
        maxTrust = c.maxTrust;
        entries = c.entries;
        trustedOpen = c.trustedAnyoneN;
      }
    }
  } catch (e) {}
  fs.writeFileSync(OUT, trace.map(r => JSON.stringify(r)).join('\n') + '\n');
  console.log(JSON.stringify({ seed, days, kinds, maxTrust, entries, trustedOpen, living: roster.length, picks: trace.length, deaths }));
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
