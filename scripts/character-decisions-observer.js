'use strict';

// Diagnostic only. Never grants builds, chooses actions, draws RNG or calls a
// gameplay query just to observe it. Caller owns the control replay.
function install(Game) {
  const bodies = [], handoffs = [], calls = [], errors = [];
  let active, parent = null;
  const copy = x => x == null ? null : JSON.parse(JSON.stringify(x));
  const observe = fn => {
    try { return fn(); }
    catch (e) { errors.push(String(e.stack || e)); return null; }
  };
  const snapshot = () => ({
    bearer: Game.villagerId, day: Game.state.scholar.day,
    abilities: copy(Game.state.scholar.abilities || []),
    tracks: copy(Game.state.scholar.tracks || {}),
    equipped: copy(Game.state.scholar.equipped || {}),
  });
  function body() {
    if (!active || active.bearer !== Game.villagerId) {
      active = { ...snapshot(), opportunities: {}, actionCalls: {} };
      bodies.push(active);
    }
    active.lastObservedDay = Game.state.scholar.day;
    return active;
  }
  function wrap(name, before, after) {
    const original = Game[name];
    if (typeof original !== 'function') return;
    Game[name] = function (...args) {
      const context = observe(() => before?.(args));
      // Observation failures must never prevent the real method executing.
      const result = original.apply(this, args);
      observe(() => after?.(args, result, context));
      return result;
    };
  }
  wrap('newGame', null, () => { active = null; body(); });
  wrap('mantleBecome', args => {
    const v = Game.state.village, id = args[1];
    const person = Array.isArray(v.rosterChars)
      ? v.rosterChars.find(p => p.id === id) : v.rosterChars?.[id];
    // ledger switches Game.villagerId BEFORE importing the incoming kit.
    // Opening a body here would label the dead person's kit as the successor.
    if (active) active.lastObservedDay = Game.state.scholar.day;
    return { oldId: args[0], newId: id, day: Game.state.scholar.day,
      resident: (v.roster || []).includes(id),
      abilities: copy(v.npcAbilities?.[id] || []),
      tracks: copy(v.npcXp?.[id] || {}), goal: person?.goal ?? null };
  }, (args, result, before) => {
    handoffs.push({ before, returned: result, after: snapshot() });
    active = null;
    body();
  });
  wrap('activatableAbilities', null, (args, result) => {
    const b = body();
    for (const a of result || []) {
      if (!a?.actionId) continue;
      const key = a.abilityId + '.' + a.actionId;
      const o = b.opportunities[key] || (b.opportunities[key] = {
        queries: 0, availableQueries: 0, combat: !!a.combat,
        firstDay: Game.state.scholar.day, lastDay: Game.state.scholar.day,
      });
      o.queries++;
      if (a.available) o.availableQueries++;
      o.lastDay = Game.state.scholar.day;
    }
  });
  // Record nested routes separately: useAbility -> cultivateGarden is ONE
  // selected action, not two independent decisions. Undefined returns remain
  // unknown; they are not automatically failures or successful effects.
  for (const method of ['useAbility', 'activateAbility', 'craft', 'tendVillager',
    'treatVillager', 'visitorBuyWare', 'cultivateGarden', 'harvestGarden', 'tbPlayerStrike']) {
    const original = Game[method];
    if (typeof original !== 'function') continue;
    Game[method] = function (...args) {
      const previous = parent;
      const c = observe(() => {
        const b = body(), s = Game.state.scholar;
        const key = method === 'useAbility' ? args[0] + '.' + args[1]
          : method === 'activateAbility' ? args[0] + '.legacy' : method;
        const call = { index: calls.length, parent: previous, method, key,
          args: args.filter(x => typeof x === 'string' || typeof x === 'number'),
          before: { bearer: Game.villagerId, day: s.day, tick: s.dayTicks, hp: s.health, kcal: s.kcal } };
        calls.push(call);
        b.actionCalls[key] = (b.actionCalls[key] || 0) + 1;
        return call;
      });
      if (c) parent = c.index;
      let result;
      try { result = original.apply(this, args); }
      finally { parent = previous; }
      observe(() => {
        if (!c) return;
        const s = Game.state.scholar;
        c.after = { bearer: Game.villagerId, day: s.day, tick: s.dayTicks, hp: s.health, kcal: s.kcal };
        c.returned = result === true || result?.ok === true ? 'success'
          : result === false || result?.ok === false ? 'refused' : 'unknown';
      });
      return result;
    };
  }
  return { report() {
    observe(() => { if (Game.state?.scholar) body(); });
    return { version: 1, bodies, handoffs, calls, errors,
      scope: 'Passive query/call exposure; no effectiveness or playstyle-viability verdict. Query counts are not unique turns. Initial kits are snapshots, not lifetime ownership.',
      terminal: { over: !!Game.over, won: !!Game.won, villageLost: !!Game.villageLost, day: Game.state?.scholar?.day } };
  } };
}

module.exports = { install };
