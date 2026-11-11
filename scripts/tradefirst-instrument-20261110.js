// tradefirst-instrument-20261110.js — trade/market first-numbers recorder
// (arm sim-tradefirst-a, run fleshout-20261111T0315Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) ARRIVALS (considerStrangers wrap): visitors-list diff per call —
//       new arrivals with id/type/name/day/notability/flags
//       (entrepreneurial/shady/desperate/hostile/returningScammer).
//   (2) DEPARTURES (visitorDaily wrap): visitors-list diff per call —
//       who left, on which day, whether they were ever interacted with
//       (from the interact log).
//   (3) INTERACTIONS (visitorInteract wrap): every call — visId, how,
//       return, caller (membership-intake / conversation / policy / app
//       / direct — see classifyInteractCaller), trading/selling flags
//       after the call.
//   (4) CART (visitorWares wrap): every generation — visId, wares
//       (kind/itemId/name/price/units/kcalEach). Only generations are
//       recorded (the verb returns cached wares on repeat calls).
//   (5) BUYS (visitorBuyWare wrap): every call — visId, idx, ware
//       kind/itemId/name, quoted price, tab credit before/after,
//       tradesDone before/after, result.
//   (6) SELLS (traderSell wrap): every call — visId, packIdx, item
//       name/units, credit before/after, result. (The per-unit price
//       comes from the traderAppraise record on the same call.)
//   (7) PAYMENTS (traderPay wrap): every call — kcal asked, ok/short,
//       paid, taken list. Fires inside buy/sell — counted as payment
//       legs, never summed with buy/sell totals.
//   (8) APPRAISALS (traderAppraise wrap): every call — item key/name,
//       verdict, pricePerUnit, line (first 200 chars).
//   (9) RESIDENT TRADE (hawkerOffer / hawkerBuy wraps): every call —
//       vid, ware kind/name/price, result.
//  (10) RIVER ROUTE (evRiverTrader / feedRiverTrader /
//       tradeRiverTrader / snubRiverTrader wraps): every call —
//       expected 0 under the harness (drama is stubbed in sim-harness;
//       drama.js is excluded from the node load). Proven live in the
//       proof fixture; a 0 here is a real 0, not a dead wrap.
//  (11) DEEDS + SCAMS (recordMarketExchange / recordScam wraps):
//       every call — route/role/partner/item/price/packKcal/tabKcal/
//       pantryKcal, recorded-or-refused; scam who/kind/ware/paid/
//       discovered. Plus tele('godpath_deed') market_exchange events
//       as a cross-check.
//  (12) DAILY SNAPSHOT: visitors present (id/type/name/trading/
//       selling/credit/leavesDay/flags), hawkerStock (vid/ware
//       kind/name/price/sold), scholar.tradesDone, riverTrader state,
//       villageNotability, strangersHeard, pantry kcal, roster size.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-tradefirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence.
//
// Usage: const TF = require('./tradefirst-instrument-20261110');
//   const tf = TF.install(Game); tf.snapshot(); ... tf.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function parseFrame(line) {
  try {
    const m = String(line || '').match(/at (\S+?)(?: \(([^)]+)\))?$/);
    if (!m) return null;
    let fn = m[1] || '';
    let file = m[2] || '';
    if (fn.indexOf('.') !== -1) fn = fn.split('.').pop();
    return { fn: fn, file: file };
  } catch (e) { return null; }
}

// Caller of visitorInteract: the OUTERMOST named frame in the stack.
// membership.js = the thin-roster auto-intake ('invite'); conversation.js
// = the hawker/conversation branch; scripts/policies/ = a policy trade
// verb (none exists under competent — a hit here would be news); app.js
// = the UI button (dead in node); anything else with a real stack =
// 'direct' (fixture / engine-internal call). An empty or unparseable
// stack is 'other' and must be 0 in the pilot.
function classifyInteractCaller(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    const frames = [];
    for (const ln of lines) {
      if (ln.indexOf('tradefirst-instrument') !== -1) continue;
      const f = parseFrame(ln);
      if (!f) continue;
      if (f.fn === 'visitorInteract') continue;
      frames.push(f);
    }
    if (!frames.length) return 'other';
    for (let i = frames.length - 1; i >= 0; i--) {
      const file = frames[i].file || '';
      if (/membership\.js/.test(file)) return 'membership-intake';
      if (/conversation\.js/.test(file)) return 'conversation';
      if (/scripts\/policies\//.test(file)) return 'policy';
      if (/app\.js/.test(file)) return 'app';
    }
    return 'direct';
  } catch (e) { return 'other'; }
}

