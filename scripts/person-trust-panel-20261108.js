// person-trust-panel-20261108.js — one ordinary competent panel for the
// person-trust proof. Own process (harness rule: never two loads in one
// node process). Prints one JSON line.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));

(async () => {
  const seed = 84101;
  const days = 30;
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const kinds = {};
  const orig = Game.objPick;
  if (typeof orig === 'function') {
    Game.objPick = function () {
      const o = orig.apply(this, arguments);
      try { if (o && o.kind) kinds[o.kind] = (kinds[o.kind] || 0) + 1; } catch (e) {}
      return o;
    };
  }
  const policy = require(path.join(REPO, 'scripts', 'policies', 'competent'));
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
  // Prefer the module census when present (same numbers; keeps the API live).
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
  console.log(JSON.stringify({ seed, days, kinds, maxTrust, entries, trustedOpen, living: roster.length }));
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
