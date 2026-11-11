// feastfirst-instrument-20261110.js — feast/tribute first-numbers recorder
// (arm sim-feastfirst-a, run fleshout-20261111T0646Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) FEASTS (hostFeast wrap): every feast report — day, quality,
//       spent kcal, served items, invited/showed/skipped (+why), star,
//       surgeSpent, bundle sheet, buffGranted, draw monster.
//   (2) PLANS (feastPlan wrap): every plan — ok/why, cost, have,
//       armed, bundle preview count. The refusal + affordability record.
//   (3) SURGE (grantFeastBuff wrap): grants (fresh/refresh), mult,
//       quality, draw; refusals with their honest why (devotion gate /
//       reactor ceiling). noteFeastedCombatUse: real combat spends.
//       drawFeastScavenger / faceFeastDraw / driveOffFeastDraw: the draw.
//   (4) BUNDLE BUY-OUT (feastBundleBuyOut wrap): 8,000 kcal buy-outs.
//   (5) DEVOTION (channelSentiment + channelReadyKeepsakes wraps):
//       keepsake channels, ready counts, arming path.
//   (6) TRIBUTE (payTribute + answerSystemFavor + villageDeal +
//       answerNationalChoice + answerGlobalChoice wraps): every tribute
//       verb. All are expected 0 under competent — proven live in
//       fixtures, so a pilot zero is a measured zero, not a dead wrap.
//   (7) PELLET (tele wrap, pellet_pass only): pellet passes from/to/day.
//   (8) PANTRY FLOWS (pantryDraw wrap, fishfirst-a pattern): every draw
//       by caller frame; feastPlan's pantry-COPY preview draw is tagged
//       preview:true and excluded from cost totals. _removePantryKcal:
//       tribute/favor kcal actually leaving the pantry, by caller.
//       stockPantry: deposits by name (feast-cost share backstop).
//   (9) DAILY SNAPSHOT: feastLog (full entries), prog.feastSurge +
//       surgeResonance, feastBuff state, pantry kcal, links ledger
//       (tributePaidWeek / tributePaidKcal / arrears / trust per link,
//       by direction), pellet holder, hungry count (hunger > 70),
//       pendingSystemFavor + systemFavorsOwed, ladder stage +
//       bundleBonus + bundleStages, standing total.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-feastfirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. hostFeast + feastLog are the
// backstops: if the grant/draw wraps are dead, the feast's quality,
// bundle and buff state are still counted from the report + log.
//
// Usage: const FI = require('./feastfirst-instrument-20261110');
//   const fi = FI.install(Game); fi.snapshot(); ... fi.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('feastfirst-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1].replace(/^Object\./, '');
    }
    return null;
  } catch (e) { return null; }
}

