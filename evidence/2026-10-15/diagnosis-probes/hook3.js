'use strict';
module.exports = function (G, T, inc) {
  T.trace = [];
  const day = () => ((G.state.scholar || {}).day) || 0;
  const pel = () => ((G.state.scholar || {}).inventory || []).filter(i => i && (i.itemId || i.id) === 'fusion_pellet').map(i => JSON.stringify(i).slice(0, 160));
  const _a = G.abilityOnAcquire;
  G.abilityOnAcquire = function (id) {
    if (id !== 'fusion_reactor') return _a.apply(this, arguments);
    T.trace.push({ d: day(), ev: 'acquire-before', pel: pel(), holder: G.state.fusionReactorHolder || null, vid: G.villagerId });
    const r = _a.apply(this, arguments);
    T.trace.push({ d: day(), ev: 'acquire-after', pel: pel(), holder: G.state.fusionReactorHolder || null });
    return r;
  };
  const _mb = G.mantleBecome;
  G.mantleBecome = function (o, n) {
    T.trace.push({ d: day(), ev: 'mantle-before', pel: pel() });
    const r = _mb.apply(this, arguments);
    T.trace.push({ d: day(), ev: 'mantle-after', pel: pel() });
    return r;
  };
  const _ed = G.endDay;
  G.endDay = function () {
    const p = pel(); if (p.length) T.trace.push({ d: day(), ev: 'eod', pel: p });
    return _ed.apply(this, arguments);
  };
};
