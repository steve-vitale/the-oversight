#!/usr/bin/env node
// smoke-hidetrack-20261019.js — object-identity custody tracer for hides.
'use strict';
const WS = require('./probe-windowsurvive-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

async function runOne(seed, policyId, days) {
  const base = WS.policyFor(policyId);
  const policy = Object.assign({}, base);
  const C = { next: 1, reg: new Map(), moves: [], sayLines: [] }; // id -> {day, where}
  const whereOf = (G, obj) => {
    const inv = (G.state.scholar || {}).inventory || [];
    if (inv.includes(obj)) return 'pack';
    const ps = (G.state.scholar || {}).prepStash || [];
    if (ps.includes(obj)) return 'prepStash';
    return null;
  };
  const scan = (G) => {
    const out = new Map();
    const check = (arr, where) => { for (const it of (arr || [])) if (it && it.material === 'hide') out.set(it, where); };
    check((G.state.scholar || {}).inventory, 'pack');
    check((G.state.scholar || {}).prepStash, 'prepStash');
    return out;
  };
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    // tag hides at butcher time
    try {
      const orig = G.carcassToMeat.bind(G);
      G.carcassToMeat = function (inv, i, knows) {
        const before = new Set((inv || []).filter(x => x && x.material === 'hide'));
        const r2 = orig(inv, i, knows);
        try {
          const day = (G.state.scholar || {}).day;
          for (const it of (inv || [])) {
            if (it && it.material === 'hide' && !before.has(it)) {
              it._hideId = C.next++;
              C.reg.set(it._hideId, { born: day, bornWhere: inv === (G.state.scholar || {}).inventory ? 'pack' : 'prepStash', units: it.units });
            }
          }
        } catch (e) {}
        return r2;
      };
    } catch (e) {}
    // tag hides at corpse-take time
    try {
      const orig2 = G.corpseTakeItem.bind(G);
      G.corpseTakeItem = function (cid, idx) {
        const c = (G.corpses ? G.corpses() : []).find(x => x.id === cid);
        const it = c && (c.items || [])[idx];
        const r3 = orig2(cid, idx);
        try {
          if (r3 && it && it.material === 'hide' && !it._hideId) {
            it._hideId = C.next++;
            C.reg.set(it._hideId, { born: (G.state.scholar || {}).day, bornWhere: 'loot', units: it.units });
          }
        } catch (e) {}
        return r3;
      };
    } catch (e) {}
    try {
      const origSay = G.say.bind(G);
      G.say = function (msg) {
        try { if (typeof msg === 'string' && /hide|Hide|stash|Stash|counter|Counter/i.test(msg)) C.sayLines.push({ day: (G.state.scholar || {}).day, msg }); } catch (e) {}
        return origSay.apply(this, arguments);
      };
    } catch (e) {}
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    const day = (G.state.scholar || {}).day;
    const before = scan(G);
    const r = oDaily ? oDaily(G, ctx) : undefined;
    const after = scan(G);
    try {
      const afterById = new Map();
      for (const [obj, w] of after) afterById.set(obj._hideId, { obj, w });
      for (const [obj, w0] of before) {
        const id = obj._hideId;
        const rec = afterById.get(id);
        if (!rec) {
          C.moves.push({ day, id, from: w0, to: 'GONE', units: obj.units });
        } else if (rec.w !== w0) {
          C.moves.push({ day, id, from: w0, to: rec.w, units: obj.units });
        }
      }
    } catch (e) {}
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'hidetrack', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  console.log(`seed=${seed} days=${result.gameDays}`);
  for (const m of C.moves.slice(0, 30)) console.log(`  [d${m.day}] hide#${m.id} ${m.from} -> ${m.to} (${m.units}u)`);
  console.log(`  total moves: ${C.moves.length}; tagged hides: ${C.reg.size}`);
  return C;
}
(async () => {
  await runOne(63802, 'leadfeast', 60);
})();