function install(Game) {
  const t = {
    feasts: [],      // {day, quality, qualityName, spent, served, showedN, invitedN, skipped, star, surgeSpent, bundle, buffGranted, draw, televised}
    plans: [],       // {day, ok, why, cost, have, armed, bundleCount, bundleComplete, heads}
    grants: [],      // {day, granted, refreshed, mult, quality, draw, why}
    buyouts: [],     // {day, ok, why, spent, bundleStage}
    surgeUses: [],   // {day}
    draws: [],       // {day, drawn, monsterId}
    drawFaces: [],   // {day, kind: 'face'|'driveOff', ret}
    channels: [],    // {day, idx, ret}
    keepsakeReady: [], // {day, n}
    tributes: [],    // {day, verb, arg, ret, paid}
    pelletPasses: [],// {day, from, to}
    pantryDraws: [], // {day, caller, preview, want, taken, byName, byState, cookedKcal}
    pantryRemovals: [], // {day, caller, want, paid}
    deposits: [],    // {day, name, kcal, caller}
    daily: [],       // snapshots
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

  function trustOf(vid) {
    try { const tr = ((Game.state || {}).village || {}).trust || {}; return tr[vid] === undefined ? 10 : tr[vid]; } catch (e) { return null; }
  }
  function personFor(vid) {
    try { if (typeof Game.getPerson === 'function') { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
    try { return ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; }) || {}; } catch (e) { return {}; }
  }

  // (1) hostFeast — the feast report.
  wrapMethod('hostFeast', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      const rep = r || {};
      t.feasts.push({
        day: (pre && pre.day) || dayOf(Game),
        ok: !!rep.ok, why: rep.why || null,
        quality: (typeof rep.quality === 'number' ? rep.quality : null),
        qualityName: rep.qualityName || null,
        spent: (typeof rep.spent === 'number' ? rep.spent : null),
        served: (rep.served || []).map(function (x) { return { itemId: x.itemId || null, kcal: x.kcal || 0 }; }),
        servedList: (rep.servedList || []).map(function (x) { return { name: x.name || null, units: x.units || 0, kcal: x.kcal || 0, meat: !!x.meat }; }),
        showedN: (rep.showed || []).length, invitedN: (rep.invited || []).length,
        showed: (rep.showed || []).slice(),
        skipped: (rep.skipped || []).map(function (x) { return { vid: x.vid || null, name: x.name || null, why: x.why || null }; }),
        star: rep.star || null,
        surgeSpent: (typeof rep.surgeSpent === 'number' ? rep.surgeSpent : null),
        bundle: rep.bundle ? { contributions: (rep.bundle.contributions || []).slice(), count: rep.bundle.count || 0, complete: !!rep.bundle.complete } : null,
        buffGranted: !!rep.buffGranted, draw: rep.draw || null,
        televised: !!rep.televised,
        factors: rep.factors || null,
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (2) feastPlan — refusals + affordability.
  wrapMethod('feastPlan', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      const p = r || {};
      t.plans.push({
        day: (pre && pre.day) || dayOf(Game),
        ok: !!p.ok, why: p.why || null,
        cost: (typeof p.cost === 'number' ? p.cost : null),
        have: (typeof p.have === 'number' ? p.have : null),
        armed: !!p.armed, heads: (typeof p.heads === 'number' ? p.heads : null),
        bundleCount: (p.bundle && typeof p.bundle.count === 'number' ? p.bundle.count : null),
        bundleComplete: !!(p.bundle && p.bundle.complete),
        bundleContributions: (p.bundle && p.bundle.contributions) ? p.bundle.contributions.slice() : null,
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (3) Surge: grant / spend / draw / face / drive-off.
  wrapMethod('grantFeastBuff', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      const g = r || {};
      t.grants.push({
        day: (pre && pre.day) || dayOf(Game),
        granted: !!g.granted, refreshed: !!g.refreshed,
        mult: (typeof g.mult === 'number' ? g.mult : null),
        quality: (typeof g.quality === 'number' ? g.quality : null),
        draw: g.draw || null, why: g.why || null,
        threw: !!threw,
      });
    },
  });
  wrapMethod('noteFeastedCombatUse', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.surgeUses.push({ day: (pre && pre.day) || dayOf(Game), ret: (r === undefined ? null : r), threw: !!threw });
    },
  });
  wrapMethod('drawFeastScavenger', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.draws.push({ day: (pre && pre.day) || dayOf(Game), drawn: !!(r && r.drawn), monsterId: (r && r.monsterId) || null, threw: !!threw });
    },
  });
  wrapMethod('faceFeastDraw', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.drawFaces.push({ day: (pre && pre.day) || dayOf(Game), kind: 'face', ret: (r === undefined ? null : (typeof r === 'object' ? 'obj' : r)), threw: !!threw });
    },
  });
  wrapMethod('driveOffFeastDraw', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.drawFaces.push({ day: (pre && pre.day) || dayOf(Game), kind: 'driveOff', ret: (r === undefined ? null : (typeof r === 'object' ? 'obj' : r)), threw: !!threw });
    },
  });

  // (4) Bundle buy-out.
  wrapMethod('feastBundleBuyOut', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      const b = r || {};
      t.buyouts.push({
        day: (pre && pre.day) || dayOf(Game),
        ok: !!b.ok, why: b.why || null,
        spent: (typeof b.spent === 'number' ? b.spent : null),
        bundleStage: (typeof b.bundleStage === 'number' ? b.bundleStage : null),
        threw: !!threw,
      });
    },
  });

  // (5) Devotion lane.
  wrapMethod('channelSentiment', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.channels.push({ day: (pre && pre.day) || dayOf(Game), idx: args[0], ret: (r === undefined ? null : (typeof r === 'object' ? 'obj' : r)), threw: !!threw });
    },
  });
  wrapMethod('channelReadyKeepsakes', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.keepsakeReady.push({ day: (pre && pre.day) || dayOf(Game), n: Array.isArray(r) ? r.length : null, threw: !!threw });
    },
  });

  // (6) Tribute verbs — expected 0 under competent.
  function tributeWrap(name, argPick) {
    wrapMethod(name, {
      pre: function (args) { return { day: dayOf(Game) }; },
      post: function (args, r, threw, pre) {
        t.tributes.push({
          day: (pre && pre.day) || dayOf(Game), verb: name,
          arg: argPick ? argPick(args) : null,
          ret: (r === undefined ? null : (typeof r === 'object' ? 'obj' : r)),
          paid: (typeof r === 'number' ? r : null),
          threw: !!threw,
        });
      },
    });
  }
  tributeWrap('payTribute', function (args) { return { linkId: args[0] || null, kcal: (typeof args[1] === 'number' ? args[1] : null) }; });
  tributeWrap('answerSystemFavor', function (args) { return { how: args[0] || null }; });
  tributeWrap('villageDeal', function (args) { return { villageId: args[0] || null, which: args[1] || null }; });
  tributeWrap('answerNationalChoice', function (args) { return { how: args[0] || null }; });
  tributeWrap('answerGlobalChoice', function (args) { return { how: args[0] || null }; });

  // (7) tele — pellet passes only.
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] === 'pellet_pass' && args[1]) {
          t.pelletPasses.push({ day: dayOf(Game), from: args[1].from || null, to: args[1].to || null, teleDay: args[1].day || null });
        }
      } catch (e) { err('tele-record', e); }
    },
  });

  // (8a) pantryDraw — caller-tagged; feastPlan's copy draw is preview.
  wrapMethod('pantryDraw', {
    pre: function (args) {
      const v = args[0] || {};
      const byObj = new Map();
      try {
        for (const it of (v.pantry || [])) byObj.set(it, { name: it.name || null, foodState: it.foodState || null });
      } catch (e) { err('pantryDraw-pre', e); }
      let preview = false;
      try { preview = (v !== ((Game.state || {}).village || {})); } catch (e) { preview = false; }
      return { day: dayOf(Game), stack: stackText(3), byObj: byObj, cook: !!(args[2] && args[2].cook), want: args[1], preview: preview };
    },
    post: function (args, r, threw, pre) {
      const byName = {};
      const byState = {};
      let cookedKcal = 0;
      try {
        for (const entry of ((r && r.items) || [])) {
          let nm, st;
          if (pre && pre.byObj && pre.byObj.has(entry.item)) {
            const rec = pre.byObj.get(entry.item) || {};
            nm = rec.name || 'unknown'; st = rec.foodState || 'none';
          } else {
            nm = (entry.item && entry.item.name) || 'unknown';
            st = (entry.item && entry.item.foodState) || 'unknown';
          }
          const k = (entry.units || 0) * (entry.effectiveKcal || 0);
          byName[nm] = (byName[nm] || 0) + k;
          byState[st] = (byState[st] || 0) + k;
          if (entry.cooked) cookedKcal += k;
        }
      } catch (e) { err('pantryDraw-post', e); }
      t.pantryDraws.push({
        day: (pre && pre.day) || dayOf(Game),
        cook: !!(pre && pre.cook), want: (pre && typeof pre.want === 'number' ? pre.want : null),
        taken: (r && typeof r.taken === 'number' ? r.taken : null),
        preview: !!(pre && pre.preview),
        byName: byName, byState: byState, cookedKcal: cookedKcal,
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (8b) _removePantryKcal — tribute/favor kcal leaving the pantry.
  wrapMethod('_removePantryKcal', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3), want: args[0] }; },
    post: function (args, r, threw, pre) {
      t.pantryRemovals.push({
        day: (pre && pre.day) || dayOf(Game),
        want: (pre && typeof pre.want === 'number' ? pre.want : null),
        paid: (typeof r === 'number' ? r : null),
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (8c) stockPantry — deposits by name.
  wrapMethod('stockPantry', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      t.deposits.push({
        day: (pre && pre.day) || dayOf(Game),
        name: args[1] || null,
        kcal: (typeof args[0] === 'number' ? args[0] : null),
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (9) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const v = (Game.state && Game.state.village) || {};
      const s = (Game.state && Game.state.scholar) || {};
      snap.feastLog = JSON.parse(JSON.stringify((Game.state || {}).feastLog || []));
    } catch (e) { snap.feastLog = null; err('snap-feastlog', e); }
    try {
      const s = (Game.state && Game.state.scholar) || {};
      snap.feastSurge = (s.prog && typeof s.prog.feastSurge !== 'undefined') ? s.prog.feastSurge : null;
      snap.feastSurgeUsed = !!(s.prog && s.prog.feastSurgeUsed);
      snap.feastBuff = null;
      try { snap.feastBuff = Game.feastedBuffState ? Game.feastedBuffState() : null; } catch (e) { snap.feastBuff = null; }
      snap.feastDay = (typeof s.feastDay === 'number' ? s.feastDay : null);
    } catch (e) { snap.feastSurge = null; err('snap-surge', e); }
    try {
      const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
      snap.surgeResonance = (pg && typeof pg.surgeResonance === 'number') ? pg.surgeResonance : null;
    } catch (e) { snap.surgeResonance = null; err('snap-resonance', e); }
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.pantryKcal = (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
      snap.rosterN = (v.roster || []).length;
      snap.livingN = (v.roster || []).filter(function (vid) {
        try { const p = personFor(vid); return p && !p.dead; } catch (e) { return false; }
      }).length;
    } catch (e) { snap.pantryKcal = null; err('snap-pantry', e); }
    try {
      const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.links = (links || []).filter(function (l) { return l && l.status === 'active'; }).map(function (l) {
        return {
          id: l.id || null, kind: l.kind || null,
          subordinate: l.subordinate || null, primary: l.primary || null,
          tributeKcalPerWeek: (typeof l.tributeKcalPerWeek === 'number' ? l.tributeKcalPerWeek : null),
          tributePaidWeek: (typeof l.tributePaidWeek === 'number' ? l.tributePaidWeek : null),
          tributePaidKcal: (typeof l.tributePaidKcal === 'number' ? l.tributePaidKcal : null),
          tributeWeek: (typeof l.tributeWeek === 'number' ? l.tributeWeek : null),
          arrears: (typeof l.arrears === 'number' ? l.arrears : null),
          trust: (typeof l.trust === 'number' ? l.trust : null),
        };
      });
    } catch (e) { snap.links = null; err('snap-links', e); }
    try {
      const st = Game.state || {};
      snap.pelletHolder = st.fusionReactorHolder || null;
      snap.pelletPass = st.pelletPass || null;
      // Hungry villagers at dawn-read time: living, present, non-bearer, hunger > 70.
      const v = st.village || {};
      const holder = st.fusionReactorHolder || {};
      const bearerVid = (holder.who === 'villager') ? holder.vid : (holder.who === 'player' ? Game.villagerId : null);
      let hungry = 0, hungriest = null, hungriestH = -1;
      for (const vid of (v.roster || [])) {
        if (!vid || vid === bearerVid) continue;
        if (v.away && v.away[vid]) continue;
        let p = null;
        try { p = personFor(vid); } catch (e) {}
        if (!p || p.dead) continue;
        let h = 0;
        try { h = ((Game.npcNeeds && Game.npcNeeds(vid)) || {}).hunger || 0; } catch (e) {}
        if (h > 70) { hungry++; if (h > hungriestH) { hungriestH = h; hungriest = vid; } }
      }
      snap.hungryCount = hungry;
      snap.hungriest = hungriest;
      snap.hungriestHunger = (hungry ? hungriestH : null);
      snap.reactorOnline = false;
      try { snap.reactorOnline = !!(Game.fusionReactorOnline && Game.fusionReactorOnline()); } catch (e) {}
    } catch (e) { snap.pelletHolder = null; err('snap-pellet', e); }
    try {
      snap.pendingSystemFavor = (Game.state || {}).pendingSystemFavor || null;
      snap.systemFavorsOwed = (typeof (Game.state || {}).systemFavorsOwed === 'number') ? Game.state.systemFavorsOwed : null;
    } catch (e) { snap.pendingSystemFavor = null; err('snap-favor', e); }
    try {
      const L = (typeof Game.villageLadder === 'function') ? Game.villageLadder() : null;
      snap.ladderStage = L ? (L.stage | 0) : null;
      snap.ladderTotal = L ? (L.total | 0) : null;
      snap.ladderCounted = L ? (L.counted | 0) : null;
      snap.bundleBonus = (L && L.detail && typeof L.detail.bundleBonus === 'number') ? L.detail.bundleBonus : null;
      snap.bundleStages = (L && L.detail && Array.isArray(L.detail.bundleStages)) ? L.detail.bundleStages.slice() : null;
    } catch (e) { snap.ladderStage = null; err('snap-ladder', e); }
    try {
      snap.standing = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null;
    } catch (e) { snap.standing = null; err('snap-standing', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
};