function visitorsCopy(Game) {
  const out = {};
  try {
    const vs = ((Game.state || {}).village || {}).visitors || [];
    for (const v of vs) {
      if (!v || !v.id) continue;
      out[v.id] = {
        id: v.id, type: v.type || null, name: v.name || null,
        day: (v.day === undefined ? null : v.day),
        leavesDay: (v.leavesDay === undefined ? null : v.leavesDay),
        trading: !!v.trading, selling: !!v.selling,
        credit: (v.credit === undefined ? 0 : v.credit),
        entrepreneurial: !!v.entrepreneurial, shady: !!v.shady,
        desperate: !!v.desperate, hostile: !!v.hostile,
        returningScammer: !!v.returningScammer,
        wares: (v.wares || []).map(function (w) {
          return { kind: w.kind || null, itemId: w.itemId || null, name: w.name || null, price: (w.price === undefined ? null : w.price), sold: !!w.sold };
        }),
      };
    }
  } catch (e) {}
  return out;
}

function install(Game) {
  const t = {
    arrivals: [],     // {day, id, type, name, notability, entrepreneurial, shady, desperate, hostile, returningScammer}
    departures: [],   // {day, id, type, name, leavesDay, interacted}
    interacts: [],    // {day, visId, how, ret, caller, stack, trading, selling}
    waresGenerated: [], // {day, visId, wares:[{kind,itemId,name,price,units,kcalEach}], tradesDone}
    buys: [],         // {day, visId, idx, kind, itemId, name, price, tabBefore, tabAfter, tradesDoneBefore, tradesDoneAfter, ret}
    sells: [],        // {day, visId, packIdx, name, units, creditBefore, creditAfter, tradesDoneAfter, ret}
    payments: [],     // {day, asked, ok, short, paid, taken:[{name,units,preserved,kcal}]}
    appraisals: [],   // {day, key, name, verdict, pricePerUnit, line}
    hawkerOffers: [], // {day, vid, kind, itemId, name, price, units, generated}
    hawkerBuys: [],   // {day, vid, kind, itemId, name, price, ret}
    river: [],        // {day, verb, arg, ret}
    marketExchanges: [], // {day, route, role, partner, item, price, packKcal, tabKcal, pantryKcal, recorded}
    scams: [],        // {day, who, kind, ware, paid, discovered}
    godpathDeeds: [], // {day, who, event, route, role, item}
    considerCalls: 0, visitorDailyCalls: 0,
    instrumentErrors: [],
    wrapLive: {},
  };
  const wrapped = {};

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { err(name + '-pre', e); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try {
          t.wrapLive[name] = true;
          if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre);
        } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  function visById(id) {
    try {
      const vs = ((Game.state || {}).village || {}).visitors || [];
      for (const v of vs) if (v && v.id === id) return v;
    } catch (e) {}
    return null;
  }
  function tradesDone() { try { return ((Game.state || {}).scholar || {}).tradesDone || 0; } catch (e) { return 0; } }

  // (1) considerStrangers — arrivals via visitors-list diff.
  wrapMethod('considerStrangers', {
    pre: function () {
      return { day: dayOf(Game), before: visitorsCopy(Game) };
    },
    post: function (args, r, threw, pre) {
      t.considerCalls++;
      try {
        const before = (pre && pre.before) || {};
        const after = visitorsCopy(Game);
        let notability = null;
        try { notability = (typeof Game.villageNotability === 'function') ? Game.villageNotability() : null; } catch (e) {}
        for (const id of Object.keys(after)) {
          if (!before[id]) {
            const a = after[id];
            t.arrivals.push({
              day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
              id: id, type: a.type, name: a.name, notability: notability,
              entrepreneurial: a.entrepreneurial, shady: a.shady,
              desperate: a.desperate, hostile: a.hostile,
              returningScammer: a.returningScammer,
            });
          }
        }
      } catch (e) { err('considerStrangers-record', e); }
    },
  });

  // (2) visitorDaily — departures via visitors-list diff.
  wrapMethod('visitorDaily', {
    pre: function () {
      return { day: dayOf(Game), before: visitorsCopy(Game) };
    },
    post: function (args, r, threw, pre) {
      t.visitorDailyCalls++;
      try {
        const before = (pre && pre.before) || {};
        const after = visitorsCopy(Game);
        const interactedIds = {};
        for (const ix of t.interacts) interactedIds[ix.visId] = true;
        for (const id of Object.keys(before)) {
          if (!after[id]) {
            const b = before[id];
            t.departures.push({
              day: dayOf(Game), id: id, type: b.type, name: b.name,
              leavesDay: b.leavesDay, interacted: !!interactedIds[id],
            });
          }
        }
      } catch (e) { err('visitorDaily-record', e); }
    },
  });

  // (3) visitorInteract — every call, caller-classified.
  wrapMethod('visitorInteract', {
    pre: function (args) {
      return { day: dayOf(Game), stack: stackText(3) };
    },
    post: function (args, r, threw, pre) {
      const vis = visById(args[0]);
      t.interacts.push({
        day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
        visId: args[0], how: args[1] || null,
        ret: (r === true ? true : (r === null ? null : (r ? 'truthy' : 'falsy'))),
        caller: classifyInteractCaller((pre && pre.stack) || ''),
        stack: ((pre && pre.stack) || '').split(' | ').slice(0, 4).join(' | '),
        trading: !!(vis && vis.trading), selling: !!(vis && vis.selling),
        threw: !!threw,
      });
    },
  });

  // (4) visitorWares — record only generations (no cached wares yet).
  wrapMethod('visitorWares', {
    pre: function (args) {
      const vis = visById(args[0]);
      return { day: dayOf(Game), hadWares: !!(vis && vis.wares && vis.wares.length) };
    },
    post: function (args, r, threw, pre) {
      try {
        if (pre && pre.hadWares) return; // cached — not a generation
        const wares = Array.isArray(r) ? r : [];
        t.waresGenerated.push({
          day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
          visId: args[0],
          wares: wares.map(function (w) {
            return { kind: w.kind || null, itemId: w.itemId || null, name: w.name || null, price: (w.price === undefined ? null : w.price), units: (w.units === undefined ? null : w.units), kcalEach: (w.kcalEach === undefined ? null : w.kcalEach) };
          }),
          tradesDone: tradesDone(),
        });
      } catch (e) { err('visitorWares-record', e); }
    },
  });

  // (5) visitorBuyWare — buys.
  wrapMethod('visitorBuyWare', {
    pre: function (args) {
      const vis = visById(args[0]);
      const wares = (vis && vis.wares) || [];
      const w = wares[args[1]] || null;
      return {
        day: dayOf(Game),
        ware: w ? { kind: w.kind || null, itemId: w.itemId || null, name: w.name || null, price: (w.price === undefined ? null : w.price) } : null,
        tabBefore: (vis && vis.credit) || 0, tradesDoneBefore: tradesDone(),
      };
    },
    post: function (args, r, threw, pre) {
      const vis = visById(args[0]);
      t.buys.push({
        day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
        visId: args[0], idx: args[1],
        kind: (pre && pre.ware ? pre.ware.kind : null),
        itemId: (pre && pre.ware ? pre.ware.itemId : null),
        name: (pre && pre.ware ? pre.ware.name : null),
        price: (pre && pre.ware ? pre.ware.price : null),
        tabBefore: (pre && pre.tabBefore !== undefined ? pre.tabBefore : null),
        tabAfter: (vis && vis.credit !== undefined ? vis.credit : null),
        tradesDoneBefore: (pre && pre.tradesDoneBefore !== undefined ? pre.tradesDoneBefore : null),
        tradesDoneAfter: tradesDone(),
        ret: (r === true ? true : (r === null ? null : (r ? 'truthy' : 'falsy'))),
        threw: !!threw,
      });
    },
  });

  // (6) traderSell — sells.
  wrapMethod('traderSell', {
    pre: function (args) {
      const vis = visById(args[0]);
      const inv = ((Game.state || {}).scholar || {}).inventory || [];
      const it = inv[args[1]] || null;
      return {
        day: dayOf(Game),
        item: it ? { name: it.name || null, units: (it.units === undefined ? null : it.units), kcalEach: (it.kcalEach === undefined ? null : it.kcalEach) } : null,
        creditBefore: (vis && vis.credit) || 0, tradesDoneBefore: tradesDone(),
      };
    },
    post: function (args, r, threw, pre) {
      const vis = visById(args[0]);
      t.sells.push({
        day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
        visId: args[0], packIdx: args[1],
        name: (pre && pre.item ? pre.item.name : null),
        units: (pre && pre.item ? pre.item.units : null),
        creditBefore: (pre && pre.creditBefore !== undefined ? pre.creditBefore : null),
        creditAfter: (vis && vis.credit !== undefined ? vis.credit : null),
        tradesDoneAfter: tradesDone(),
        ret: (r === true ? true : (r === null ? null : (r ? 'truthy' : 'falsy'))),
        threw: !!threw,
      });
    },
  });

  // (7) traderPay — payment legs.
  wrapMethod('traderPay', {
    pre: function (args) { return { day: dayOf(Game), asked: args[0] }; },
    post: function (args, r, threw, pre) {
      t.payments.push({
        day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
        asked: (pre && pre.asked !== undefined ? pre.asked : args[0]),
        ok: !!(r && r.ok), short: (r && typeof r.short === 'number' ? r.short : null),
        paid: (r && typeof r.paid === 'number' ? r.paid : null),
        taken: (r && Array.isArray(r.taken)) ? r.taken.map(function (x) { return { name: x.name || null, units: x.units || null, preserved: !!x.preserved, kcal: x.kcal || null }; }) : [],
        threw: !!threw,
      });
    },
  });

  // (8) traderAppraise — appraisal verdicts.
  wrapMethod('traderAppraise', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        const vis = args[0], it = args[1] || {};
        let key = null;
        try { key = (typeof Game.traderItemKey === 'function') ? Game.traderItemKey(it) : (it.itemId || it.plantId || it.name || null); } catch (e) { key = it.itemId || it.plantId || it.name || null; }
        t.appraisals.push({
          day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
          key: key, name: it.name || null,
          verdict: (r && r.verdict) || null,
          pricePerUnit: (r && typeof r.pricePerUnit === 'number' ? r.pricePerUnit : null),
          line: (r && typeof r.line === 'string' ? r.line.slice(0, 200) : null),
          threw: !!threw,
        });
        void vis;
      } catch (e) { err('traderAppraise-record', e); }
    },
  });

  // (9) Resident trade: hawkerOffer / hawkerBuy.
  wrapMethod('hawkerOffer', {
    pre: function (args) {
      const stock = (((Game.state || {}).village || {}).hawkerStock || {})[args[0]];
      return { day: dayOf(Game), hadWare: !!stock };
    },
    post: function (args, r, threw, pre) {
      try {
        const w = r || null;
        t.hawkerOffers.push({
          day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
          vid: args[0],
          kind: (w && w.kind) || null, itemId: (w && w.itemId) || null,
          name: (w && w.name) || null, price: (w && w.price !== undefined ? w.price : null),
          units: (w && w.units !== undefined ? w.units : null),
          generated: !(pre && pre.hadWare),
          threw: !!threw,
        });
      } catch (e) { err('hawkerOffer-record', e); }
    },
  });
  wrapMethod('hawkerBuy', {
    pre: function (args) {
      const stock = (((Game.state || {}).village || {}).hawkerStock || {})[args[0]];
      return {
        day: dayOf(Game),
        ware: stock ? { kind: stock.kind || null, itemId: stock.itemId || null, name: stock.name || null, price: (stock.price === undefined ? null : stock.price) } : null,
      };
    },
    post: function (args, r, threw, pre) {
      t.hawkerBuys.push({
        day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
        vid: args[0],
        kind: (pre && pre.ware ? pre.ware.kind : null),
        itemId: (pre && pre.ware ? pre.ware.itemId : null),
        name: (pre && pre.ware ? pre.ware.name : null),
        price: (pre && pre.ware ? pre.ware.price : null),
        ret: (r === true ? true : (r === null ? null : (r ? 'truthy' : 'falsy'))),
        threw: !!threw,
      });
    },
  });

  // (10) River route — expected dead under the harness (drama stubbed).
  ['evRiverTrader', 'feedRiverTrader', 'tradeRiverTrader', 'snubRiverTrader'].forEach(function (verb) {
    wrapMethod(verb, {
      pre: function (args) { return { day: dayOf(Game) }; },
      post: function (args, r, threw, pre) {
        t.river.push({
          day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
          verb: verb, arg: (args.length ? args[0] : null),
          ret: (r === true ? true : (r === null ? null : (r ? 'truthy' : 'falsy'))),
          threw: !!threw,
        });
      },
    });
  });

  // (11) Deeds + scams.
  wrapMethod('recordMarketExchange', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        const receipt = args[1] || {};
        t.marketExchanges.push({
          day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
          route: receipt.route || null, role: receipt.role || null,
          partner: receipt.partner || null, item: receipt.item || null,
          price: (typeof receipt.price === 'number' ? receipt.price : null),
          packKcal: (typeof receipt.packKcal === 'number' ? receipt.packKcal : null),
          tabKcal: (typeof receipt.tabKcal === 'number' ? receipt.tabKcal : null),
          pantryKcal: (typeof receipt.pantryKcal === 'number' ? receipt.pantryKcal : null),
          recorded: r === true, threw: !!threw,
        });
      } catch (e) { err('recordMarketExchange-record', e); }
    },
  });
  wrapMethod('recordScam', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        const entry = r || {};
        t.scams.push({
          day: (pre && pre.day !== undefined ? pre.day : dayOf(Game)),
          who: args[0] || null, kind: args[2] || null, ware: args[3] || null,
          paid: (typeof entry.paid === 'number' ? entry.paid : null),
          discovered: !!entry.discovered, threw: !!threw,
        });
      } catch (e) { err('recordScam-record', e); }
    },
  });
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] !== 'godpath_deed') return;
        const d = args[1] || {};
        if (d.event !== 'market_exchange') return;
        t.godpathDeeds.push({
          day: dayOf(Game), who: d.who || null, event: d.event || null,
          route: d.route || null, role: d.role || null, item: d.item || null,
        });
      } catch (e) { err('tele-record', e); }
    },
  });

  // (12) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      snap.visitors = visitorsCopy(Game);
      snap.visitorCount = Object.keys(snap.visitors).length;
      snap.traderPresent = Object.keys(snap.visitors).some(function (id) { return snap.visitors[id].type === 'trader'; });
    } catch (e) { snap.visitors = null; err('snap-visitors', e); }
    try {
      const stock = ((Game.state || {}).village || {}).hawkerStock || {};
      snap.hawkerStock = {};
      for (const vid of Object.keys(stock)) {
        const w = stock[vid] || {};
        snap.hawkerStock[vid] = { kind: w.kind || null, itemId: w.itemId || null, name: w.name || null, price: (w.price === undefined ? null : w.price), sold: !!w.sold };
      }
    } catch (e) { snap.hawkerStock = null; err('snap-hawker', e); }
    try { snap.tradesDone = tradesDone(); } catch (e) { snap.tradesDone = null; err('snap-tradesDone', e); }
    try {
      const rt = ((Game.state || {}).scholar || {}).riverTrader || null;
      snap.riverTrader = rt ? { day: rt.day || null, greeted: !!rt.greeted } : null;
      const rn = ((Game.state || {}).scholar || {}).riverNews || null;
      snap.riverNews = rn ? { topic: rn.topic || null } : null;
    } catch (e) { snap.riverTrader = null; err('snap-river', e); }
    try { snap.notability = (typeof Game.villageNotability === 'function') ? Game.villageNotability() : null; } catch (e) { snap.notability = null; }
    try { snap.strangersHeard = (((Game.state || {}).village || {}).betrayal || {}).strangersHeard || 0; } catch (e) { snap.strangersHeard = null; }
    try {
      const v = (Game.state || {}).village || {};
      snap.pantryKcal = (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
      snap.roster = (v.roster || []).length;
    } catch (e) { snap.pantryKcal = null; err('snap-pantry', e); }
    t.daily = t.daily || [];
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  t.daily = [];
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
  classifyInteractCaller: classifyInteractCaller,
};
