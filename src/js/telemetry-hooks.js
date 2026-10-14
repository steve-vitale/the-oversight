// @ontology
// system: telemetry-hooks
// description: Telemetry for the run's milestone events, which had none (sim audit 2026-10-14): table entry/path/fail/win, ability use, arc changes, scale rank changes, synergy activation, godhood ascension, titan fight results, village lost. Wraps existing functions; never changes their behaviour or return values. Feeds the sim harness and sweeps; in the browser it only appends to the existing capped telemetry ring.
// provides:
//   - teleMilestone(type, data)
// rules:
//   - observe_only: every wrap calls the original first and returns its result unchanged (code: telemetry-hooks.js)
//   - no_rng: no Math.random and no state writes except the telemetry ring and its own _teleSeen bookkeeping (code: telemetry-hooks.js)
// consumes:
//   - tele(), tableScene(), tableStartPath(), tableFail(), tableResolveFinal(), useAbility(), activateAbility(), checkArc(), recomputeActiveSynergies(), scaleRank(), endDay(), Pantheon.registerAscension(), titanResolveFight()
(function () {
  'use strict';
  const S = globalThis.Scattering;
  const G = S && S.Game;
  if (!G) return;

  G.teleMilestone = function (type, data) {
    try { if (this.tele) this.tele(type, data || {}); } catch (e) { console.warn('teleMilestone', type, e && e.message); }
  };

  // wrap(name, after): call the original, then after(this, args, result).
  function wrap(name, after) {
    const orig = G[name];
    if (typeof orig !== 'function') return;
    G[name] = function () {
      const r = orig.apply(this, arguments);
      try { after(this, arguments, r); } catch (e) { console.warn('telemetry-hooks', name, e && e.message); }
      return r;
    };
  }

  const tstate = (g) => { try { return g.tableState ? g.tableState() : {}; } catch (e) { return {}; } };
  const seen = (g) => { const pg = g.progState ? g.progState() : {}; return (pg._teleSeen = pg._teleSeen || {}); };

  wrap('tableScene', (g) => {
    const pg = g.progState(); const T = tstate(g);
    if (pg.tableDone && !seen(g).tableEntered) { seen(g).tableEntered = true; g.teleMilestone('table_entered', { seat: T.seat }); }
  });
  wrap('tableStartPath', (g, a) => { const T = tstate(g); g.teleMilestone('table_path', { path: a[0], branch: T.branch }); });
  wrap('tableFail', (g, a) => { const T = tstate(g); g.teleMilestone('table_failed', { path: T.path, branch: T.branch, reason: String(a[0] || '').slice(0, 80) }); });
  wrap('tableResolveFinal', (g) => {
    const T = tstate(g);
    if (g.won && !seen(g).tableWon) { seen(g).tableWon = true; const pg0 = g.progState ? g.progState() : {}; g.teleMilestone('table_won', { path: T.path, branch: T.branch, seat: T.seat, key: !!pg0.networkFallen, hosts: T.final === 'hosts', overtime: pg0.overtime | 0 }); }
  });
  wrap('useAbility', (g, a, r) => g.teleMilestone('ability_used', { id: a[0], action: a[1], ok: r !== false && r != null }));
  wrap('activateAbility', (g, a, r) => g.teleMilestone('ability_used', { id: a[0], action: 'activate', ok: r !== false && r != null }));
  wrap('checkArc', (g) => {
    const arc = (g.progState() || {}).arc || 1; const sn = seen(g);
    if (arc !== sn.arc) { sn.arc = arc; g.teleMilestone('arc', { arc }); }
  });
  wrap('recomputeActiveSynergies', (g) => {
    const act = ((g.state.scholar || {}).activeSynergies) || []; const sn = seen(g);
    sn.syn = sn.syn || {};
    for (const id of act) if (!sn.syn[id]) { sn.syn[id] = 1; g.teleMilestone('synergy_active', { id }); }
  });
  // daily: scale rank changes and the village-lost moment
  wrap('endDay', (g) => {
    const sn = seen(g);
    let rank = null; try { rank = g.scaleRank ? g.scaleRank() : null; } catch (e) {}
    if (rank && rank !== sn.rank) { if (sn.rank) g.teleMilestone('scale_rank', { from: sn.rank, to: rank }); sn.rank = rank; }
    if (g.villageLost && !sn.villageLost) { sn.villageLost = true; g.teleMilestone('village_lost', {}); }
  });
  // pantheon + titans live on S, not G
  try {
    const P = S.Pantheon;
    if (P && typeof P.registerAscension === 'function') {
      const o = P.registerAscension;
      P.registerAscension = function (game, info) {
        const r = o.apply(this, arguments);
        try { game.teleMilestone('ascension', { who: info && (info.kind || 'player'), godhood: info && info.godhoodId }); } catch (e) { console.warn('telemetry-hooks ascension', e && e.message); }
        return r;
      };
    }
  } catch (e) { console.warn('telemetry-hooks pantheon', e && e.message); }
})();
